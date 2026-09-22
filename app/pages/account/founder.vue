<script setup lang="ts">
import type { Barber, BookingRow, Service } from '~/types/api'
import { toAppts, periods, within, plural, type Appt, type ApptStatus } from '~/utils/appointments'

definePageMeta({ accountRole: 'Founder · Nigel' })
useHead({ title: 'The House - RE:FORM Hair & Culture' })

const { user, logout } = useAuth()

type FilterKey = ApptStatus | 'all'

const appts = ref<Appt[]>([])

const filter = ref<FilterKey>('upcoming')
const scope = ref<'all' | 'mine'>('all')

function inScope(a: Appt): boolean {
  return scope.value === 'all' || a.chair === user.value?.firstName
}

const counts = computed(() => ({
  upcoming: appts.value.filter(a => inScope(a) && a.status === 'upcoming').length,
  past: appts.value.filter(a => inScope(a) && a.status === 'past').length,
  cancelled: appts.value.filter(a => inScope(a) && a.status === 'cancelled').length,
  all: appts.value.filter(a => inScope(a)).length,
}))

const filteredAppts = computed(() =>
  appts.value.filter(a => inScope(a) && (filter.value === 'all' || a.status === filter.value)),
)

// ===== Hours =====
interface HoursRow {
  day: string
  late?: boolean
  open: string
  close: string
  isOpen: boolean
}
const hours = reactive<HoursRow[]>([
  { day: 'Monday',    open: '09:30', close: '16:30', isOpen: true },
  { day: 'Tuesday',   open: '09:00', close: '16:30', isOpen: true },
  { day: 'Wednesday', open: '09:00', close: '16:30', isOpen: true },
  { day: 'Thursday',  late: true, open: '09:30', close: '19:00', isOpen: true },
  { day: 'Friday',    open: '09:00', close: '16:30', isOpen: true },
  { day: 'Saturday',  open: '07:30', close: '14:30', isOpen: true },
  { day: 'Sunday',    open: '',      close: '',      isOpen: false },
])

function toggleDay(row: HoursRow) {
  row.isOpen = !row.isOpen
  if (!row.isOpen) { row.open = ''; row.close = '' }
  else { if (!row.open) row.open = '09:00'; if (!row.close) row.close = '16:30' }
}

// ===== Chair cards =====
interface ChairCard {
  id: string
  num: string
  role: string
  name: string
  title: string
  cuts: number
  // rent === 0 → owner-operator (show revenue instead)
  rent: number
  revenue?: number
  canArchive?: boolean
}
const chairCardsSource: ChairCard[] = [
  { id: 'nigel',  num: '01', role: 'Founder', name: 'Nigel',  title: 'Founder',       cuts: 138, rent: 0,   revenue: 3612 },
  { id: 'barlow', num: '02', role: 'Head',    name: 'Barlow', title: 'Head Barber',   cuts: 168, rent: 780 },
  { id: 'jordan', num: '03', role: 'Senior',  name: 'Jordan', title: 'Senior Barber', cuts: 142, rent: 650 },
  { id: 'josh',   num: '04', role: 'Senior',  name: 'Josh',   title: 'Senior Barber', cuts: 154, rent: 650 },
  { id: 'kieran', num: '05', role: 'Barber',  name: 'Kieran', title: 'Barber',        cuts: 116, rent: 565, canArchive: true },
]
const chairCards = reactive(chairCardsSource.map(c => ({
  ...c,
  orig: { name: c.name, title: c.title },
  saved: false,
})))
function chairDirty(c: typeof chairCards[number]): boolean {
  return c.name !== c.orig.name || c.title !== c.orig.title
}
function chairSave(c: typeof chairCards[number]) {
  c.orig.name = c.name
  c.orig.title = c.title
  c.saved = true
  setTimeout(() => { c.saved = false }, 1600)
}
function chairDiscard(c: typeof chairCards[number]) {
  c.name = c.orig.name
  c.title = c.orig.title
}

// ===== Services =====
interface Svc {
  id: string
  num: string
  name: string
  desc: string
  duration: string
  price: string
  published: boolean
}

const api = useApiFetch()
const toast = useToast()

const services = ref<Svc[]>([])
const publishing = ref(false)

function toSvc(s: Service): Svc {
  return {
    id: s.id,
    num: s.num,
    name: s.name,
    desc: s.description,
    duration: `${s.duration} min`,
    price: priceFmt(s.price),
    published: s.published,
  }
}

async function loadServices() {
  try {
    const rows = await api<Service[]>('/api/founder/services')
    services.value = rows.map(toSvc)
  } catch {
    toast.error('Could not load the service menu')
  }
}

async function publishMenu() {
  if (publishing.value || services.value.length === 0) return
  publishing.value = true
  try {
    await Promise.all(
      services.value.map(s =>
        api(`/api/founder/services/${s.id}/publish`, {
          method: 'PATCH',
          body: { published: true },
        }),
      ),
    )
    services.value.forEach(s => { s.published = true })
    toast.success('Menu published - now live on /services')
  } catch {
    toast.error('Could not publish the menu')
  } finally {
    publishing.value = false
  }
}

async function loadDiary() {
  try {
    appts.value = toAppts(await api<BookingRow[]>('/api/founder/bookings'))
  } catch {
    toast.error('Could not load the diary')
  }
}

// ===== Header =====
const activeChairs = ref(0)
const members = ref(0)

async function loadHeader() {
  try {
    const [barbers, m] = await Promise.all([
      api<Barber[]>('/api/barbers'),
      api<{ count: number }>('/api/founder/members'),
    ])
    activeChairs.value = barbers.length
    members.value = m.count
  } catch {
    toast.error('Could not load the header figures')
  }
}

const today = computed(() => within(appts.value, periods().today))
const thisWeek = computed(() => within(appts.value, periods().week))
const monthPounds = computed(() =>
  Math.round(within(appts.value, periods().month).reduce((sum, a) => sum + a.pence, 0) / 100),
)

onMounted(() => {
  loadServices()
  loadDiary()
  loadHeader()
})

// ===== Gallery =====
const galleryTiles: { caption: string; month: string; cover?: boolean }[] = [
  { caption: 'Skin Fade',   month: "May ' 26", cover: true },
  { caption: 'Beard Trim',  month: "May ' 26" },
  { caption: 'The Chair',   month: "Apr ' 26" },
  { caption: 'Scissor Cut', month: "Apr ' 26" },
  { caption: 'Mirror',      month: "Apr ' 26" },
  { caption: 'Taper',       month: "Mar ' 26" },
  { caption: 'The Room',    month: "Mar ' 26" },
  { caption: 'Classic',     month: "Mar ' 26" },
] as const

const dragActive = ref(false)
function onDragEnter(e: DragEvent) { e.preventDefault(); dragActive.value = true }
function onDragOver(e: DragEvent)  { e.preventDefault(); dragActive.value = true }
function onDragLeave(e: DragEvent) { e.preventDefault(); dragActive.value = false }
function onDrop(e: DragEvent)      { e.preventDefault(); dragActive.value = false }

// ===== Jump nav scrollspy =====
const sectionIds = ['diary', 'hours', 'chairs', 'work', 'gallery'] as const
const activeSection = useScrollSpy(sectionIds)
</script>

<template>
  <main class="founder-main">
    <!-- ===== HEAD ===== -->
    <header class="ledger-head">
      <div class="ledger-head__inner">
        <div class="topline">
          <div class="label">- Vol<span class="colon">:</span> 01 / The House</div>
          <div class="label">Signed in as {{ user?.firstName }} <span class="colon">·</span> <a href="#" @click.prevent="logout()">Logout →</a></div>
        </div>

        <h1>The <em>house.</em></h1>
        <p class="greeting">Morning, <strong>{{ user?.firstName }}</strong>. Every chair, every page - <span class="brass-accent">yours to set</span>.</p>

        <div class="meta-strip">
          <div class="cell"><span class="k">Today <small class="cell-sub">- all chairs</small></span><span class="v">{{ plural(today.length, 'booking') }}</span></div>
          <div class="cell"><span class="k">This week</span><span class="v">{{ plural(thisWeek.length, 'cut') }}</span></div>
          <div class="cell"><span class="k">Open chairs</span><span class="v">{{ activeChairs }} active</span></div>
          <div class="cell"><span class="k">Members</span><span class="v">{{ members.toLocaleString('en-GB') }} on file</span></div>
          <div class="cell"><span class="k">Revenue <span class="colon">·</span> month</span><span class="v"><span class="brass-accent">£</span>{{ monthPounds.toLocaleString('en-GB') }}</span></div>
          <div class="cell action"><a class="btn btn--solid" href="#diary">Open Diary <span class="arrow">→</span></a></div>
        </div>

        <span class="ledger-head__mono">:</span>
      </div>
    </header>

    <!-- ===== JUMP NAV ===== -->
    <nav class="jump">
      <div class="jump__inner">
        <a v-for="(id, i) in sectionIds" :key="id" :href="`#${id}`" :class="{ active: activeSection === id }">
          <span class="n">{{ String(i + 2).padStart(2, '0') }}</span>
          {{ ({ diary: 'The Diary', hours: 'Hours', chairs: 'Chairs', work: 'The Work', gallery: 'Gallery' } as Record<string, string>)[id] }}
        </a>
      </div>
    </nav>

    <!-- ===== DIARY ===== -->
    <section id="diary" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">- 02 / The Diary</div>
          <h2>Every<br />chair<span class="colon">.</span></h2>
          <div class="aside"><span>All times <span class="colon">·</span> <b>BST</b></span></div>
        </div>

        <div class="diary-bar">
          <div class="filters" role="tablist">
            <button :class="{ active: filter === 'upcoming' }" @click="filter = 'upcoming'">Upcoming <span class="count">{{ counts.upcoming }}</span></button>
            <button :class="{ active: filter === 'past' }" @click="filter = 'past'">Past <span class="count">{{ counts.past }}</span></button>
            <button :class="{ active: filter === 'cancelled' }" @click="filter = 'cancelled'">Cancelled <span class="count">{{ counts.cancelled }}</span></button>
            <button :class="{ active: filter === 'all' }" @click="filter = 'all'">All <span class="count">{{ counts.all }}</span></button>
          </div>
          <div class="diary-scope">
            <span class="scope-lbl">Showing</span>
            <div class="scope-seg">
              <button class="scope-btn" :class="{ active: scope === 'all' }" type="button" @click="scope = 'all'">All chairs</button>
              <button class="scope-btn" :class="{ active: scope === 'mine' }" type="button" @click="scope = 'mine'">Mine only</button>
            </div>
          </div>
        </div>

        <div>
          <article
            v-for="a in filteredAppts"
            :key="a.id"
            class="appt"
            :data-status="a.status"
          >
            <div class="appt__date">
              <span class="dow">{{ a.dow }}</span>
              <span class="d">{{ a.d }}</span>
              <span class="m">{{ a.m }}</span>
            </div>
            <div class="appt__svc">
              <span class="num">/ {{ a.svcNum }} - {{ a.svcName }}</span>
              <h3>{{ a.svcName }}</h3>
              <span class="duration">{{ a.duration }} <span class="colon">·</span> {{ a.price }}</span>
            </div>
            <div class="appt__col">
              <span class="k">Client</span>
              <span class="v">{{ a.client }}</span>
            </div>
            <div class="appt__col">
              <span class="k">Chair</span>
              <span class="v">{{ a.chair }} <small>{{ a.timeStart }} - {{ a.timeEnd }}</small></span>
            </div>
            <div class="appt__action">
              <span v-if="a.status === 'upcoming'" class="pill is-upcoming"><span class="dot"></span>Confirmed</span>
              <span v-else-if="a.status === 'cancelled'" class="pill is-cancelled"><span class="dot"></span>Cancelled</span>
              <span v-else class="pill"><span class="dot"></span>Completed</span>
            </div>
          </article>
        </div>

        <div v-show="filteredAppts.length === 0" class="diary-empty">
          <div class="lede">Nothing on the diary in this view<span class="colon">.</span></div>
          <div class="sub">Try <b>All chairs</b> or switch tabs above.</div>
        </div>
      </div>
    </section>

    <!-- ===== HOURS ===== -->
    <section id="hours" class="sec sec--alt">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">- 03 / Hours</div>
          <h2>When the<br />door's open<span class="colon">.</span></h2>
          <div class="aside"><span>Live on <b>reformbarber.co.uk</b></span></div>
        </div>

        <div class="editable-card">
          <div class="hours-table">
            <div class="hours-row head">
              <span>Day</span><span>Open</span><span>Close</span><span class="status-cell">Status</span>
            </div>
            <div v-for="row in hours" :key="row.day" class="hours-row">
              <span class="day">{{ row.day }}<small v-if="row.late" class="day-late"> - Late</small></span>
              <span><input class="time-in" :class="{ closed: !row.isOpen }" type="time" v-model="row.open" :disabled="!row.isOpen" /></span>
              <span><input class="time-in" :class="{ closed: !row.isOpen }" type="time" v-model="row.close" :disabled="!row.isOpen" /></span>
              <span class="toggle">
                <button class="switch" type="button" :aria-checked="row.isOpen ? 'true' : 'false'" :aria-label="`${row.isOpen ? 'Open' : 'Closed'} ${row.day}`" @click="toggleDay(row)"></button>
                <span class="switch-label">{{ row.isOpen ? 'Open' : 'Closed' }}</span>
              </span>
            </div>
          </div>
          <div class="save-foot">
            <span class="status"><span class="dot"></span>All changes saved</span>
            <div class="save-foot__btns">
              <button class="btn btn--ghost">Discard</button>
              <button class="btn btn--ghost btn--publish">Publish Hours</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CHAIRS ===== -->
    <section id="chairs" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">- 04 / The Chairs</div>
          <h2>Who's<br />on the floor<span class="colon">.</span></h2>
          <div class="aside"><span><b>5 active</b></span><span>1 archived</span></div>
        </div>

        <div class="rent-summary">
          <div class="rent-summary__cell is-total">
            <span class="k">Chair rent <span class="colon">·</span> month</span>
            <span class="v"><span class="currency">£</span>2,645</span>
            <span class="sub">- from <b>4 chairs</b> on rent</span>
          </div>
          <div class="rent-summary__cell">
            <span class="k">Per week</span>
            <span class="v"><span class="currency">£</span>610</span>
            <span class="sub">- collected Fridays</span>
          </div>
          <div class="rent-summary__cell">
            <span class="k">Next collection</span>
            <span class="v">Fri <span class="colon">·</span> 22 May</span>
            <span class="sub">- 4 days</span>
          </div>
          <div class="rent-summary__cell">
            <span class="k">YTD <span class="colon">·</span> 2026</span>
            <span class="v"><span class="currency">£</span>13,225</span>
            <span class="sub"><b>All paid</b> <span class="colon">·</span> 0 owed</span>
          </div>
        </div>

        <div class="chairs-grid">
          <div
            v-for="c in chairCards"
            :key="c.id"
            class="chair-card"
            :class="{ 'is-dirty': chairDirty(c), 'is-saved': c.saved }"
          >
            <div class="chair-card__pic">
              <picture>
                <source :srcset="`/images/barbers/${c.id}-light.jpg`" media="all">
                <img :src="`/images/barbers/${c.id}.jpg`" :alt="c.orig.name" />
              </picture>
              <span class="chair-card__num">/ {{ c.num }} <span class="colon">·</span> {{ c.role }}</span>
            </div>
            <span class="chair-card__saved-flash"><span class="dot"></span>Saved</span>
            <div class="chair-card__body">
              <div class="chair-card__meta">
                <input class="chair-card__name" v-model="c.name" />
                <input class="chair-card__title" v-model="c.title" />
              </div>
              <div class="chair-card__stats">
                <div><span class="s-k">Cuts <span class="colon">·</span> month</span><span class="s-v">{{ c.cuts }}</span></div>
                <div v-if="c.rent === 0">
                  <span class="s-k">Revenue <span class="colon">·</span> mo</span>
                  <span class="s-v"><span class="currency">£</span>{{ c.revenue?.toLocaleString() }}</span>
                </div>
                <div v-else>
                  <span class="s-k">Chair rent <span class="colon">·</span> mo</span>
                  <span class="s-v"><span class="currency">£</span>{{ c.rent }}</span>
                </div>
              </div>
              <span class="chair-card__dirty-flag"><span class="dot"></span>Unsaved changes</span>
              <div v-if="!chairDirty(c)" class="chair-card__row chair-card__row--default">
                <button class="btn btn--ghost">Schedule</button>
                <button v-if="c.canArchive" class="btn btn--danger">Archive</button>
              </div>
              <div v-else class="chair-card__row chair-card__row--save">
                <button class="btn btn--ghost btn--discard" type="button" @click="chairDiscard(c)">Discard</button>
                <button class="btn btn--ghost btn--save" type="button" @click="chairSave(c)">Save changes</button>
              </div>
            </div>
          </div>

          <button class="chair-add" type="button">
            <span class="plus">+</span>
            <span class="lbl">Add a chair</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ===== THE WORK / SERVICES ===== -->
    <section id="work" class="sec sec--alt">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">- 05 / The Work</div>
          <h2>Services<br /><em>priced</em><span class="colon">.</span></h2>
          <div class="aside"><span><b>{{ services.length }} active</b></span><span>Live on /services</span></div>
        </div>

        <div class="svc-list">
          <div v-for="s in services" :key="s.num" class="svc-row">
            <span class="num">/ {{ s.num }}</span>
            <input class="svc-name" v-model="s.name" />
            <textarea class="svc-desc" rows="2" v-model="s.desc"></textarea>
            <input class="svc-dur" v-model="s.duration" />
            <input class="svc-price" v-model="s.price" />
            <div class="controls">
              <button class="icon-btn" aria-label="Reorder">⇅</button>
              <button class="icon-btn danger" aria-label="Remove">×</button>
            </div>
          </div>

          <div class="svc-add-row">
            <span class="helper">- Add a new service</span>
            <button class="btn btn--ghost btn--add">+ &nbsp;Add Service</button>
          </div>
        </div>

        <div class="save-foot save-foot--flush">
          <span class="status"><span class="dot"></span>All changes saved <span class="colon">·</span> Last edit 2 min ago</span>
          <div class="save-foot__btns">
            <button class="btn btn--ghost">Discard</button>
            <button class="btn btn--ghost btn--publish" type="button" :disabled="publishing" @click="publishMenu">
              {{ publishing ? 'Publishing…' : 'Publish Menu' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== GALLERY ===== -->
    <section id="gallery" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">- 06 / Gallery</div>
          <h2>The wall<span class="colon">.</span></h2>
          <div class="aside"><span><b>24 images</b></span><span>Live on /gallery</span></div>
        </div>

        <div class="gal-block">
          <div class="gal-block__head">
            <div class="l">
              <span class="step">/ 01</span>
              <span class="ttl">Add to the wall</span>
            </div>
            <span class="meta">Drop multiple - they'll appear below</span>
          </div>

          <label
            class="upload-zone"
            :class="{ 'is-drag': dragActive }"
            for="fileIn"
            @dragenter="onDragEnter"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <span class="plus">+</span>
            <span class="title">Drop images, or <span class="brass-accent">browse</span></span>
            <span class="sub">Fresh cuts, the room at golden hour, the chair before opening - anything worth the wall.</span>
            <span class="specs">JPG <span class="colon">·</span> PNG <span class="colon">·</span> Up to 8MB <span class="colon">·</span> 4:5 looks best</span>
            <input id="fileIn" type="file" accept="image/*" multiple class="file-in" />
          </label>
        </div>

        <div class="gal-block">
          <div class="gal-block__head">
            <div class="l">
              <span class="step">/ 02</span>
              <span class="ttl">On the wall now</span>
            </div>
            <span class="meta"><b>8 of 24</b> shown <span class="colon">·</span> Hover a tile to manage</span>
          </div>

          <div class="gallery-grid">
            <div v-for="(t, i) in galleryTiles" :key="i" class="g-tile">
              <div class="ph-fill"><span class="ph-mono">{{ String(i + 1).padStart(2, '0') }}</span></div>
              <span class="tag" :class="{ cover: t.cover }">{{ t.cover ? 'Cover · 01' : `/ ${String(i + 1).padStart(2, '0')}` }}</span>
              <span class="caption"><span>{{ t.caption }}</span><span>{{ t.month }}</span></span>
              <div class="controls">
                <button>{{ t.cover ? 'Replace' : 'Set as cover' }}</button>
                <button class="danger">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div class="save-foot save-foot--mt">
          <span class="status"><span class="dot"></span>All changes saved <span class="colon">·</span> 24 images published</span>
          <div class="save-foot__btns">
            <button class="btn btn--ghost">Show all 24 →</button>
            <button class="btn btn--ghost">View public gallery →</button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped src="~/assets/css/account.css"></style>
<style scoped>
.founder-main { flex: 1; padding-top: 80px; }
.btn .arrow { transition: transform .25s ease; }
.btn--danger { border-color: rgba(var(--red-rgb), 0.35); color: var(--red); padding: 9px 14px; font-size: 10px; letter-spacing: 0.18em; }
.btn--danger:hover { background: var(--red); color: var(--ink); border-color: var(--red); }
.btn--publish:disabled { opacity: 0.55; cursor: default; }
.btn--publish:disabled:hover { background: transparent; color: var(--bone); }
.btn--add { border-color: var(--brass); color: var(--brass); }
.sec-head .aside { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); display: flex; gap: 24px; align-items: baseline; }

/* ========== HEAD ========== */
.topline { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
.greeting { font-family: var(--serif); font-size: 22px; color: var(--bone-dim); margin-top: 24px; max-width: 60ch; }
.greeting strong { color: var(--bone); font-weight: 400; font-style: italic; }

.meta-strip {
  display: grid; grid-template-columns: repeat(5, 1fr) auto;
  border-top: 1px solid var(--rule); margin-top: 64px;
}
.meta-strip .cell { padding: 22px 26px 24px; border-right: 1px solid var(--rule); display: flex; flex-direction: column; gap: 10px; }
.meta-strip .cell.action { padding: 22px 26px; align-items: flex-end; justify-content: center; }
.cell-sub { font-family: var(--grot); font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--bone-dim); }

/* ========== JUMP NAV ========== */
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

/* ========== KPIs ========== */

/* charts */

/* leaderboard */

/* ========== DIARY ========== */
.diary-bar {
  display: flex; align-items: stretch; justify-content: space-between;
  border-bottom: 1px solid var(--rule);
  flex-wrap: wrap; gap: 0;
}
.filters { display: flex; gap: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; flex: 1 1 auto; min-width: 0; }
.filters button {
  background: transparent; border: 0; color: var(--bone-dim);
  font: inherit; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600;
  padding: 22px 26px 20px; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all .25s ease;
  display: inline-flex; align-items: baseline; gap: 10px;
  flex-shrink: 0;
}
.diary-scope {
  display: flex; align-items: center; gap: 16px;
  padding: 0 4px 0 24px; flex-shrink: 0;
}
.diary-scope .scope-lbl { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.scope-seg { display: inline-flex; border: 1px solid var(--rule); }
.scope-btn {
  background: transparent; border: 0; color: var(--bone-dim);
  padding: 9px 14px; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600;
  cursor: pointer; transition: all .25s ease;
  font-family: var(--grot);
}
.scope-btn:hover { color: var(--bone); }
.scope-btn.active { background: var(--brass); color: var(--ink); }
.scope-btn + .scope-btn { border-left: 1px solid var(--rule); }

.appt { display: grid; grid-template-columns: 110px 1.3fr 1fr 1fr auto; gap: 32px; padding: 28px 0; border-bottom: 1px solid var(--rule); align-items: center; transition: padding .3s ease, background .3s ease; }
.appt:hover { padding-left: 18px; padding-right: 18px; background: linear-gradient(to right, rgba(var(--brass-rgb), 0.03), transparent 60%); }
.appt__date { display: flex; flex-direction: column; gap: 4px; font-variant-numeric: tabular-nums; border-left: 2px solid var(--brass); padding-left: 18px; }
.appt[data-status="past"] .appt__date { border-left-color: var(--rule); }
.appt[data-status="cancelled"] .appt__date { border-left-color: var(--bone-dim); opacity: 0.65; }
.appt__date .dow { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.appt__date .d { font-family: var(--serif); font-size: 42px; line-height: 1; letter-spacing: -0.02em; }
.appt__date .m { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); margin-top: 4px; }
.appt__svc { display: flex; flex-direction: column; gap: 8px; }
.appt__svc h3 { font-family: var(--serif); font-weight: 400; font-size: 26px; line-height: 1.05; letter-spacing: -0.01em; }
.appt__svc .duration { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.appt__col .v small { font-family: var(--grot); font-size: 11px; color: var(--bone-dim); margin-left: 8px; letter-spacing: 0.04em; text-transform: none; }
.appt__action { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; min-width: 180px; }

/* ========== HOURS ========== */
.editable-card {
  background: rgba(var(--bone-rgb), 0.015);
  border: 1px solid var(--rule);
}
.hours-table { display: grid; grid-template-columns: 140px 1fr 1fr auto; }
.hours-row { display: contents; }
.hours-row > * {
  padding: 18px 28px;
  border-bottom: 1px solid var(--rule);
  display: flex; align-items: center;
}
.hours-row.head > * {
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim);
  padding: 16px 28px;
  background: rgba(var(--bone-rgb), 0.04);
}
.hours-row.head .status-cell { justify-content: flex-end; }
.hours-row:last-child > * { border-bottom: 0; }
.hours-row .day { font-family: var(--serif); font-size: 20px; }
.day-late { font-family: var(--grot); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--brass); margin-left: 8px; }
.time-in {
  background: transparent;
  border: 1px solid var(--rule);
  color: var(--bone);
  padding: 8px 12px;
  font-family: var(--serif); font-size: 18px;
  width: 100%; max-width: 140px;
  outline: none;
  font-variant-numeric: tabular-nums;
  transition: border-color .25s ease, color .25s ease;
}
.time-in:hover { border-color: var(--bone-dim); }
.time-in:focus { border-color: var(--brass); color: var(--brass); }
.time-in.closed { color: var(--bone-dim); font-style: italic; }
.hours-row .toggle { display: flex; align-items: center; gap: 12px; justify-content: flex-end; }
.switch { position: relative; width: 40px; height: 22px; background: var(--rule); border-radius: 12px; cursor: pointer; flex-shrink: 0; transition: background .25s ease; border: 0; padding: 0; }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: var(--bone); border-radius: 50%; transition: transform .25s ease; }
.switch[aria-checked="true"] { background: var(--brass); }
.switch[aria-checked="true"]::after { transform: translateX(18px); }
.switch-label { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }

.save-foot {
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 28px; border-top: 1px solid var(--rule);
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim);
}
.save-foot--flush { padding: 22px 0 0; border-top: 0; }
.save-foot--mt { margin-top: 24px; }
.save-foot .status { display: inline-flex; align-items: center; gap: 10px; }
.save-foot .status .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 4px rgba(var(--green-rgb), 0.18); }
.save-foot__btns { display: flex; gap: 8px; }

/* ========== CHAIRS ========== */
.rent-summary {
  display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr;
  border: 1px solid var(--rule);
  background: rgba(var(--brass-rgb), 0.03);
  margin-bottom: 32px;
}
.rent-summary__cell {
  padding: 22px 26px;
  border-right: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 8px;
}
.rent-summary__cell:last-child { border-right: 0; }
.rent-summary__cell .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.rent-summary__cell .v { font-family: var(--serif); font-size: clamp(28px, 2.6vw, 38px); line-height: 1; letter-spacing: -0.015em; }
.rent-summary__cell .v .currency { color: var(--brass); margin-right: 2px; }
.rent-summary__cell .sub { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.rent-summary__cell .sub b { color: var(--bone); font-weight: 500; }
.rent-summary__cell.is-total { background: rgba(var(--brass-rgb), 0.06); }
.rent-summary__cell.is-total .v { color: var(--brass); }

.chairs-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px;
  align-items: start;
}
.chair-card {
  background: rgba(var(--bone-rgb), 0.015);
  border: 1px solid var(--rule);
  display: flex; flex-direction: column;
  transition: border-color .3s ease, background .3s ease;
  position: relative;
}
.chair-card:hover { border-color: rgba(var(--brass-rgb), 0.4); }
.chair-card.is-dirty { border-color: rgba(var(--brass-rgb), 0.55); background: rgba(var(--brass-rgb), 0.025); }
.chair-card__pic {
  width: 100%;
  aspect-ratio: 3 / 4;
  flex: 0 0 auto;
  background: var(--ink-2);
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--rule);
}
.chair-card__pic picture, .chair-card__pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.chair-card__num { position: absolute; bottom: 14px; left: 16px; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(244,239,230,0.85); z-index: 2; }
.chair-card__pic::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%); pointer-events: none; }
.chair-card__body { padding: 22px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
.chair-card__meta { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.chair-card__name {
  font-family: var(--serif); font-size: 26px;
  border: none; background: transparent; color: var(--bone); padding: 0;
  outline: none; line-height: 1; letter-spacing: -0.01em;
  border-bottom: 1px dashed transparent;
  transition: border-color .2s ease;
  width: 100%; min-width: 0;
}
.chair-card__name:hover, .chair-card__name:focus { border-bottom-color: var(--brass); }
.chair-card__title {
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim);
  background: transparent; border: none; text-align: right; outline: none;
  border-bottom: 1px dashed transparent; padding: 0;
  font-family: var(--grot);
}
.chair-card__title:hover, .chair-card__title:focus { border-bottom-color: var(--brass); color: var(--bone); }
.chair-card__stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 14px; border-top: 1px solid var(--rule); }
.chair-card__stats .s-k { font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); display: block; margin-bottom: 4px; }
.chair-card__stats .s-v { font-family: var(--serif); font-size: 18px; line-height: 1; }
.chair-card__stats .s-v .currency { color: var(--brass); }
.chair-card__row { display: flex; gap: 8px; }
.chair-card__row .btn--ghost { flex: 1; padding: 9px 0; }
.chair-card__row--save .btn--save {
  flex: 1.4; border-color: var(--brass); color: var(--ink); background: var(--brass);
}
.chair-card__row--save .btn--save:hover { background: var(--bone); border-color: var(--bone); color: var(--ink); }
.chair-card__row--save .btn--discard { flex: 1; }
.chair-card__dirty-flag {
  display: none; align-items: center; gap: 8px;
  font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--brass);
}
.chair-card.is-dirty .chair-card__dirty-flag { display: inline-flex; }
.chair-card__dirty-flag .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brass); box-shadow: 0 0 0 3px rgba(var(--brass-rgb), 0.18); }
.chair-card__saved-flash {
  position: absolute; inset: auto 12px 12px auto;
  font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--green);
  padding: 5px 10px;
  border: 1px solid rgba(var(--green-rgb), 0.4);
  background: rgba(var(--green-rgb), 0.08);
  opacity: 0; pointer-events: none; transition: opacity .35s ease;
  display: inline-flex; align-items: center; gap: 8px;
}
.chair-card.is-saved .chair-card__saved-flash { opacity: 1; }
.chair-card__saved-flash .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

.chair-add {
  width: 100%;
  background: transparent;
  border: 1px dashed var(--rule);
  display: flex; align-items: center; justify-content: center;
  aspect-ratio: 3 / 4;
  align-self: start;
  color: var(--bone-dim);
  cursor: pointer;
  transition: all .3s ease;
  flex-direction: column; gap: 14px;
}
.chair-add:hover { border-color: var(--brass); color: var(--bone); background: rgba(var(--brass-rgb), 0.03); }
.chair-add .plus { font-family: var(--serif); font-size: 64px; line-height: 1; color: var(--brass); }
.chair-add .lbl { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; }

/* ========== SERVICES ========== */
.svc-row {
  display: grid;
  grid-template-columns: 60px 2fr 3fr 100px 110px auto;
  gap: 28px;
  padding: 28px 0;
  border-bottom: 1px solid var(--rule);
  align-items: center;
  transition: padding .3s ease, background .3s ease;
}
.svc-row:hover { padding-left: 12px; padding-right: 12px; background: linear-gradient(to right, rgba(var(--brass-rgb), 0.03), transparent 80%); }
.svc-name {
  font-family: var(--serif); font-size: clamp(20px, 2vw, 28px);
  background: transparent; border: none; color: var(--bone);
  width: 100%; padding: 4px 0;
  border-bottom: 1px dashed transparent;
  transition: border-color .2s ease; outline: none;
  letter-spacing: -0.01em;
}
.svc-desc {
  background: transparent; border: none; color: var(--bone-dim);
  width: 100%; padding: 4px 0; font-size: 13px; line-height: 1.5;
  border-bottom: 1px dashed transparent;
  transition: border-color .2s ease; outline: none;
  resize: none; font-family: var(--grot);
}
.svc-desc:hover, .svc-desc:focus { border-bottom-color: var(--brass); color: var(--bone); }
.svc-dur, .svc-price {
  background: transparent; border: 1px solid var(--rule); color: var(--bone);
  padding: 8px 12px;
  font-family: var(--serif); font-size: 16px;
  text-align: center;
  width: 100%; outline: none;
  transition: border-color .25s ease;
  font-variant-numeric: tabular-nums;
}
.svc-row .controls { display: flex; gap: 6px; }
.svc-row .icon-btn {
  width: 32px; height: 32px;
  border: 1px solid var(--rule); background: transparent;
  color: var(--bone-dim); cursor: pointer; font-size: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all .25s ease;
}
.svc-row .icon-btn:hover { border-color: var(--bone); color: var(--bone); }
.svc-row .icon-btn.danger:hover { border-color: var(--red); color: var(--red); }

.svc-add-row {
  padding: 22px 0;
  border-bottom: 1px solid var(--rule);
  display: flex; justify-content: space-between; align-items: center;
}
.svc-add-row .btn { padding: 12px 18px; font-size: 11px; }
.svc-add-row .helper { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }

/* ========== GALLERY ========== */
.gal-block { margin-bottom: 36px; }
.gal-block__head {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 0 0 16px;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 22px;
  flex-wrap: wrap; gap: 12px;
}
.gal-block__head .l { display: flex; align-items: baseline; gap: 14px; }
.gal-block__head .step { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.gal-block__head .ttl { font-family: var(--serif); font-size: 24px; line-height: 1; letter-spacing: -0.005em; }
.gal-block__head .meta { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.gal-block__head .meta b { color: var(--bone); font-weight: 500; }

.upload-zone {
  border: 1px dashed var(--rule);
  padding: 56px 36px;
  display: flex; flex-direction: column; align-items: center; gap: 18px;
  text-align: center;
  background: rgba(var(--bone-rgb), 0.012);
  cursor: pointer;
  transition: all .3s ease;
  margin-bottom: 32px;
}
.upload-zone:hover, .upload-zone.is-drag { border-color: var(--brass); background: rgba(var(--brass-rgb), 0.05); }
.upload-zone .plus { font-family: var(--serif); font-size: 64px; color: var(--brass); line-height: 1; }
.upload-zone .title { font-family: var(--serif); font-size: 24px; }
.upload-zone .sub { font-size: 12px; letter-spacing: 0.05em; color: var(--bone-dim); max-width: 40ch; }
.upload-zone .specs { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); margin-top: 4px; }
.file-in { display: none; }

.gallery-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.g-tile {
  aspect-ratio: 4 / 5;
  background: var(--ink-2);
  border: 1px solid var(--rule);
  position: relative;
  overflow: hidden;
  transition: border-color .3s ease;
}
.g-tile:hover { border-color: var(--brass); }
.g-tile .ph-fill {
  position: absolute; inset: 0;
  background:
    linear-gradient(135deg, rgba(var(--brass-rgb), 0.08) 0%, rgba(var(--brass-rgb), 0) 50%),
    repeating-linear-gradient(45deg, rgba(var(--bone-rgb), 0.025) 0 2px, transparent 2px 14px),
    var(--ink-2);
  display: flex; align-items: center; justify-content: center;
}
.g-tile .ph-fill .ph-mono {
  font-family: var(--serif);
  font-size: 72px;
  color: rgba(var(--brass-rgb), 0.22);
  letter-spacing: -0.02em;
  line-height: 1;
}
.g-tile .tag {
  position: absolute; top: 12px; left: 12px;
  font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--bone-dim);
  background: rgba(var(--ink-rgb), 0.75);
  border: 1px solid var(--rule);
  padding: 4px 8px;
  z-index: 2;
}
.g-tile .tag.cover { color: var(--brass); border-color: rgba(var(--brass-rgb), 0.4); background: rgba(var(--ink-rgb), 0.9); }
.g-tile .caption {
  position: absolute; left: 12px; right: 12px; bottom: 12px;
  display: flex; justify-content: space-between; align-items: baseline;
  font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--bone-dim);
  background: linear-gradient(to top, rgba(var(--ink-rgb), 0.85) 30%, rgba(var(--ink-rgb), 0));
  padding: 24px 4px 2px;
  z-index: 2;
  transition: opacity .25s ease;
}
.g-tile .caption > span:first-child { color: var(--bone); font-family: var(--serif); font-size: 14px; letter-spacing: 0; text-transform: none; }
.g-tile:hover .caption { opacity: 0; }
.g-tile .controls {
  position: absolute; inset: auto 0 0 0; padding: 12px;
  display: flex; gap: 6px; justify-content: space-between;
  background: linear-gradient(to top, rgba(var(--ink-rgb), 0.92), rgba(var(--ink-rgb), 0));
  opacity: 0; transition: opacity .25s ease;
  z-index: 3;
}
.g-tile:hover .controls { opacity: 1; }
.g-tile .controls button {
  background: rgba(var(--ink-rgb), 0.75);
  border: 1px solid var(--rule);
  color: var(--bone);
  padding: 6px 10px; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
  cursor: pointer; transition: all .25s ease;
}
.g-tile .controls button:hover { background: var(--bone); color: var(--ink); border-color: var(--bone); }
.g-tile .controls button.danger:hover { background: var(--red); color: var(--ink); border-color: var(--red); }

/* responsive */
@media (max-width: 1200px) {
  .chairs-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .gallery-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1100px) {
  .meta-strip { grid-template-columns: 1fr 1fr; }
  .meta-strip .cell { border-right: 0; border-bottom: 1px solid var(--rule); }
  .meta-strip .cell.action { grid-column: 1 / -1; align-items: stretch; }
  .svc-row { grid-template-columns: 50px 1fr 1fr 90px 100px auto; gap: 18px; }
  .chairs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rent-summary { grid-template-columns: 1fr 1fr; }
  .rent-summary__cell { border-right: 0; border-bottom: 1px solid var(--rule); }
  .rent-summary__cell:nth-child(odd) { border-right: 1px solid var(--rule); }
}
@media (max-width: 800px) {
  .ledger-head { padding: 56px 22px 0; }
  .topline { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
  .ledger-head__mono { font-size: 200px; right: -20px; top: -10px; }
  .meta-strip { grid-template-columns: 1fr; margin-top: 40px; }
  .meta-strip .cell { border-right: 0 !important; }
  .appt { grid-template-columns: 90px 1fr; gap: 18px 22px; padding: 24px 0; }
  .appt__date .d { font-size: 32px; }
  .appt__col { grid-column: 1 / -1; flex-direction: row; gap: 14px; align-items: baseline; }
  .appt__action { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; min-width: 0; }
  .hours-table { grid-template-columns: 1fr; }
  .hours-row > * { padding: 14px 20px; border-bottom: 1px solid var(--rule); }
  .hours-row > .day { padding-bottom: 6px; border-bottom: 0; }
  .chairs-grid { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .svc-row { grid-template-columns: 1fr; gap: 12px; padding: 24px 0; }
  .svc-row .controls { justify-content: flex-end; }
  .rent-summary { grid-template-columns: 1fr; }
  .rent-summary__cell { border-right: 0 !important; border-bottom: 1px solid var(--rule); }
  .rent-summary__cell:last-child { border-bottom: 0; }
}
</style>
