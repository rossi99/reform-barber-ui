<script setup lang="ts">
import type { Barber, BookingRow, MediaItem, Service } from '~/types/api'
import { toAppts, periods, within, plural, type Appt, type ApptStatus } from '~/utils/appointments'
import { portrait, role } from '~/utils/barbers'

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
// Monday first, as the shop's week reads; dow follows the API (0 = Sunday).
const DAYS = [
  { dow: 1, day: 'Monday' },
  { dow: 2, day: 'Tuesday' },
  { dow: 3, day: 'Wednesday' },
  { dow: 4, day: 'Thursday' },
  { dow: 5, day: 'Friday' },
  { dow: 6, day: 'Saturday' },
  { dow: 0, day: 'Sunday' },
]

interface ChairDay {
  barberId: string
  dow: number
  open: string
  close: string
}
interface HoursRow {
  dow: number
  day: string
  open: string
  close: string
  isOpen: boolean
}

const schedules = ref<ChairDay[]>([])
const hours = ref<HoursRow[]>([])
const hoursLoaded = ref('')
const hoursFor = ref<Chair | null>(null) // null: every active chair
const publishingHours = ref(false)
const hoursDirty = computed(() => JSON.stringify(hours.value) !== hoursLoaded.value)

// A day opens with the earliest chair and closes with the last one.
function weekFrom(rows: ChairDay[]): HoursRow[] {
  return DAYS.map(({ dow, day }) => {
    const on = rows.filter(r => r.dow === dow)
    const open = on.map(r => r.open).sort()[0] ?? ''
    const close = on.map(r => r.close).sort().at(-1) ?? ''
    return { dow, day, open, close, isOpen: on.length > 0 }
  })
}

function showHours() {
  const ids = hoursFor.value
    ? [hoursFor.value.barber.id]
    : chairs.value.filter(c => c.barber.active).map(c => c.barber.id)
  hours.value = weekFrom(schedules.value.filter(s => ids.includes(s.barberId)))
  hoursLoaded.value = JSON.stringify(hours.value)
}

async function loadHours() {
  try {
    schedules.value = await api<ChairDay[]>('/api/founder/hours')
    showHours()
  } catch {
    toast.error('Could not load the hours')
  }
}

function editHoursFor(c: Chair | null) {
  hoursFor.value = c
  showHours()
  document.getElementById('hours')?.scrollIntoView({ behavior: 'smooth' })
}

async function publishHours() {
  if (!hoursFor.value && !confirm("Publish these hours to every chair? Any chair's own hours are replaced.")) return
  publishingHours.value = true
  try {
    await api('/api/founder/hours', {
      method: 'PUT',
      body: {
        barberId: hoursFor.value?.barber.id,
        days: hours.value.filter(r => r.isOpen).map(({ dow, open, close }) => ({ dow, open, close })),
      },
    })
    toast.success(hoursFor.value ? `${hoursFor.value.barber.name}'s hours published` : 'Hours published to every chair')
    await loadHours()
  } catch (err) {
    toast.error((err as { data?: { error?: string } })?.data?.error ?? 'Could not publish the hours')
  } finally {
    publishingHours.value = false
  }
}

function toggleDay(row: HoursRow) {
  row.isOpen = !row.isOpen
  if (!row.isOpen) { row.open = ''; row.close = '' }
  else { if (!row.open) row.open = '09:00'; if (!row.close) row.close = '16:30' }
}

// ===== Chair cards =====
interface Chair {
  barber: Barber
  name: string
  title: string
  busy: boolean
  saved: boolean
}
const chairs = ref<Chair[]>([])
const activeChairs = computed(() => chairs.value.filter(c => c.barber.active).length)

async function loadChairs() {
  try {
    const rows = await api<Barber[]>('/api/founder/barbers')
    chairs.value = rows.map(b => ({ barber: b, name: b.name, title: b.title, busy: false, saved: false }))
  } catch {
    toast.error('Could not load the chairs')
  }
}

function chairDirty(c: Chair): boolean {
  return c.name !== c.barber.name || c.title !== c.barber.title
}

// The update replaces every field, so the ones this card can't edit go back as they came.
async function chairSave(c: Chair, active = c.barber.active) {
  c.busy = true
  try {
    await api(`/api/founder/barbers/${c.barber.id}`, {
      method: 'PUT',
      body: { name: c.name, title: c.title, bio: c.barber.bio, num: c.barber.num, active },
    })
    c.barber = { ...c.barber, name: c.name, title: c.title, active }
    c.saved = true
    setTimeout(() => { c.saved = false }, 1600)
  } catch {
    toast.error(`Could not save ${c.barber.name}'s chair`)
  } finally {
    c.busy = false
  }
}

function chairDiscard(c: Chair) {
  c.name = c.barber.name
  c.title = c.barber.title
}

function chairArchive(c: Chair, archive: boolean) {
  if (archive && !confirm(`Archive ${c.barber.name}'s chair? It comes off the site and stops taking bookings.`)) return
  chairSave(c, !archive)
}

// This month's cuts and takings for one chair, from the diary.
function chairMonth(c: Chair) {
  const mine = within(appts.value, periods().month).filter(a => a.chair === c.barber.name)
  return { cuts: mine.length, pounds: Math.round(mine.reduce((sum, a) => sum + a.pence, 0) / 100) }
}

// ===== Services =====
interface Svc {
  id: string
  num: string
  name: string
  nameHtml: string
  desc: string
  durationMins: number
  pounds: number
  published: boolean
  saved: { name: string; desc: string; durationMins: number; pounds: number }
}

const api = useApiFetch()
const toast = useToast()

const services = ref<Svc[]>([])
const publishing = ref(false)

function toSvc(s: Service): Svc {
  const fields = { name: s.name, desc: s.description, durationMins: s.duration, pounds: s.price / 100 }
  return { id: s.id, num: s.num, nameHtml: s.name_html, published: s.published, ...fields, saved: { ...fields } }
}

function svcDirty(s: Svc): boolean {
  const { name, desc, durationMins, pounds } = s.saved
  return s.name !== name || s.desc !== desc || s.durationMins !== durationMins || s.pounds !== pounds
}

const dirtyServices = computed(() => services.value.filter(svcDirty))

// The public menu renders name_html, so a renamed service goes out as its
// plain new name, escaped.
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)
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
    // Edits go first, so what goes live is what's on screen.
    await Promise.all(
      dirtyServices.value.map(s =>
        api(`/api/founder/services/${s.id}`, {
          method: 'PUT',
          body: {
            num: s.num,
            name: s.name,
            nameHtml: s.name === s.saved.name ? s.nameHtml : escapeHtml(s.name),
            description: s.desc,
            duration: s.durationMins,
            price: Math.round(s.pounds * 100),
            active: s.published,
          },
        }),
      ),
    )
    await Promise.all(
      services.value.map(s =>
        api(`/api/founder/services/${s.id}/publish`, {
          method: 'PATCH',
          body: { published: true },
        }),
      ),
    )
    toast.success('Menu published - now live on /services')
    await loadServices()
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
const members = ref(0)

async function loadMembers() {
  try {
    members.value = (await api<{ count: number }>('/api/founder/members')).count
  } catch {
    toast.error('Could not load the member count')
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
  loadMembers()
  // The shop's week is drawn from the active chairs, so they load first.
  loadChairs().then(loadHours)
  loadGallery()
})

// ===== Gallery =====
const GALLERY_PREVIEW = 8
const gallery = ref<MediaItem[]>([])
const showAllTiles = ref(false)
const uploading = ref(0)
const shownTiles = computed(() => (showAllTiles.value ? gallery.value : gallery.value.slice(0, GALLERY_PREVIEW)))

async function loadGallery() {
  try {
    gallery.value = await api<MediaItem[]>('/api/media/gallery')
  } catch {
    toast.error('Could not load the gallery')
  }
}

// The file name stands in for alt text: "skin-fade_01.jpg" reads "skin fade 01".
function altFrom(file: File) {
  return file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
}

async function upload(files: FileList | null | undefined) {
  const images = [...(files ?? [])].filter(f => f.type.startsWith('image/'))
  if (!images.length) return
  uploading.value = images.length
  let failed = 0
  for (const file of images) {
    const form = new FormData()
    form.append('image', file)
    form.append('alt', altFrom(file))
    try {
      await api('/api/founder/media/gallery', { method: 'POST', body: form })
    } catch {
      failed++
    }
    uploading.value--
  }
  if (failed) toast.error(`${failed} of ${images.length} images did not upload`)
  else toast.success(`${plural(images.length, 'image')} added to the wall`)
  await loadGallery()
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  upload(input.files)
  input.value = ''
}

// The wall sorts by sort_order, so the cover is whatever sorts lowest.
async function setCover(t: MediaItem) {
  const first = gallery.value[0]
  if (!first || first.id === t.id) return
  try {
    await api(`/api/founder/media/${t.id}/order`, { method: 'PATCH', body: { sortOrder: first.sort_order - 1 } })
    await loadGallery()
  } catch {
    toast.error('Could not set the cover')
  }
}

async function removeTile(t: MediaItem) {
  if (!confirm('Take this image off the wall?')) return
  try {
    await api(`/api/founder/media/${t.id}`, { method: 'DELETE' })
    gallery.value = gallery.value.filter(x => x.id !== t.id)
  } catch {
    toast.error('Could not remove the image')
  }
}

const dragActive = ref(false)
function onDragEnter(e: DragEvent) { e.preventDefault(); dragActive.value = true }
function onDragOver(e: DragEvent)  { e.preventDefault(); dragActive.value = true }
function onDragLeave(e: DragEvent) { e.preventDefault(); dragActive.value = false }
function onDrop(e: DragEvent)      { e.preventDefault(); dragActive.value = false; upload(e.dataTransfer?.files) }

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
          <div class="aside">
            <span v-if="hoursFor"><b>{{ hoursFor.barber.name }}'s chair</b></span>
            <span v-else><b>Every chair</b></span>
            <a v-if="hoursFor" href="#hours" @click.prevent="editHoursFor(null)">Back to shop hours</a>
            <span v-else>Live on <b>reformbarber.co.uk</b></span>
          </div>
        </div>

        <div class="editable-card">
          <div class="hours-table">
            <div class="hours-row head">
              <span>Day</span><span>Open</span><span>Close</span><span class="status-cell">Status</span>
            </div>
            <div v-for="row in hours" :key="row.dow" class="hours-row">
              <span class="day">{{ row.day }}<small v-if="row.isOpen && row.close > '18:00'" class="day-late"> - Late</small></span>
              <span><input class="time-in" :class="{ closed: !row.isOpen }" type="time" v-model="row.open" :disabled="!row.isOpen" /></span>
              <span><input class="time-in" :class="{ closed: !row.isOpen }" type="time" v-model="row.close" :disabled="!row.isOpen" /></span>
              <span class="toggle">
                <button class="switch" type="button" :aria-checked="row.isOpen ? 'true' : 'false'" :aria-label="`${row.isOpen ? 'Open' : 'Closed'} ${row.day}`" @click="toggleDay(row)"></button>
                <span class="switch-label">{{ row.isOpen ? 'Open' : 'Closed' }}</span>
              </span>
            </div>
          </div>
          <div class="save-foot">
            <span class="status"><span class="dot"></span>{{ hoursDirty ? 'Unsaved changes' : 'All changes saved' }}</span>
            <div class="save-foot__btns">
              <button class="btn btn--ghost" type="button" :disabled="!hoursDirty" @click="showHours()">Discard</button>
              <button class="btn btn--ghost btn--publish" type="button" :disabled="publishingHours || !hoursDirty" @click="publishHours">
                {{ publishingHours ? 'Publishing…' : 'Publish Hours' }}
              </button>
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
          <div class="aside"><span><b>{{ activeChairs }} active</b></span><span>{{ chairs.length - activeChairs }} archived</span></div>
        </div>

        <div class="chairs-grid">
          <div
            v-for="c in chairs"
            :key="c.barber.id"
            class="chair-card"
            :class="{ 'is-dirty': chairDirty(c), 'is-saved': c.saved, 'is-archived': !c.barber.active }"
          >
            <div class="chair-card__pic">
              <picture>
                <source :srcset="portrait(c.barber).srcset" media="all">
                <img :src="portrait(c.barber).src" :alt="c.barber.name" />
              </picture>
              <span class="chair-card__num">/ {{ c.barber.num }} <span class="colon">·</span> {{ c.barber.active ? role(c.barber.title) : 'Archived' }}</span>
            </div>
            <span class="chair-card__saved-flash"><span class="dot"></span>Saved</span>
            <div class="chair-card__body">
              <div class="chair-card__meta">
                <input class="chair-card__name" v-model="c.name" />
                <input class="chair-card__title" v-model="c.title" />
              </div>
              <div class="chair-card__stats">
                <div><span class="s-k">Cuts <span class="colon">·</span> month</span><span class="s-v">{{ chairMonth(c).cuts }}</span></div>
                <div>
                  <span class="s-k">Revenue <span class="colon">·</span> mo</span>
                  <span class="s-v"><span class="currency">£</span>{{ chairMonth(c).pounds.toLocaleString('en-GB') }}</span>
                </div>
              </div>
              <span class="chair-card__dirty-flag"><span class="dot"></span>Unsaved changes</span>
              <div v-if="!chairDirty(c)" class="chair-card__row chair-card__row--default">
                <button class="btn btn--ghost" type="button" @click="editHoursFor(c)">Schedule</button>
                <button v-if="c.barber.active" class="btn btn--danger" type="button" :disabled="c.busy" @click="chairArchive(c, true)">Archive</button>
                <button v-else class="btn btn--ghost" type="button" :disabled="c.busy" @click="chairArchive(c, false)">Restore</button>
              </div>
              <div v-else class="chair-card__row chair-card__row--save">
                <button class="btn btn--ghost btn--discard" type="button" :disabled="c.busy" @click="chairDiscard(c)">Discard</button>
                <button class="btn btn--ghost btn--save" type="button" :disabled="c.busy" @click="chairSave(c)">Save changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== THE WORK / SERVICES ===== -->
    <section id="work" class="sec sec--alt">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">- 05 / The Work</div>
          <h2>Services<br /><em>priced</em><span class="colon">.</span></h2>
          <div class="aside"><span><b>{{ services.filter(s => s.published).length }} active</b></span><span>Live on /services</span></div>
        </div>

        <div class="svc-list">
          <div v-for="s in services" :key="s.id" class="svc-row">
            <span class="num">/ {{ s.num }}</span>
            <input class="svc-name" v-model="s.name" />
            <textarea class="svc-desc" rows="2" v-model="s.desc"></textarea>
            <input class="svc-dur" v-model.number="s.durationMins" type="number" min="5" step="5" aria-label="Minutes" />
            <input class="svc-price" v-model.number="s.pounds" type="number" min="0" step="0.5" aria-label="Price in pounds" />
            <div class="controls">
              <span v-if="!s.published" class="state">Hidden</span>
            </div>
          </div>
        </div>

        <div class="save-foot save-foot--flush">
          <span class="status"><span class="dot"></span>{{ dirtyServices.length ? `${plural(dirtyServices.length, 'unsaved edit')} - publish to save` : 'All changes saved' }}</span>
          <div class="save-foot__btns">
            <button class="btn btn--ghost" type="button" :disabled="!dirtyServices.length" @click="loadServices()">Discard</button>
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
          <div class="aside"><span><b>{{ plural(gallery.length, 'image') }}</b></span><span>Live on /gallery</span></div>
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
            <span v-if="uploading" class="title">Uploading {{ plural(uploading, 'image') }}…</span>
            <span v-else class="title">Drop images, or <span class="brass-accent">browse</span></span>
            <span class="sub">Fresh cuts, the room at golden hour, the chair before opening - anything worth the wall.</span>
            <span class="specs">JPG <span class="colon">·</span> PNG <span class="colon">·</span> Up to 8MB <span class="colon">·</span> 4:5 looks best</span>
            <input id="fileIn" type="file" accept="image/*" multiple class="file-in" @change="onFileInput" />
          </label>
        </div>

        <div class="gal-block">
          <div class="gal-block__head">
            <div class="l">
              <span class="step">/ 02</span>
              <span class="ttl">On the wall now</span>
            </div>
            <span class="meta"><b>{{ shownTiles.length }} of {{ gallery.length }}</b> shown <span class="colon">·</span> Hover a tile to manage</span>
          </div>

          <div class="gallery-grid">
            <div v-for="(t, i) in shownTiles" :key="t.id" class="g-tile">
              <div class="ph-fill"><span class="ph-mono">{{ String(i + 1).padStart(2, '0') }}</span></div>
              <img class="g-img" :src="t.public_url" :alt="t.alt_text ?? ''" loading="lazy" />
              <span class="tag" :class="{ cover: i === 0 }">{{ i === 0 ? 'Cover · 01' : `/ ${String(i + 1).padStart(2, '0')}` }}</span>
              <span class="caption"><span>{{ t.alt_text || 'Untitled' }}</span></span>
              <div class="controls">
                <button v-if="i > 0" type="button" @click="setCover(t)">Set as cover</button>
                <button class="danger" type="button" @click="removeTile(t)">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div class="save-foot save-foot--mt">
          <span class="status"><span class="dot"></span>All changes saved <span class="colon">·</span> {{ plural(gallery.length, 'image') }} published</span>
          <div class="save-foot__btns">
            <button v-if="gallery.length > GALLERY_PREVIEW" class="btn btn--ghost" type="button" @click="showAllTiles = !showAllTiles">
              {{ showAllTiles ? 'Show fewer' : `Show all ${gallery.length} →` }}
            </button>
            <NuxtLink class="btn btn--ghost" to="/gallery">View public gallery →</NuxtLink>
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
.chair-card.is-archived .chair-card__pic { opacity: 0.45; }

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
.svc-row .controls .state { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }

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
.g-tile .g-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
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
}
</style>
