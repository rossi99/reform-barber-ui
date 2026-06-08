<script setup lang="ts">
definePageMeta({ accountRole: 'Founder · Nigel' })
useHead({ title: 'The House — RE:FORM Hair & Culture' })

type ApptStatus = 'upcoming' | 'past' | 'cancelled'
type FilterKey = ApptStatus | 'late' | 'all'

interface Appt {
  id: number
  dow: string
  d: string
  m: string
  status: ApptStatus
  svcNum: string
  svcName: string
  svcPlus?: boolean
  duration: string
  price: string
  client: string
  clientType?: 'Regular' | 'New'
  chair: string
  timeStart: string
  timeEnd: string
  pillCancelled?: string
  late?: boolean
  resolved?: boolean
}

const FOUNDER = 'Nigel'

const appts = reactive<Appt[]>([
  { id: 1, dow: 'Today', d: '18', m: "May ' 26", status: 'upcoming', svcNum: '01', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Daniel Mahood', clientType: 'Regular', chair: 'Barlow', timeStart: '11:00', timeEnd: '11:40' },
  { id: 2, dow: 'Today', d: '18', m: "May ' 26", status: 'upcoming', svcNum: '02', svcName: 'Precision Cut', duration: '30 min', price: '£25.00', client: 'Conor McAllister', clientType: 'Regular', chair: 'Josh', timeStart: '11:30', timeEnd: '12:00' },
  { id: 3, dow: 'Today', d: '18', m: "May ' 26", status: 'upcoming', svcNum: '03', svcName: 'Classic Cut', duration: '20 min', price: '£20.00', client: "James O'Hara", clientType: 'New', chair: 'Kieran', timeStart: '12:00', timeEnd: '12:20' },
  { id: 4, dow: 'Tue', d: '20', m: "May ' 26", status: 'upcoming', svcNum: '04', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Ryan Patterson', clientType: 'Regular', chair: 'Barlow', timeStart: '10:00', timeEnd: '10:40' },
  { id: 5, dow: 'Sat', d: '23', m: "May ' 26", status: 'upcoming', svcNum: '05', svcName: 'Precision Cut', duration: '30 min', price: '£25.00', client: 'Aaron Kelly', clientType: 'Regular', chair: 'Jordan', timeStart: '09:30', timeEnd: '10:00' },
  { id: 6, dow: 'Fri', d: '16', m: "May ' 26", status: 'past', svcNum: '06', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Stephen Lyttle', clientType: 'Regular', chair: 'Barlow', timeStart: '15:15', timeEnd: '15:55', late: false, resolved: false },
  { id: 7, dow: 'Fri', d: '16', m: "May ' 26", status: 'past', svcNum: '07', svcName: 'Classic Cut', duration: '20 min', price: '£20.00', client: 'Mark Bell', clientType: 'Regular', chair: 'Nigel', timeStart: '14:30', timeEnd: '14:50', late: false, resolved: false },
  { id: 8, dow: 'Thu', d: '15', m: "May ' 26", status: 'past', svcNum: '08', svcName: 'Precision Cut', duration: '30 min', price: '£25.00', client: 'Paul Greene', clientType: 'Regular', chair: 'Josh', timeStart: '18:00', timeEnd: '18:30', late: true, resolved: false },
  { id: 9, dow: 'Tue', d: '13', m: "May ' 26", status: 'cancelled', svcNum: '09', svcName: 'Precision Cut', duration: '30 min', price: '£25.00', client: 'Liam Hughes', clientType: 'New', chair: 'Barlow', timeStart: '12:00', timeEnd: '12:30', pillCancelled: 'No-show · fee applied' },
  { id: 10, dow: 'Sat', d: '10', m: "May ' 26", status: 'cancelled', svcNum: '10', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Conor McAllister', clientType: 'Regular', chair: 'Kieran', timeStart: '11:00', timeEnd: '11:40', pillCancelled: 'Cancelled by client' },
])

function categorize(a: Appt): FilterKey {
  if (a.status === 'past' && a.late && !a.resolved) return 'late'
  return a.status
}

const filter = ref<FilterKey>('upcoming')
const scope = ref<'all' | 'mine'>('all')

function inScope(a: Appt): boolean {
  return scope.value === 'all' || a.chair === FOUNDER
}

const counts = computed(() => ({
  upcoming: appts.filter(a => inScope(a) && categorize(a) === 'upcoming').length,
  past: appts.filter(a => inScope(a) && categorize(a) === 'past').length,
  late: appts.filter(a => inScope(a) && categorize(a) === 'late').length,
  cancelled: appts.filter(a => inScope(a) && categorize(a) === 'cancelled').length,
  all: appts.filter(a => inScope(a)).length,
}))

const filteredAppts = computed(() =>
  appts.filter(a => inScope(a) && (filter.value === 'all' || categorize(a) === filter.value)),
)

function markLate(a: Appt) { a.late = true; a.resolved = false }
function markResolved(a: Appt) { a.resolved = true }
function reopen(a: Appt) { a.resolved = false }

// ===== Leaderboard =====
interface LbRow {
  id: string
  name: string
  title: string
  bookings: number
  revenue: number
  delta: number
  util: number
}

const lbRowsSource: LbRow[] = [
  { id: 'barlow', name: 'Barlow', title: 'Head Barber',   bookings: 168, revenue: 4310, delta: 8.1, util: 92 },
  { id: 'josh',   name: 'Josh',   title: 'Senior Barber', bookings: 154, revenue: 3946, delta: 5.4, util: 88 },
  { id: 'jordan', name: 'Jordan', title: 'Senior Barber', bookings: 142, revenue: 3633, delta: 2.1, util: 81 },
  { id: 'nigel',  name: 'Nigel',  title: 'Founder',       bookings: 138, revenue: 3612, delta: 1.8, util: 76 },
  { id: 'kieran', name: 'Kieran', title: 'Barber',        bookings: 116, revenue: 2919, delta: -1.2, util: 68 },
]

type SortKey = 'name' | 'bookings' | 'revenue' | 'delta' | 'util'
const sortState = reactive<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'bookings', dir: 'desc' })

const sortedRows = computed(() => {
  const out = [...lbRowsSource].sort((a, b) => {
    const k = sortState.key
    const av = a[k] as string | number
    const bv = b[k] as string | number
    let cmp = 0
    if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
    else cmp = String(av).localeCompare(String(bv))
    return sortState.dir === 'asc' ? cmp : -cmp
  })
  return out
})

function clickSort(key: SortKey) {
  if (sortState.key === key) {
    sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc'
  } else {
    sortState.key = key
    sortState.dir = key === 'name' ? 'asc' : 'desc'
  }
}

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
  num: string
  name: string
  desc: string
  duration: string
  price: string
}
const services = reactive<Svc[]>([
  { num: '01', name: 'Precision Cut', desc: 'Most booked. Skin fades, tapers and modern styles, finished clean and designed to sit well as it grows out.', duration: '30 min', price: '£25.00' },
  { num: '02', name: 'Precision Cut + Beard', desc: 'Skin fades, tapers and modern styles with beard work. Detailed, balanced finish — designed to sit well as it grows.', duration: '40 min', price: '£30.00' },
  { num: '03', name: 'Classic + Beard', desc: 'A quick, simple cut with beard work included. Clipper grades or basic scissor work — no skin fades or tight tapers.', duration: '30 min', price: '£25.00' },
  { num: '04', name: 'Classic Cut', desc: 'Grades 0.5 — 8. A quick, simple, no fuss cut. Clipper with basic scissor work on top.', duration: '20 min', price: '£20.00' },
  { num: '05', name: 'Under 16', desc: 'Standard cuts only. Skin fades must be booked as a Precision Cut.', duration: '20 min', price: '£15.00' },
  { num: '06', name: 'Senior Gent · 65+', desc: "A standard cut for the regulars who've been sitting in chairs longer than we have.", duration: '20 min', price: '£15.00' },
])

// ===== Gallery =====
const galleryTiles = [
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
const sectionIds = ['insights', 'diary', 'hours', 'chairs', 'work', 'gallery'] as const
const activeSection = ref<typeof sectionIds[number]>('insights')

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
</script>

<template>
  <main class="founder-main">
    <!-- ===== HEAD ===== -->
    <header class="ledger-head">
      <div class="ledger-head__inner">
        <div class="topline">
          <div class="label">— Vol<span class="colon">:</span> 01 / The House</div>
          <div class="label">Signed in as Nigel <span class="colon">·</span> <NuxtLink to="/account">Logout →</NuxtLink></div>
        </div>

        <h1>The <em>house.</em></h1>
        <p class="greeting">Morning, <strong>Nigel</strong>. Every chair, every page — <span class="brass-accent">yours to set</span>.</p>

        <div class="meta-strip">
          <div class="cell"><span class="k">Today <small class="cell-sub">— all chairs</small></span><span class="v">26 bookings</span></div>
          <div class="cell"><span class="k">This week</span><span class="v">142 cuts</span></div>
          <div class="cell"><span class="k">Open chairs</span><span class="v">5 active</span></div>
          <div class="cell"><span class="k">Members</span><span class="v">1,284 on file</span></div>
          <div class="cell"><span class="k">Revenue <span class="colon">·</span> month</span><span class="v"><span class="brass-accent">£</span>18,420</span></div>
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
          {{ ({ insights: 'Insights', diary: 'The Diary', hours: 'Hours', chairs: 'Chairs', work: 'The Work', gallery: 'Gallery' } as Record<string, string>)[id] }}
        </a>
      </div>
    </nav>

    <!-- ===== INSIGHTS ===== -->
    <section id="insights" class="sec sec--alt">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">— 02 / Insights</div>
          <h2>The register<span class="colon">.</span></h2>
          <div class="aside"><span><b>May 2026</b></span><span>Shop-wide</span></div>
        </div>
      </div>

      <div class="wrap wrap--flush">
        <div class="kpis">
          <div class="kpi">
            <span class="k">Revenue <span class="colon">·</span> month</span>
            <span class="v"><span class="currency">£</span>18,420</span>
            <span class="trend up"><span class="arrow">↗</span>+14.2% <small>vs. last month</small></span>
            <svg class="kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
              <polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" points="0,24 10,20 20,18 30,22 40,14 50,12 60,15 70,9 80,11 90,6 100,3" />
            </svg>
          </div>
          <div class="kpi">
            <span class="k">Bookings <span class="colon">·</span> month</span>
            <span class="v">718</span>
            <span class="trend up"><span class="arrow">↗</span>+9.6% <small>vs. last month</small></span>
            <svg class="kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
              <polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" points="0,22 10,20 20,24 30,18 40,16 50,19 60,12 70,14 80,8 90,10 100,5" />
            </svg>
          </div>
          <div class="kpi">
            <span class="k">Repeat clients</span>
            <span class="v">71<span class="unit">%</span></span>
            <span class="trend up"><span class="arrow">↗</span>+2 pts <small>vs. last month</small></span>
            <svg class="kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
              <polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" points="0,18 10,17 20,19 30,15 40,14 50,16 60,13 70,11 80,12 90,9 100,8" />
            </svg>
          </div>
          <div class="kpi">
            <span class="k">Avg. ticket</span>
            <span class="v"><span class="currency">£</span>25<span class="unit">.65</span></span>
            <span class="trend down"><span class="arrow">↘</span>−£0.40 <small>vs. last month</small></span>
            <svg class="kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
              <polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" points="0,10 10,12 20,9 30,11 40,13 50,12 60,15 70,14 80,17 90,16 100,19" />
            </svg>
          </div>
        </div>

        <div class="charts">
          <div class="panel">
            <div class="panel__head">
              <div>
                <div class="k">Revenue <span class="colon">·</span> last 14 days</div>
                <div class="lede">A clean fortnight — Saturday is doing the heavy lifting.</div>
              </div>
              <div class="legend"><span><span class="sw"></span>Daily £</span></div>
            </div>

            <svg class="barchart" viewBox="0 0 700 240" preserveAspectRatio="none" aria-label="Daily revenue chart">
              <line class="gridline" x1="30" y1="50"  x2="700" y2="50" />
              <line class="gridline" x1="30" y1="100" x2="700" y2="100" />
              <line class="gridline" x1="30" y1="150" x2="700" y2="150" />
              <line class="gridline" x1="30" y1="200" x2="700" y2="200" />
              <text class="axis" x="0" y="54">£900</text>
              <text class="axis" x="0" y="104">£700</text>
              <text class="axis" x="0" y="154">£500</text>
              <text class="axis" x="0" y="204">£300</text>

              <g>
                <rect class="bar dim" x="50"  y="160" width="28" height="40"/>
                <rect class="bar dim" x="96"  y="120" width="28" height="80"/>
                <rect class="bar dim" x="142" y="110" width="28" height="90"/>
                <rect class="bar dim" x="188" y="90"  width="28" height="110"/>
                <rect class="bar dim" x="234" y="60"  width="28" height="140"/>
                <rect class="bar dim" x="280" y="20"  width="28" height="180"/>
                <rect class="bar dim" x="326" y="170" width="28" height="30"/>

                <rect class="bar" x="372" y="140" width="28" height="60"/>
                <rect class="bar" x="418" y="100" width="28" height="100"/>
                <rect class="bar" x="464" y="90"  width="28" height="110"/>
                <rect class="bar" x="510" y="65"  width="28" height="135"/>
                <rect class="bar" x="556" y="50"  width="28" height="150"/>
                <rect class="bar" x="602" y="15"  width="28" height="185"/>
                <rect class="bar" x="648" y="170" width="28" height="30"/>
              </g>

              <g class="axis">
                <text x="64"  y="222" text-anchor="middle">M</text>
                <text x="110" y="222" text-anchor="middle">T</text>
                <text x="156" y="222" text-anchor="middle">W</text>
                <text x="202" y="222" text-anchor="middle">T</text>
                <text x="248" y="222" text-anchor="middle">F</text>
                <text x="294" y="222" text-anchor="middle">S</text>
                <text x="340" y="222" text-anchor="middle">S</text>
                <text x="386" y="222" text-anchor="middle">M</text>
                <text x="432" y="222" text-anchor="middle">T</text>
                <text x="478" y="222" text-anchor="middle">W</text>
                <text x="524" y="222" text-anchor="middle">T</text>
                <text x="570" y="222" text-anchor="middle">F</text>
                <text x="616" y="222" text-anchor="middle">S</text>
                <text x="662" y="222" text-anchor="middle">S</text>
              </g>
            </svg>
          </div>

          <div class="panel">
            <div class="panel__head">
              <div>
                <div class="k">Service mix <span class="colon">·</span> month</div>
                <div class="lede">What's on the chairs.</div>
              </div>
            </div>
            <div>
              <div class="breakdown__row"><span class="name">Precision <span class="plus">+</span> Beard</span><span class="pct">39%</span><div class="bar-bg"><div class="bar-fill" style="width:39%"></div></div></div>
              <div class="breakdown__row"><span class="name">Precision Cut</span><span class="pct">33%</span><div class="bar-bg"><div class="bar-fill" style="width:33%"></div></div></div>
              <div class="breakdown__row"><span class="name">Classic <span class="plus">+</span> Beard</span><span class="pct">12%</span><div class="bar-bg"><div class="bar-fill" style="width:12%"></div></div></div>
              <div class="breakdown__row"><span class="name">Classic Cut</span><span class="pct">9%</span><div class="bar-bg"><div class="bar-fill" style="width:9%"></div></div></div>
              <div class="breakdown__row"><span class="name">Under 16 <span class="colon">·</span> Senior</span><span class="pct">7%</span><div class="bar-bg"><div class="bar-fill" style="width:7%"></div></div></div>
            </div>
          </div>
        </div>

        <!-- Chair leaderboard -->
        <div class="leaderboard">
          <div class="lb__row head">
            <span>#</span>
            <button class="lb-sort" :class="{ 'is-active': sortState.key === 'name' }" type="button" @click="clickSort('name')">
              Chair <span class="sort-arrow">{{ sortState.key === 'name' ? (sortState.dir === 'asc' ? '↑' : '↓') : '' }}</span>
            </button>
            <button class="lb-sort" :class="{ 'is-active': sortState.key === 'bookings' }" type="button" @click="clickSort('bookings')">
              Bookings <span class="sort-arrow">{{ sortState.key === 'bookings' ? (sortState.dir === 'asc' ? '↑' : '↓') : '' }}</span>
            </button>
            <button class="lb-sort col-rev" :class="{ 'is-active': sortState.key === 'revenue' }" type="button" @click="clickSort('revenue')">
              Revenue <span class="sort-arrow">{{ sortState.key === 'revenue' ? (sortState.dir === 'asc' ? '↑' : '↓') : '' }}</span>
            </button>
            <button class="lb-sort delta-col" :class="{ 'is-active': sortState.key === 'delta' }" type="button" @click="clickSort('delta')">
              vs. last month <span class="sort-arrow">{{ sortState.key === 'delta' ? (sortState.dir === 'asc' ? '↑' : '↓') : '' }}</span>
            </button>
            <button class="lb-sort lb-sort--right" :class="{ 'is-active': sortState.key === 'util' }" type="button" @click="clickSort('util')">
              Util. <span class="sort-arrow">{{ sortState.key === 'util' ? (sortState.dir === 'asc' ? '↑' : '↓') : '' }}</span>
            </button>
          </div>

          <div v-for="(r, i) in sortedRows" :key="r.id" class="lb__row">
            <span class="rank" :class="{ 'is-1': i === 0 }">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="who">
              <div class="pic">
                <picture>
                  <source :srcset="`/images/barbers/${r.id}-light.jpg`" media="all">
                  <img :src="`/images/barbers/${r.id}.jpg`" :alt="r.name" />
                </picture>
              </div>
              <div class="meta">
                <span class="name">{{ r.name }}</span>
                <span class="title">{{ r.title }}</span>
              </div>
            </div>
            <span class="num">{{ r.bookings }} <small>cuts</small></span>
            <span class="num col-rev"><span class="currency">£</span>{{ r.revenue.toLocaleString() }}</span>
            <span class="delta delta-col" :class="r.delta >= 0 ? 'up' : 'down'">{{ r.delta >= 0 ? '↗ +' : '↘ ' }}{{ r.delta.toFixed(1) }}%</span>
            <span class="num lb-util">{{ r.util }}<small>%</small></span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== DIARY ===== -->
    <section id="diary" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">— 03 / The Diary</div>
          <h2>Every<br />chair<span class="colon">.</span></h2>
          <div class="aside"><span>All times <span class="colon">·</span> <b>BST</b></span></div>
        </div>

        <div class="diary-bar">
          <div class="filters" role="tablist">
            <button :class="{ active: filter === 'upcoming' }" @click="filter = 'upcoming'">Upcoming <span class="count">{{ counts.upcoming }}</span></button>
            <button :class="{ active: filter === 'past' }" @click="filter = 'past'">Past <span class="count">{{ counts.past }}</span></button>
            <button :class="{ active: filter === 'late' }" @click="filter = 'late'">Late <span class="count">{{ counts.late }}</span></button>
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
              <span class="num">/ {{ a.svcNum }} — {{ a.svcName }}<span v-if="a.svcPlus" class="num-plus"> + Beard</span></span>
              <h3>{{ a.svcName }}<span v-if="a.svcPlus"> <span class="plus">+</span> Beard</span></h3>
              <span class="duration">{{ a.duration }} <span class="colon">·</span> {{ a.price }}</span>
            </div>
            <div class="appt__col">
              <span class="k">Client</span>
              <span class="v">{{ a.client }} <small v-if="a.clientType">{{ a.clientType }}</small></span>
            </div>
            <div class="appt__col">
              <span class="k">Chair</span>
              <span class="v">{{ a.chair }} <small>{{ a.timeStart }} — {{ a.timeEnd }}</small></span>
            </div>
            <div class="appt__action">
              <span v-if="a.status === 'upcoming'" class="pill is-upcoming"><span class="dot"></span>Confirmed</span>
              <span v-else-if="a.status === 'cancelled'" class="pill is-cancelled"><span class="dot"></span>{{ a.pillCancelled }}</span>
              <template v-else>
                <span v-if="!a.late" class="pill"><span class="dot"></span>Completed</span>
                <span v-else-if="!a.resolved" class="pill is-late"><span class="dot"></span>Late arrival <span class="colon">·</span> unresolved</span>
                <span v-else class="pill"><span class="dot"></span>Completed <span class="colon">·</span> was late</span>
              </template>

              <div class="appt__actions">
                <template v-if="a.status === 'past'">
                  <button v-if="!a.late" class="btn btn--ghost" type="button" @click="markLate(a)">Mark late</button>
                  <button v-else-if="!a.resolved" class="btn btn--ghost btn--resolve" type="button" @click="markResolved(a)">Mark resolved</button>
                  <button v-else class="btn btn--ghost" type="button" @click="reopen(a)">Re-open</button>
                </template>
                <button class="btn btn--ghost">{{ a.status === 'upcoming' ? 'Details' : 'View' }}</button>
              </div>
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
          <div class="num">— 04 / Hours</div>
          <h2>When the<br />door's open<span class="colon">.</span></h2>
          <div class="aside"><span>Live on <b>reformbarber.co.uk</b></span></div>
        </div>

        <div class="editable-card">
          <div class="hours-table">
            <div class="hours-row head">
              <span>Day</span><span>Open</span><span>Close</span><span class="status-cell">Status</span>
            </div>
            <div v-for="row in hours" :key="row.day" class="hours-row">
              <span class="day">{{ row.day }}<small v-if="row.late" class="day-late"> — Late</small></span>
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
          <div class="num">— 05 / The Chairs</div>
          <h2>Who's<br />on the floor<span class="colon">.</span></h2>
          <div class="aside"><span><b>5 active</b></span><span>1 archived</span></div>
        </div>

        <div class="rent-summary">
          <div class="rent-summary__cell is-total">
            <span class="k">Chair rent <span class="colon">·</span> month</span>
            <span class="v"><span class="currency">£</span>2,645</span>
            <span class="sub">— from <b>4 chairs</b> on rent</span>
          </div>
          <div class="rent-summary__cell">
            <span class="k">Per week</span>
            <span class="v"><span class="currency">£</span>610</span>
            <span class="sub">— collected Fridays</span>
          </div>
          <div class="rent-summary__cell">
            <span class="k">Next collection</span>
            <span class="v">Fri <span class="colon">·</span> 22 May</span>
            <span class="sub">— 4 days</span>
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
          <div class="num">— 06 / The Work</div>
          <h2>Services<br /><em>priced</em><span class="colon">.</span></h2>
          <div class="aside"><span><b>6 active</b></span><span>Live on /services</span></div>
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
            <span class="helper">— Add a new service</span>
            <button class="btn btn--ghost btn--add">+ &nbsp;Add Service</button>
          </div>
        </div>

        <div class="save-foot save-foot--flush">
          <span class="status"><span class="dot"></span>All changes saved <span class="colon">·</span> Last edit 2 min ago</span>
          <div class="save-foot__btns">
            <button class="btn btn--ghost">Discard</button>
            <button class="btn btn--ghost btn--publish">Publish Menu</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== GALLERY ===== -->
    <section id="gallery" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="num">— 07 / Gallery</div>
          <h2>The wall<span class="colon">.</span></h2>
          <div class="aside"><span><b>24 images</b></span><span>Live on /gallery</span></div>
        </div>

        <div class="gal-block">
          <div class="gal-block__head">
            <div class="l">
              <span class="step">/ 01</span>
              <span class="ttl">Add to the wall</span>
            </div>
            <span class="meta">Drop multiple — they'll appear below</span>
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
            <span class="sub">Fresh cuts, the room at golden hour, the chair before opening — anything worth the wall.</span>
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

<style scoped>
.founder-main { flex: 1; padding-top: 80px; }
.colon { color: var(--brass); }
.brass-accent { color: var(--brass); }
.btn .arrow { transition: transform .25s ease; }
.btn:hover .arrow { transform: translateX(4px); }
.btn--danger { border-color: rgba(var(--red-rgb), 0.35); color: var(--red); padding: 9px 14px; font-size: 10px; letter-spacing: 0.18em; }
.btn--danger:hover { background: var(--red); color: var(--ink); border-color: var(--red); }
.btn--publish { border-color: var(--bone); color: var(--bone); }
.btn--add { border-color: var(--brass); color: var(--brass); }

.wrap { max-width: 1320px; margin: 0 auto; padding: 0 36px; }
.wrap--flush { padding-left: 0; padding-right: 0; }

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
.sec-head .aside { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); display: flex; gap: 24px; align-items: baseline; }
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
.greeting strong { color: var(--bone); font-weight: 400; font-style: italic; }

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
.kpi { padding: 36px 32px; border-right: 1px solid var(--rule); display: flex; flex-direction: column; gap: 16px; position: relative; }
.kpi:last-child { border-right: 0; }
.kpi .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.kpi .v {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(40px, 4.2vw, 64px); line-height: 1; letter-spacing: -0.02em;
}
.kpi .v .unit { font-size: 0.5em; color: var(--bone-dim); margin-left: 6px; letter-spacing: 0; }
.kpi .v .currency { color: var(--brass); margin-right: 2px; }
.kpi .trend { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.kpi .trend.up { color: var(--green); }
.kpi .trend.down { color: var(--red); }
.kpi .trend .arrow { font-family: var(--serif); font-size: 18px; line-height: 1; }
.kpi .trend small { color: var(--bone-dim); }
.kpi__spark { position: absolute; right: 24px; bottom: 24px; width: 90px; height: 32px; opacity: 0.75; color: var(--brass); }

/* charts */
.charts { display: grid; grid-template-columns: 2fr 1fr; border-bottom: 1px solid var(--rule); }
.panel { padding: 36px 32px 40px; border-right: 1px solid var(--rule); }
.panel:last-child { border-right: 0; }
.panel__head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 28px; gap: 24px; flex-wrap: wrap; }
.panel__head .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.panel__head .lede { font-family: var(--serif); font-size: 22px; line-height: 1.1; margin-top: 6px; }
.panel__head .legend { display: flex; gap: 16px; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.panel__head .legend span { display: inline-flex; align-items: center; gap: 6px; }
.panel__head .legend .sw { width: 10px; height: 2px; background: var(--brass); }

.barchart { width: 100%; height: 240px; }
.barchart .axis { font-family: var(--grot); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; fill: var(--bone-dim); }
.barchart .gridline { stroke: var(--rule); stroke-width: 1; }
.barchart .bar { fill: var(--brass); }
.barchart .bar.dim { fill: rgba(var(--brass-rgb), 0.25); }

.breakdown__row { display: grid; grid-template-columns: 1fr auto; padding: 14px 0; border-bottom: 1px solid var(--rule); align-items: baseline; }
.breakdown__row:last-child { border-bottom: 0; }
.breakdown__row .name { font-family: var(--serif); font-size: 18px; }
.breakdown__row .name .plus { color: var(--brass); }
.breakdown__row .pct { color: var(--bone-dim); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; }
.breakdown__row .bar-bg { grid-column: 1 / -1; height: 2px; background: var(--rule); margin-top: 12px; position: relative; }
.breakdown__row .bar-fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--brass); }

/* leaderboard */
.leaderboard { border-top: 1px solid var(--rule); }
.lb__row {
  display: grid;
  grid-template-columns: 40px 1.4fr 1fr 1fr 1fr 80px;
  gap: 24px; padding: 20px 32px;
  border-bottom: 1px solid var(--rule);
  align-items: center;
}
.lb__row.head { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); padding: 14px 32px; }
.lb-sort {
  background: transparent; border: 0; padding: 0; margin: 0;
  font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit;
  text-align: left; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
  transition: color .2s ease;
}
.lb-sort:hover { color: var(--bone); }
.lb-sort.is-active { color: var(--brass); }
.lb-sort--right { justify-content: flex-end; width: 100%; }
.lb-sort .sort-arrow {
  font-family: var(--serif); font-size: 13px; letter-spacing: 0;
  line-height: 1; width: 8px; text-align: center;
}
.lb__row .rank { font-family: var(--serif); font-size: 24px; color: var(--bone-dim); }
.lb__row .rank.is-1 { color: var(--brass); }
.lb__row .who { display: flex; align-items: center; gap: 14px; }
.lb__row .who .pic { width: 44px; height: 44px; border: 1px solid var(--rule); background: var(--ink-2); position: relative; overflow: hidden; flex-shrink: 0; }
.lb__row .who .pic picture, .lb__row .who .pic img { width: 100%; height: 100%; display: block; object-fit: cover; }
.lb__row .who .meta { display: flex; flex-direction: column; gap: 2px; }
.lb__row .who .name { font-family: var(--serif); font-size: 20px; line-height: 1; }
.lb__row .who .title { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.lb__row .num { font-family: var(--serif); font-size: 22px; line-height: 1; font-variant-numeric: tabular-nums; }
.lb__row .num .currency { color: var(--brass); }
.lb__row .num small { font-family: var(--grot); font-size: 11px; color: var(--bone-dim); letter-spacing: 0.04em; margin-left: 4px; }
.lb__row .lb-util { text-align: right; }
.lb__row .delta { font-size: 11px; letter-spacing: 0.04em; }
.lb__row .delta.up { color: var(--green); }
.lb__row .delta.down { color: var(--red); }

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
.filters button:hover { color: var(--bone); }
.filters button.active { color: var(--bone); border-bottom-color: var(--brass); }
.filters button .count { font-family: var(--serif); font-size: 13px; letter-spacing: 0; color: var(--bone-dim); font-weight: 400; }
.filters button.active .count { color: var(--brass); }
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
.diary-empty {
  padding: 56px 0;
  text-align: center;
  border-bottom: 1px solid var(--rule);
}
.diary-empty .lede { font-family: var(--serif); font-size: 28px; line-height: 1.1; margin-bottom: 8px; }
.diary-empty .sub { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.diary-empty .sub b { color: var(--bone); font-weight: 500; }

.appt { display: grid; grid-template-columns: 110px 1.3fr 1fr 1fr auto; gap: 32px; padding: 28px 0; border-bottom: 1px solid var(--rule); align-items: center; transition: padding .3s ease, background .3s ease; }
.appt:hover { padding-left: 18px; padding-right: 18px; background: linear-gradient(to right, rgba(var(--brass-rgb), 0.03), transparent 60%); }
.appt__date { display: flex; flex-direction: column; gap: 4px; font-variant-numeric: tabular-nums; border-left: 2px solid var(--brass); padding-left: 18px; }
.appt[data-status="past"] .appt__date { border-left-color: var(--rule); }
.appt[data-status="cancelled"] .appt__date { border-left-color: var(--bone-dim); opacity: 0.65; }
.appt__date .dow { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.appt__date .d { font-family: var(--serif); font-size: 42px; line-height: 1; letter-spacing: -0.02em; }
.appt__date .m { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); margin-top: 4px; }
.appt__svc { display: flex; flex-direction: column; gap: 8px; }
.appt__svc .num { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.appt__svc .num-plus { color: var(--brass); }
.appt__svc h3 { font-family: var(--serif); font-weight: 400; font-size: 26px; line-height: 1.05; letter-spacing: -0.01em; }
.appt__svc h3 .plus { color: var(--brass); }
.appt__svc .duration { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.appt__col { display: flex; flex-direction: column; gap: 6px; }
.appt__col .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.appt__col .v { font-family: var(--serif); font-size: 18px; line-height: 1.1; }
.appt__col .v small { font-family: var(--grot); font-size: 11px; color: var(--bone-dim); margin-left: 8px; letter-spacing: 0.04em; text-transform: none; }
.appt__action { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; min-width: 180px; }
.pill { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; padding: 6px 12px; border: 1px solid var(--rule); color: var(--bone-dim); background: rgba(var(--bone-rgb), 0.02); }
.pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bone-dim); }
.pill.is-upcoming { color: var(--brass); border-color: rgba(var(--brass-rgb), 0.4); background: rgba(var(--brass-rgb), 0.06); }
.pill.is-upcoming .dot { background: var(--brass); box-shadow: 0 0 0 3px rgba(var(--brass-rgb), 0.18); }
.pill.is-cancelled { color: var(--red); border-color: rgba(var(--red-rgb), 0.35); }
.pill.is-cancelled .dot { background: var(--red); }
.pill.is-late { color: rgb(var(--amber-rgb)); border-color: rgba(var(--amber-rgb), 0.45); background: rgba(var(--amber-rgb), 0.07); }
.pill.is-late .dot { background: rgb(var(--amber-rgb)); box-shadow: 0 0 0 3px rgba(var(--amber-rgb), 0.18); }
.appt__actions { display: flex; gap: 8px; }
.btn--resolve { border-color: rgba(var(--amber-rgb), 0.55); color: rgb(var(--amber-rgb)); background: rgba(var(--amber-rgb), 0.06); }
.btn--resolve:hover { background: rgb(var(--amber-rgb)); color: var(--ink); border-color: rgb(var(--amber-rgb)); }

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
.svc-list { border-top: 1px solid var(--rule); }
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
.svc-row .num { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.svc-name {
  font-family: var(--serif); font-size: clamp(20px, 2vw, 28px);
  background: transparent; border: none; color: var(--bone);
  width: 100%; padding: 4px 0;
  border-bottom: 1px dashed transparent;
  transition: border-color .2s ease; outline: none;
  letter-spacing: -0.01em;
}
.svc-name:hover, .svc-name:focus { border-bottom-color: var(--brass); }
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
.svc-dur:focus, .svc-price:focus { border-color: var(--brass); }
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
  .meta-strip .cell:nth-child(odd) { border-right: 1px solid var(--rule); }
  .meta-strip .cell.action { grid-column: 1 / -1; align-items: stretch; }
  .kpis { grid-template-columns: repeat(2, 1fr); }
  .kpi { border-bottom: 1px solid var(--rule); }
  .kpi:nth-child(odd) { border-right: 1px solid var(--rule); }
  .kpi:nth-child(even) { border-right: 0; }
  .charts { grid-template-columns: 1fr; }
  .panel { border-right: 0; border-bottom: 1px solid var(--rule); }
  .panel:last-child { border-bottom: 0; }
  .lb__row { grid-template-columns: 30px 1.4fr 1fr 1fr 1fr; padding: 18px 24px; gap: 16px; }
  .lb__row .delta-col { display: none; }
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
  .jump { top: 70px; }
  .wrap { padding: 0 22px; }
  .sec { padding: 56px 0; }
  .sec-head { grid-template-columns: 1fr; gap: 14px; }
  .kpis { grid-template-columns: 1fr; }
  .kpi { border-right: 0 !important; padding: 28px 22px; }
  .panel { padding: 28px 22px; }
  .lb__row { grid-template-columns: 30px 1fr auto; padding: 16px 20px; gap: 14px; }
  .lb__row .col-rev, .lb__row .delta-col { display: none; }
  .lb__row.head .col-rev, .lb__row.head .delta-col { display: none; }
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
