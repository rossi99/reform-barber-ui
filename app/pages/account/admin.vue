<script setup lang="ts">
definePageMeta({ accountRole: 'Admin · Site' })
useHead({ title: 'Admin — RE:FORM Hair & Culture' })

const { user, logout } = useAuth()
const api = useApiFetch()
const toast = useToast()

// ===== Jump nav scrollspy =====
const sectionIds = ['overview', 'users', 'bookings', 'services', 'mine'] as const
const sectionLabels: Record<typeof sectionIds[number], string> = {
  overview: 'Overview',
  users: 'Users & Roles',
  bookings: 'Bookings',
  services: 'Services',
  mine: 'Book a Cut',
}
const activeSection = ref<typeof sectionIds[number]>('overview')

onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null)
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) activeSection.value = e.target.id as typeof sectionIds[number]
    }
  }, { rootMargin: '-30% 0px -60% 0px' })
  sections.forEach(s => io.observe(s))
  onBeforeUnmount(() => io.disconnect())
})

// ===== Overview / stats =====
interface Stats {
  from: string
  to: string
  confirmedCount: number
  cancelledCount: number
  completedCount: number
  totalPence: number
}

const stats = ref<Stats | null>(null)
const statsLoading = ref(false)
const fromInput = ref('')
const toInput = ref('')

async function loadStats() {
  statsLoading.value = true
  try {
    const query: Record<string, string> = {}
    if (fromInput.value) query.from = fromInput.value
    if (toInput.value) query.to = toInput.value
    const data = await api<Stats>('/api/admin/stats', { query })
    stats.value = data
    fromInput.value = data.from
    toInput.value = data.to
  } catch {
    toast.error('Could not load site stats')
  } finally {
    statsLoading.value = false
  }
}

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

// ===== Users & roles =====
type Role = 'customer' | 'barber' | 'founder' | 'admin'
const ROLES: Role[] = ['customer', 'barber', 'founder', 'admin']

interface ApiUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: Role
  created_at: string
}

const users = ref<ApiUser[]>([])
const usersLoading = ref(false)
const savingUserId = ref<string | null>(null)

async function loadUsers() {
  usersLoading.value = true
  try {
    users.value = await api<ApiUser[]>('/api/admin/users')
  } catch {
    toast.error('Could not load users')
  } finally {
    usersLoading.value = false
  }
}

async function changeRole(u: ApiUser, newRole: Role) {
  if (newRole === u.role) return
  const previous = u.role
  savingUserId.value = u.id
  u.role = newRole
  try {
    await api(`/api/admin/users/${u.id}/role`, { method: 'PATCH', body: { role: newRole } })
    toast.success(`${u.email} is now ${newRole}`)
  } catch (err: any) {
    u.role = previous
    const message = err?.data?.error ?? 'Could not update role'
    toast.error(message)
  } finally {
    savingUserId.value = null
  }
}

const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)

// ===== Bookings (shop-wide, via the founder-scoped endpoint) =====
interface ApiBooking {
  id: string
  reference: string
  user_id: string | null
  barber_id: string
  service_id: string
  date: string | null
  time_start: string
  time_end: string
  status: 'confirmed' | 'cancelled' | 'completed'
  created_at: string | null
  cancelled_at: string | null
  barber_name: string
  first_name: string | null
  last_name: string | null
  service_name: string
}

interface Barber { id: string; name: string; title: string }

const bookings = ref<ApiBooking[]>([])
const bookingsLoading = ref(false)
const barbers = ref<Barber[]>([])
const bookingStatusFilter = ref<'all' | 'confirmed' | 'cancelled' | 'completed'>('confirmed')
const bookingBarberFilter = ref<string>('all')
const bookingDateFilter = ref<string>('')
const cancellingId = ref<string | null>(null)

async function loadBarbers() {
  try {
    barbers.value = await api<Barber[]>('/api/barbers')
  } catch {
    // non-fatal — barber filter just won't populate
  }
}

async function loadBookings() {
  bookingsLoading.value = true
  try {
    const query: Record<string, string> = {}
    if (bookingStatusFilter.value !== 'all') query.status = bookingStatusFilter.value
    if (bookingBarberFilter.value !== 'all') query.barber = bookingBarberFilter.value
    if (bookingDateFilter.value) query.date = bookingDateFilter.value
    bookings.value = await api<ApiBooking[]>('/api/founder/bookings', { query })
  } catch {
    toast.error('Could not load bookings')
  } finally {
    bookingsLoading.value = false
  }
}

async function cancelBooking(b: ApiBooking) {
  if (b.status !== 'confirmed') return
  cancellingId.value = b.id
  try {
    await api(`/api/me/bookings/${b.id}/cancel`, { method: 'POST' })
    b.status = 'cancelled'
    toast.success(`${b.reference} cancelled`)
  } catch {
    toast.error('Could not cancel booking')
  } finally {
    cancellingId.value = null
  }
}

function clientName(b: ApiBooking): string {
  const name = [b.first_name, b.last_name].filter(Boolean).join(' ')
  return name || 'Guest'
}

// ===== Services (inherits founder's real service-management endpoints) =====
interface ApiService {
  id: string
  num: string
  name: string
  name_html: string
  description: string
  duration: number
  price: number
  published: boolean
}

interface Svc {
  id: string
  num: string
  name: string
  nameHtml: string
  desc: string
  durationMins: number
  pricePence: number
  published: boolean
  orig: { name: string; durationMins: number; pricePence: number }
  saving: boolean
}

const services = ref<Svc[]>([])
const servicesLoading = ref(false)

function toSvc(s: ApiService): Svc {
  return {
    id: s.id,
    num: s.num,
    name: s.name,
    nameHtml: s.name_html,
    desc: s.description,
    durationMins: s.duration,
    pricePence: s.price,
    published: s.published,
    orig: { name: s.name, durationMins: s.duration, pricePence: s.price },
    saving: false,
  }
}

async function loadServices() {
  servicesLoading.value = true
  try {
    const rows = await api<ApiService[]>('/api/founder/services')
    services.value = rows.map(toSvc)
  } catch {
    toast.error('Could not load the service menu')
  } finally {
    servicesLoading.value = false
  }
}

function svcDirty(s: Svc): boolean {
  return s.name !== s.orig.name || s.durationMins !== s.orig.durationMins || s.pricePence !== s.orig.pricePence
}

async function saveSvc(s: Svc) {
  s.saving = true
  try {
    await api(`/api/founder/services/${s.id}`, {
      method: 'PUT',
      body: {
        num: s.num,
        name: s.name,
        nameHtml: s.nameHtml,
        description: s.desc,
        duration: s.durationMins,
        price: s.pricePence,
        active: s.published,
      },
    })
    s.orig = { name: s.name, durationMins: s.durationMins, pricePence: s.pricePence }
    toast.success(`${s.name} saved`)
  } catch {
    toast.error('Could not save service')
  } finally {
    s.saving = false
  }
}

async function togglePublish(s: Svc) {
  const next = !s.published
  try {
    await api(`/api/founder/services/${s.id}/publish`, { method: 'PATCH', body: { published: next } })
    s.published = next
    toast.success(`${s.name} ${next ? 'published' : 'unpublished'}`)
  } catch {
    toast.error('Could not update publish state')
  }
}

// ===== Book a cut — admin's own bookings, like a customer =====
interface MyBooking {
  id: string
  reference: string
  barber_name: string
  service_name: string
  date: string | null
  time_start: string
  status: 'confirmed' | 'cancelled' | 'completed'
}

const myBookings = ref<MyBooking[]>([])
const myBookingsLoading = ref(false)
const cancellingMineId = ref<string | null>(null)

async function loadMyBookings() {
  myBookingsLoading.value = true
  try {
    myBookings.value = await api<MyBooking[]>('/api/me/bookings')
  } catch {
    toast.error('Could not load your bookings')
  } finally {
    myBookingsLoading.value = false
  }
}

async function cancelMyBooking(b: MyBooking) {
  if (b.status !== 'confirmed') return
  cancellingMineId.value = b.id
  try {
    await api(`/api/me/bookings/${b.id}/cancel`, { method: 'POST' })
    b.status = 'cancelled'
    toast.success(`${b.reference} cancelled`)
  } catch {
    toast.error('Could not cancel booking')
  } finally {
    cancellingMineId.value = null
  }
}

onMounted(() => {
  loadStats()
  loadUsers()
  loadBarbers()
  loadBookings()
  loadServices()
  loadMyBookings()
})

watch([bookingStatusFilter, bookingBarberFilter, bookingDateFilter], loadBookings)
</script>

<template>
  <main class="admin-main">
    <!-- ===== HEAD ===== -->
    <header class="ledger-head">
      <div class="ledger-head__inner">
        <div class="topline">
          <div class="label">— Vol<span class="colon">:</span> 00 / Admin</div>
          <div class="label">Signed in as {{ user?.firstName || 'Admin' }} <span class="colon">·</span> <a href="#" @click.prevent="logout()">Logout →</a></div>
        </div>

        <h1>The <em>bridge.</em></h1>
        <p class="greeting">The whole site, one view — <span class="brass-accent">users, bookings, the menu</span>, and your own chair time.</p>

        <div class="meta-strip">
          <div class="cell"><span class="k">Revenue <small class="cell-sub">— {{ stats?.from }} → {{ stats?.to }}</small></span><span class="v"><span class="brass-accent">£</span>{{ stats ? (stats.totalPence / 100).toFixed(2) : '—' }}</span></div>
          <div class="cell"><span class="k">Confirmed</span><span class="v">{{ stats?.confirmedCount ?? '—' }}</span></div>
          <div class="cell"><span class="k">Cancelled</span><span class="v">{{ stats?.cancelledCount ?? '—' }}</span></div>
          <div class="cell"><span class="k">Users on file</span><span class="v">{{ users.length || '—' }}</span></div>
          <div class="cell"><span class="k">Admins</span><span class="v">{{ adminCount || '—' }}</span></div>
          <div class="cell action"><a class="btn btn--solid" href="#users">Manage Users <span class="arrow">→</span></a></div>
        </div>

        <span class="ledger-head__mono">:</span>
      </div>
    </header>

    <!-- ===== JUMP NAV ===== -->
    <nav class="jump">
      <div class="jump__inner">
        <a v-for="(id, i) in sectionIds" :key="id" :href="`#${id}`" :class="{ active: activeSection === id }">
          <span class="n">{{ String(i + 1).padStart(2, '0') }}</span>
          {{ sectionLabels[id] }}
        </a>
      </div>
    </nav>

    <!-- ===== OVERVIEW ===== -->
    <section id="overview" class="sec sec--alt">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">— 01 / Overview</div>
          <h2>The<br />numbers<span class="colon">.</span></h2>
          <div class="aside">
            <span>
              <input v-model="fromInput" type="date" class="date-in" />
              <span class="colon">→</span>
              <input v-model="toInput" type="date" class="date-in" />
            </span>
            <button class="btn btn--ghost" type="button" :disabled="statsLoading" @click="loadStats">
              {{ statsLoading ? 'Loading…' : 'Apply range' }}
            </button>
          </div>
        </div>

        <div class="kpis">
          <div class="kpi">
            <span class="k">Revenue</span>
            <span class="v"><span class="currency">£</span>{{ stats ? (stats.totalPence / 100).toFixed(2) : '0.00' }}</span>
          </div>
          <div class="kpi">
            <span class="k">Confirmed bookings</span>
            <span class="v">{{ stats?.confirmedCount ?? 0 }}</span>
          </div>
          <div class="kpi">
            <span class="k">Completed</span>
            <span class="v">{{ stats?.completedCount ?? 0 }}</span>
          </div>
          <div class="kpi">
            <span class="k">Cancelled</span>
            <span class="v">{{ stats?.cancelledCount ?? 0 }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== USERS & ROLES ===== -->
    <section id="users" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">— 02 / Users &amp; Roles</div>
          <h2>Who's<br />signed in<span class="colon">.</span></h2>
          <div class="aside"><span><b>{{ users.length }}</b> on file</span><span>{{ adminCount }} admin{{ adminCount === 1 ? '' : 's' }}</span></div>
        </div>

        <div class="user-table">
          <div class="user-row head">
            <span>Name</span><span>Email</span><span>Role</span><span>Joined</span>
          </div>
          <div v-for="u in users" :key="u.id" class="user-row" :class="{ 'is-self': u.id === user?.id }">
            <span class="cell-name">
              {{ [u.first_name, u.last_name].filter(Boolean).join(' ') || '—' }}
              <small v-if="u.id === user?.id" class="you-tag">You</small>
            </span>
            <span class="cell-email">{{ u.email }}</span>
            <span>
              <select
                class="role-select"
                :value="u.role"
                :disabled="savingUserId === u.id"
                @change="changeRole(u, ($event.target as HTMLSelectElement).value as Role)"
              >
                <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
              </select>
            </span>
            <span class="cell-date">{{ new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }}</span>
          </div>
        </div>
        <div v-if="usersLoading" class="loading-note">Loading users…</div>
        <div v-else-if="users.length === 0" class="loading-note">No users yet.</div>
      </div>
    </section>

    <!-- ===== BOOKINGS ===== -->
    <section id="bookings" class="sec sec--alt">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">— 03 / Bookings</div>
          <h2>Every<br />chair<span class="colon">.</span></h2>
          <div class="aside"><span><b>{{ bookings.length }}</b> shown</span></div>
        </div>

        <div class="diary-bar">
          <div class="filters" role="tablist">
            <button :class="{ active: bookingStatusFilter === 'confirmed' }" @click="bookingStatusFilter = 'confirmed'">Confirmed</button>
            <button :class="{ active: bookingStatusFilter === 'completed' }" @click="bookingStatusFilter = 'completed'">Completed</button>
            <button :class="{ active: bookingStatusFilter === 'cancelled' }" @click="bookingStatusFilter = 'cancelled'">Cancelled</button>
            <button :class="{ active: bookingStatusFilter === 'all' }" @click="bookingStatusFilter = 'all'">All</button>
          </div>
          <div class="diary-scope">
            <select v-model="bookingBarberFilter" class="role-select">
              <option value="all">All chairs</option>
              <option v-for="b in barbers" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
            <input v-model="bookingDateFilter" type="date" class="date-in" />
          </div>
        </div>

        <div>
          <article v-for="b in bookings" :key="b.id" class="appt" :data-status="b.status">
            <div class="appt__date">
              <span class="dow">{{ b.date }}</span>
              <span class="m">{{ b.time_start }} — {{ b.time_end }}</span>
            </div>
            <div class="appt__svc">
              <span class="num">/ {{ b.reference }}</span>
              <h3>{{ b.service_name }}</h3>
            </div>
            <div class="appt__col">
              <span class="k">Client</span>
              <span class="v">{{ clientName(b) }}</span>
            </div>
            <div class="appt__col">
              <span class="k">Chair</span>
              <span class="v">{{ b.barber_name }}</span>
            </div>
            <div class="appt__action">
              <span v-if="b.status === 'confirmed'" class="pill is-upcoming"><span class="dot"></span>Confirmed</span>
              <span v-else-if="b.status === 'cancelled'" class="pill is-cancelled"><span class="dot"></span>Cancelled</span>
              <span v-else class="pill"><span class="dot"></span>Completed</span>
              <div class="appt__actions">
                <button
                  v-if="b.status === 'confirmed'"
                  class="btn btn--ghost"
                  type="button"
                  :disabled="cancellingId === b.id"
                  @click="cancelBooking(b)"
                >
                  {{ cancellingId === b.id ? 'Cancelling…' : 'Cancel' }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-if="bookingsLoading" class="loading-note">Loading bookings…</div>
        <div v-else-if="bookings.length === 0" class="diary-empty">
          <div class="lede">Nothing here<span class="colon">.</span></div>
          <div class="sub">Try a different filter above.</div>
        </div>
      </div>
    </section>

    <!-- ===== SERVICES ===== -->
    <section id="services" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">— 04 / The Menu</div>
          <h2>Services<br /><em>priced</em><span class="colon">.</span></h2>
          <div class="aside"><span><b>{{ services.filter(s => s.published).length }} live</b></span><span>{{ services.length }} total</span></div>
        </div>

        <div class="svc-list">
          <div v-for="s in services" :key="s.id" class="svc-row">
            <span class="num">/ {{ s.num }}</span>
            <input class="svc-name" v-model="s.name" />
            <input class="svc-dur" v-model.number="s.durationMins" type="number" min="5" step="5" />
            <input class="svc-price" v-model.number="s.pricePence" type="number" min="0" step="50" />
            <div class="controls">
              <button
                class="btn btn--ghost btn--publish"
                type="button"
                @click="togglePublish(s)"
              >
                {{ s.published ? 'Unpublish' : 'Publish' }}
              </button>
              <button
                v-if="svcDirty(s)"
                class="btn btn--ghost btn--save"
                type="button"
                :disabled="s.saving"
                @click="saveSvc(s)"
              >
                {{ s.saving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="servicesLoading" class="loading-note">Loading services…</div>
      </div>
    </section>

    <!-- ===== BOOK A CUT ===== -->
    <section id="mine" class="sec sec--alt">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">— 05 / Book a Cut</div>
          <h2>Your own<br />chair time<span class="colon">.</span></h2>
          <div class="aside"><span><NuxtLink class="btn btn--solid" to="/book">Book Now <span class="arrow">→</span></NuxtLink></span></div>
        </div>

        <div>
          <article v-for="b in myBookings" :key="b.id" class="appt" :data-status="b.status">
            <div class="appt__date">
              <span class="dow">{{ b.date }}</span>
              <span class="m">{{ b.time_start }}</span>
            </div>
            <div class="appt__svc">
              <span class="num">/ {{ b.reference }}</span>
              <h3>{{ b.service_name }}</h3>
            </div>
            <div class="appt__col">
              <span class="k">Chair</span>
              <span class="v">{{ b.barber_name }}</span>
            </div>
            <div class="appt__action">
              <span v-if="b.status === 'confirmed'" class="pill is-upcoming"><span class="dot"></span>Confirmed</span>
              <span v-else-if="b.status === 'cancelled'" class="pill is-cancelled"><span class="dot"></span>Cancelled</span>
              <span v-else class="pill"><span class="dot"></span>Completed</span>
              <div class="appt__actions">
                <button
                  v-if="b.status === 'confirmed'"
                  class="btn btn--ghost"
                  type="button"
                  :disabled="cancellingMineId === b.id"
                  @click="cancelMyBooking(b)"
                >
                  {{ cancellingMineId === b.id ? 'Cancelling…' : 'Cancel' }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-if="myBookingsLoading" class="loading-note">Loading your bookings…</div>
        <div v-else-if="myBookings.length === 0" class="diary-empty">
          <div class="lede">No bookings yet<span class="colon">.</span></div>
          <div class="sub">Head to <b>Book Now</b> above to grab a chair.</div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-main { flex: 1; padding-top: 80px; }
.colon { color: var(--brass); }
.brass-accent { color: var(--brass); }
.btn .arrow { transition: transform .25s ease; }
.btn:hover .arrow { transform: translateX(4px); }
.btn--publish { border-color: var(--bone); color: var(--bone); }
.btn--publish:hover { background: var(--bone); color: var(--ink); border-color: var(--bone); }
.btn--save { border-color: var(--brass); color: var(--brass); }
.btn--save:hover { background: var(--brass); color: var(--ink); border-color: var(--brass); }
.btn--save:disabled, .btn--publish:disabled { opacity: 0.55; cursor: default; }

.wrap { max-width: 1320px; margin: 0 auto; padding: 0 36px; }
.sec { padding: 80px 0; border-bottom: 1px solid var(--rule); }
.sec-head {
  display: grid; grid-template-columns: auto 1fr auto; gap: 40px; align-items: end;
  padding-bottom: 28px; border-bottom: 1px solid var(--rule);
  margin-bottom: 40px;
}
.sec-head .num { font-size: 12px; letter-spacing: 0.2em; color: var(--bone-dim); }
.sec-head h2 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(36px, 4.5vw, 64px); line-height: 0.95; letter-spacing: -0.015em;
}
.sec-head h2 em { font-style: italic; color: var(--brass); }
.sec-head .aside { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); display: flex; gap: 16px; align-items: center; }
.sec-head .aside b { color: var(--bone); font-weight: 500; }

/* ========== HEAD ========== */
.ledger-head { padding: 80px 36px 0; border-bottom: 1px solid var(--rule); position: relative; overflow: hidden; }
.ledger-head__inner { max-width: 1320px; margin: 0 auto; position: relative; }
.topline { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
.label { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.ledger-head h1 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(56px, 7.5vw, 128px); line-height: 0.92; letter-spacing: -0.02em;
}
.ledger-head h1 em { font-style: italic; color: var(--brass); }
.greeting { font-family: var(--serif); font-size: 22px; color: var(--bone-dim); margin-top: 24px; max-width: 60ch; }

.meta-strip {
  display: grid; grid-template-columns: repeat(5, 1fr) auto;
  border-top: 1px solid var(--rule); margin-top: 64px;
}
.meta-strip .cell { padding: 22px 26px 24px; border-right: 1px solid var(--rule); display: flex; flex-direction: column; gap: 10px; }
.meta-strip .cell:last-child { border-right: 0; }
.meta-strip .cell .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.meta-strip .cell .v { font-family: var(--serif); font-size: 22px; line-height: 1.1; }
.meta-strip .cell.action { padding: 22px 26px; align-items: flex-end; justify-content: center; }
.cell-sub { font-family: var(--grot); font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--bone-dim); }

.ledger-head__mono {
  position: absolute; right: -40px; top: -40px;
  font-family: var(--serif); font-size: 320px; line-height: 0.8;
  color: rgba(var(--brass-rgb), 0.045);
  pointer-events: none; user-select: none; letter-spacing: -0.04em;
}

/* ========== JUMP NAV ========== */
.jump {
  position: sticky; top: 78px; z-index: 40;
  background: rgba(var(--ink-rgb), 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rule);
  overflow-x: auto; -webkit-overflow-scrolling: touch;
}
.jump__inner { max-width: 1320px; margin: 0 auto; padding: 0 36px; display: flex; }
.jump a {
  flex-shrink: 0;
  padding: 18px 22px;
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600;
  color: var(--bone-dim);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color .25s ease, border-color .25s ease;
  display: inline-flex; align-items: baseline; gap: 8px;
}
.jump a:hover { color: var(--bone); }
.jump a.active { color: var(--bone); border-bottom-color: var(--brass); }
.jump a .n { font-family: var(--serif); font-weight: 400; font-size: 13px; letter-spacing: 0; color: var(--brass); }

/* ========== KPIs ========== */
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid var(--rule); border-top: 1px solid var(--rule); }
.kpi { padding: 36px 32px; border-right: 1px solid var(--rule); display: flex; flex-direction: column; gap: 16px; }
.kpi:last-child { border-right: 0; }
.kpi .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.kpi .v {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(40px, 4.2vw, 64px); line-height: 1; letter-spacing: -0.02em;
}
.kpi .v .currency { color: var(--brass); margin-right: 2px; }

.date-in {
  background: transparent; border: 1px solid var(--rule); color: var(--bone);
  padding: 6px 10px; font-family: var(--grot); font-size: 11px;
  outline: none;
}
.date-in:focus { border-color: var(--brass); }

/* ========== USERS ========== */
.user-table { border-top: 1px solid var(--rule); }
.user-row {
  display: grid;
  grid-template-columns: 1.2fr 1.6fr 160px 140px;
  gap: 24px; padding: 18px 0;
  border-bottom: 1px solid var(--rule);
  align-items: center;
}
.user-row.head { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); padding: 14px 0; }
.user-row.is-self { background: rgba(var(--brass-rgb), 0.04); }
.cell-name { font-family: var(--serif); font-size: 18px; display: flex; align-items: center; gap: 10px; }
.you-tag { font-family: var(--grot); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--brass); border: 1px solid rgba(var(--brass-rgb), 0.4); padding: 2px 6px; }
.cell-email { color: var(--bone-dim); font-size: 13px; }
.cell-date { color: var(--bone-dim); font-size: 12px; }
.role-select {
  background: var(--ink); border: 1px solid var(--rule); color: var(--bone);
  padding: 8px 10px; font-family: var(--grot); font-size: 12px; text-transform: capitalize;
  outline: none; cursor: pointer;
}
.role-select:focus { border-color: var(--brass); }
.role-select:disabled { opacity: 0.5; cursor: default; }
.loading-note { padding: 24px 0; color: var(--bone-dim); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }

/* ========== DIARY / BOOKINGS ========== */
.diary-bar {
  display: flex; align-items: stretch; justify-content: space-between;
  border-bottom: 1px solid var(--rule);
  flex-wrap: wrap; gap: 16px;
}
.filters { display: flex; gap: 0; overflow-x: auto; flex: 1 1 auto; min-width: 0; }
.filters button {
  background: transparent; border: 0; color: var(--bone-dim);
  font: inherit; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600;
  padding: 22px 26px 20px; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all .25s ease;
}
.filters button:hover { color: var(--bone); }
.filters button.active { color: var(--bone); border-bottom-color: var(--brass); }
.diary-scope { display: flex; align-items: center; gap: 12px; padding: 12px 4px; flex-shrink: 0; }
.diary-empty { padding: 56px 0; text-align: center; border-bottom: 1px solid var(--rule); }
.diary-empty .lede { font-family: var(--serif); font-size: 28px; line-height: 1.1; margin-bottom: 8px; }
.diary-empty .sub { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.diary-empty .sub b { color: var(--bone); font-weight: 500; }

.appt { display: grid; grid-template-columns: 140px 1.3fr 1fr 1fr auto; gap: 32px; padding: 24px 0; border-bottom: 1px solid var(--rule); align-items: center; }
.appt__date { display: flex; flex-direction: column; gap: 4px; font-variant-numeric: tabular-nums; border-left: 2px solid var(--brass); padding-left: 18px; }
.appt[data-status="cancelled"] .appt__date, .appt[data-status="completed"] .appt__date { border-left-color: var(--rule); }
.appt__date .dow { font-size: 14px; font-family: var(--serif); }
.appt__date .m { font-size: 10px; letter-spacing: 0.1em; color: var(--bone-dim); margin-top: 4px; }
.appt__svc { display: flex; flex-direction: column; gap: 8px; }
.appt__svc .num { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.appt__svc h3 { font-family: var(--serif); font-weight: 400; font-size: 24px; line-height: 1.05; letter-spacing: -0.01em; }
.appt__col { display: flex; flex-direction: column; gap: 6px; }
.appt__col .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.appt__col .v { font-family: var(--serif); font-size: 18px; line-height: 1.1; }
.appt__action { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; min-width: 140px; }
.pill { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; padding: 6px 12px; border: 1px solid var(--rule); color: var(--bone-dim); background: rgba(var(--bone-rgb), 0.02); }
.pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bone-dim); }
.pill.is-upcoming { color: var(--brass); border-color: rgba(var(--brass-rgb), 0.4); background: rgba(var(--brass-rgb), 0.06); }
.pill.is-upcoming .dot { background: var(--brass); box-shadow: 0 0 0 3px rgba(var(--brass-rgb), 0.18); }
.pill.is-cancelled { color: var(--red); border-color: rgba(var(--red-rgb), 0.35); }
.pill.is-cancelled .dot { background: var(--red); }
.appt__actions { display: flex; gap: 8px; }

/* ========== SERVICES ========== */
.svc-list { border-top: 1px solid var(--rule); }
.svc-row {
  display: grid;
  grid-template-columns: 60px 2fr 110px 110px auto;
  gap: 20px;
  padding: 24px 0;
  border-bottom: 1px solid var(--rule);
  align-items: center;
}
.svc-row .num { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.svc-name {
  font-family: var(--serif); font-size: clamp(18px, 1.8vw, 24px);
  background: transparent; border: none; color: var(--bone);
  width: 100%; padding: 4px 0;
  border-bottom: 1px dashed transparent;
  transition: border-color .2s ease; outline: none;
}
.svc-name:hover, .svc-name:focus { border-bottom-color: var(--brass); }
.svc-dur, .svc-price {
  background: transparent; border: 1px solid var(--rule); color: var(--bone);
  padding: 8px 12px;
  font-family: var(--serif); font-size: 16px;
  text-align: center;
  width: 100%; outline: none;
  transition: border-color .25s ease;
}
.svc-dur:focus, .svc-price:focus { border-color: var(--brass); }
.svc-row .controls { display: flex; gap: 8px; justify-content: flex-end; }

@media (max-width: 1100px) {
  .meta-strip { grid-template-columns: 1fr 1fr; }
  .meta-strip .cell { border-right: 0; border-bottom: 1px solid var(--rule); }
  .meta-strip .cell:nth-child(odd) { border-right: 1px solid var(--rule); }
  .meta-strip .cell.action { grid-column: 1 / -1; align-items: stretch; }
  .kpis { grid-template-columns: repeat(2, 1fr); }
  .kpi { border-bottom: 1px solid var(--rule); }
  .kpi:nth-child(odd) { border-right: 1px solid var(--rule); }
  .kpi:nth-child(even) { border-right: 0; }
  .user-row { grid-template-columns: 1fr 1fr; gap: 12px; }
  .cell-date { display: none; }
  .svc-row { grid-template-columns: 40px 1fr 90px 90px auto; gap: 12px; }
}
@media (max-width: 800px) {
  .ledger-head { padding: 56px 22px 0; }
  .topline { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
  .ledger-head__mono { font-size: 200px; right: -20px; top: -10px; }
  .meta-strip { grid-template-columns: 1fr; margin-top: 40px; }
  .meta-strip .cell { border-right: 0 !important; }
  .jump { top: 70px; }
  .wrap { padding: 0 22px; }
  .sec { padding: 56px 0; }
  .sec-head { grid-template-columns: 1fr; gap: 14px; }
  .kpis { grid-template-columns: 1fr; }
  .kpi { border-right: 0 !important; padding: 28px 22px; }
  .user-row { grid-template-columns: 1fr; }
  .appt { grid-template-columns: 1fr; gap: 12px; padding: 20px 0; }
  .appt__action { flex-direction: row; align-items: center; justify-content: space-between; min-width: 0; }
  .svc-row { grid-template-columns: 1fr; gap: 10px; }
  .svc-row .controls { justify-content: flex-start; }
}
</style>
