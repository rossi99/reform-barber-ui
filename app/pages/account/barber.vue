<script setup lang="ts">
definePageMeta({ accountRole: 'Chair · Barber view' })
useHead({ title: 'Chair — RE:FORM Hair & Culture' })

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
  clientRegular?: number  // count if regular
  clientNew?: boolean
  timeStart: string
  timeEnd: string
  isNext?: boolean
  pillCancelled?: string
  // late state (only meaningful for past)
  late?: boolean
  resolved?: boolean
}

const appts = reactive<Appt[]>([
  { id: 1, dow: 'Today', d: '18', m: "May ' 26", status: 'upcoming', svcNum: '01', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Daniel Mahood', clientRegular: 14, timeStart: '11:00', timeEnd: '11:40', isNext: true },
  { id: 2, dow: 'Today', d: '18', m: "May ' 26", status: 'upcoming', svcNum: '02', svcName: 'Precision Cut', duration: '30 min', price: '£25.00', client: 'Conor McAllister', clientRegular: 8, timeStart: '11:45', timeEnd: '12:15' },
  { id: 3, dow: 'Today', d: '18', m: "May ' 26", status: 'upcoming', svcNum: '03', svcName: 'Classic Cut', duration: '20 min', price: '£20.00', client: "James O'Hara", clientNew: true, timeStart: '12:20', timeEnd: '12:40' },
  { id: 4, dow: 'Tue', d: '20', m: "May ' 26", status: 'upcoming', svcNum: '04', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Ryan Patterson', clientRegular: 22, timeStart: '10:00', timeEnd: '10:40' },
  { id: 5, dow: 'Sat', d: '23', m: "May ' 26", status: 'upcoming', svcNum: '05', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Aaron Kelly', clientRegular: 31, timeStart: '09:30', timeEnd: '10:10' },
  { id: 6, dow: 'Fri', d: '16', m: "May ' 26", status: 'past', svcNum: '06', svcName: 'Precision Cut', duration: '30 min', price: '£25.00', client: 'Mark Bell', clientRegular: 12, timeStart: '14:30', timeEnd: '15:00', late: false, resolved: false },
  { id: 7, dow: 'Fri', d: '16', m: "May ' 26", status: 'past', svcNum: '07', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Stephen Lyttle', clientRegular: 19, timeStart: '15:15', timeEnd: '15:55', late: false, resolved: false },
  { id: 8, dow: 'Thu', d: '15', m: "May ' 26", status: 'past', svcNum: '08', svcName: 'Classic Cut', duration: '20 min', price: '£20.00', client: 'Paul Greene', clientRegular: 7, timeStart: '18:00', timeEnd: '18:20', late: true, resolved: false },
  { id: 9, dow: 'Wed', d: '14', m: "May ' 26", status: 'past', svcNum: '09', svcName: 'Precision Cut', duration: '30 min', price: '£25.00', client: 'Daniel Mahood', clientRegular: 14, timeStart: '10:30', timeEnd: '11:00', late: false, resolved: false },
  { id: 10, dow: 'Tue', d: '13', m: "May ' 26", status: 'cancelled', svcNum: '10', svcName: 'Precision Cut', duration: '30 min', price: '£25.00', client: 'Liam Hughes', clientNew: true, timeStart: '12:00', timeEnd: '12:30', pillCancelled: 'No-show · fee applied' },
  { id: 11, dow: 'Sat', d: '10', m: "May ' 26", status: 'cancelled', svcNum: '11', svcName: 'Precision Cut', svcPlus: true, duration: '40 min', price: '£30.00', client: 'Conor McAllister', clientRegular: 8, timeStart: '11:00', timeEnd: '11:40', pillCancelled: 'Cancelled by client' },
])

function categorize(a: Appt): FilterKey {
  if (a.status === 'past' && a.late && !a.resolved) return 'late'
  return a.status
}

const filter = ref<FilterKey>('upcoming')
const range = ref<'week' | 'month' | 'quarter' | 'year'>('month')

// Counts include the *current* late-state categorization.
// Display: prototype shows static-ish counts (representative), but ours auto-balance.
const counts = computed(() => ({
  upcoming: appts.filter(a => categorize(a) === 'upcoming').length,
  past: appts.filter(a => categorize(a) === 'past').length,
  late: appts.filter(a => categorize(a) === 'late').length,
  cancelled: appts.filter(a => categorize(a) === 'cancelled').length,
  all: appts.length,
}))

const filteredAppts = computed(() =>
  filter.value === 'all' ? appts : appts.filter(a => categorize(a) === filter.value),
)

function markLate(a: Appt) { a.late = true; a.resolved = false }
function markResolved(a: Appt) { a.resolved = true }
function reopen(a: Appt) { a.resolved = false }
</script>

<template>
  <main class="barber-main">
    <!-- ===== HEAD ===== -->
    <header class="ledger-head">
      <div class="ledger-head__inner">
        <div class="topline">
          <div class="label">— Vol<span class="colon">:</span> 01 / The Register</div>
          <div class="label">Signed in as Barlow <span class="colon">·</span> <NuxtLink to="/account">Logout →</NuxtLink></div>
        </div>

        <h1>The <em>chair.</em></h1>
        <p class="greeting">Morning, <strong>Barlow</strong>. Today's chair runs nine deep — first in at 09:00.</p>

        <div class="meta-strip">
          <div class="cell"><span class="k">Today</span><span class="v">9 bookings</span></div>
          <div class="cell"><span class="k">This week</span><span class="v">42 cuts</span></div>
          <div class="cell"><span class="k">Next in chair</span><span class="v">Daniel M. <span class="colon">·</span> 11:00</span></div>
          <div class="cell"><span class="k">Open slots <small class="cell-sub">— this week</small></span><span class="v">3 left</span></div>
          <div class="cell action">
            <NuxtLink class="btn btn--solid" to="/book">Open Diary <span class="arrow">→</span></NuxtLink>
          </div>
        </div>

        <span class="ledger-head__mono">:</span>
      </div>
    </header>

    <!-- ===== INSIGHTS ===== -->
    <section class="insights">
      <div class="insights__inner">
        <div class="insights-head">
          <div class="num">— 02 / Insights</div>
          <h2>The register<span class="colon">.</span></h2>
          <div class="range-switch" role="tablist">
            <button v-for="r in (['week','month','quarter','year'] as const)" :key="r" :class="{ active: range === r }" @click="range = r">{{ r.charAt(0).toUpperCase() + r.slice(1) }}</button>
          </div>
        </div>

        <div class="kpis">
          <div class="kpi">
            <span class="k">Bookings <span class="colon">·</span> month</span>
            <span class="v">168</span>
            <span class="trend up"><span class="arrow">↗</span>+12.4% <small>vs. last month</small></span>
            <svg class="kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
              <polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" points="0,22 10,20 20,24 30,18 40,16 50,19 60,12 70,14 80,8 90,10 100,5" />
            </svg>
          </div>
          <div class="kpi">
            <span class="k">Revenue <span class="colon">·</span> month</span>
            <span class="v"><span class="currency">£</span>4,310<span class="unit">.00</span></span>
            <span class="trend up"><span class="arrow">↗</span>+8.1% <small>vs. last month</small></span>
            <svg class="kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
              <polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" points="0,24 10,22 20,18 30,20 40,14 50,12 60,15 70,10 80,11 90,7 100,4" />
            </svg>
          </div>
          <div class="kpi">
            <span class="k">Repeat clients</span>
            <span class="v">74<span class="unit">%</span></span>
            <span class="trend up"><span class="arrow">↗</span>+3 pts <small>vs. last month</small></span>
            <svg class="kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
              <polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" points="0,18 10,17 20,19 30,15 40,14 50,16 60,13 70,11 80,12 90,9 100,8" />
            </svg>
          </div>
          <div class="kpi">
            <span class="k">Chair rent <span class="colon">·</span> month</span>
            <span class="v"><span class="currency">£</span>780<span class="unit">.00</span></span>
            <span class="trend"><span class="dot-arrow">·</span>Due Fri 22 May <small>— direct debit</small></span>
            <svg class="kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" y1="16" x2="100" y2="16" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.5" />
              <circle cx="92" cy="16" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>

        <div class="charts">
          <div class="panel">
            <div class="panel__head">
              <div>
                <div class="k">Daily bookings <span class="colon">·</span> last 14 days</div>
                <div class="lede">A steady rise <span class="brass-accent">— Saturday peaks at 12.</span></div>
              </div>
              <div class="legend">
                <span><span class="sw"></span>This fortnight</span>
              </div>
            </div>

            <svg class="barchart" viewBox="0 0 700 220" preserveAspectRatio="none" aria-label="Daily bookings chart">
              <line class="gridline" x1="0" y1="40" x2="700" y2="40" />
              <line class="gridline" x1="0" y1="90" x2="700" y2="90" />
              <line class="gridline" x1="0" y1="140" x2="700" y2="140" />
              <line class="gridline" x1="0" y1="190" x2="700" y2="190" />
              <text class="axis" x="0" y="36">12</text>
              <text class="axis" x="0" y="86">9</text>
              <text class="axis" x="0" y="136">6</text>
              <text class="axis" x="0" y="186">3</text>

              <g>
                <rect class="bar dim" x="44"  y="140" width="30" height="50"/>
                <rect class="bar dim" x="90"  y="110" width="30" height="80"/>
                <rect class="bar dim" x="136" y="100" width="30" height="90"/>
                <rect class="bar dim" x="182" y="80"  width="30" height="110"/>
                <rect class="bar dim" x="228" y="60"  width="30" height="130"/>
                <rect class="bar dim" x="274" y="20"  width="30" height="170"/>
                <rect class="bar dim" x="320" y="160" width="30" height="30"/>

                <rect class="bar" x="366" y="130" width="30" height="60"/>
                <rect class="bar" x="412" y="100" width="30" height="90"/>
                <rect class="bar" x="458" y="90"  width="30" height="100"/>
                <rect class="bar" x="504" y="60"  width="30" height="130"/>
                <rect class="bar" x="550" y="50"  width="30" height="140"/>
                <rect class="bar" x="596" y="20"  width="30" height="170"/>
                <rect class="bar" x="642" y="160" width="30" height="30"/>
              </g>

              <g class="axis">
                <text x="59"  y="212" text-anchor="middle">M</text>
                <text x="105" y="212" text-anchor="middle">T</text>
                <text x="151" y="212" text-anchor="middle">W</text>
                <text x="197" y="212" text-anchor="middle">T</text>
                <text x="243" y="212" text-anchor="middle">F</text>
                <text x="289" y="212" text-anchor="middle">S</text>
                <text x="335" y="212" text-anchor="middle">S</text>
                <text x="381" y="212" text-anchor="middle">M</text>
                <text x="427" y="212" text-anchor="middle">T</text>
                <text x="473" y="212" text-anchor="middle">W</text>
                <text x="519" y="212" text-anchor="middle">T</text>
                <text x="565" y="212" text-anchor="middle">F</text>
                <text x="611" y="212" text-anchor="middle">S</text>
                <text x="657" y="212" text-anchor="middle">S</text>
              </g>
            </svg>
          </div>

          <div class="panel">
            <div class="panel__head">
              <div>
                <div class="k">Service mix <span class="colon">·</span> month</div>
                <div class="lede">What's on the chair.</div>
              </div>
            </div>

            <div class="breakdown">
              <div class="breakdown__row">
                <span class="name">Precision <span class="plus">+</span> Beard</span>
                <span class="pct">42%</span>
                <div class="bar-bg"><div class="bar-fill" style="width:42%"></div></div>
              </div>
              <div class="breakdown__row">
                <span class="name">Precision Cut</span>
                <span class="pct">31%</span>
                <div class="bar-bg"><div class="bar-fill" style="width:31%"></div></div>
              </div>
              <div class="breakdown__row">
                <span class="name">Classic <span class="plus">+</span> Beard</span>
                <span class="pct">14%</span>
                <div class="bar-bg"><div class="bar-fill" style="width:14%"></div></div>
              </div>
              <div class="breakdown__row">
                <span class="name">Classic Cut</span>
                <span class="pct">9%</span>
                <div class="bar-bg"><div class="bar-fill" style="width:9%"></div></div>
              </div>
              <div class="breakdown__row">
                <span class="name">Under 16 <span class="colon">·</span> Senior</span>
                <span class="pct">4%</span>
                <div class="bar-bg"><div class="bar-fill" style="width:4%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="micro">
          <div class="micro__cell">
            <span class="k">Busiest day</span>
            <span class="v">Saturday <span class="colon">·</span> 11:00</span>
            <span class="sub">12 cuts on average — <b>book early.</b></span>
          </div>
          <div class="micro__cell">
            <span class="k">No-shows</span>
            <span class="v">3 this month</span>
            <span class="sub">All within policy — <b>fees applied.</b></span>
          </div>
          <div class="micro__cell">
            <span class="k">New clients</span>
            <span class="v">11 first-timers</span>
            <span class="sub">Mostly word-of-mouth from <b>regulars.</b></span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== APPOINTMENTS ===== -->
    <section class="appts">
      <div class="appts__inner">
        <div class="appts-head">
          <div class="num">— 03 / The Diary</div>
          <h2>Who's in<br />the chair<span class="colon">.</span></h2>
          <div class="legend">All times <span class="colon">·</span> <b>BST</b></div>
        </div>

        <div class="filters" role="tablist">
          <button :class="{ active: filter === 'upcoming' }" @click="filter = 'upcoming'">Upcoming <span class="count">{{ counts.upcoming }}</span></button>
          <button :class="{ active: filter === 'past' }" @click="filter = 'past'">Past <span class="count">{{ counts.past }}</span></button>
          <button :class="{ active: filter === 'late' }" @click="filter = 'late'">Late <span class="count">{{ counts.late }}</span></button>
          <button :class="{ active: filter === 'cancelled' }" @click="filter = 'cancelled'">Cancelled <span class="count">{{ counts.cancelled }}</span></button>
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">All <span class="count">{{ counts.all }}</span></button>
        </div>

        <div class="appt-list">
          <article
            v-for="a in filteredAppts"
            :key="a.id"
            class="appt"
            :class="{ 'is-next': a.isNext }"
            :data-status="a.status"
          >
            <span v-if="a.isNext" class="next-flag">— Next in chair</span>
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
            <div class="appt__cust">
              <div class="row">
                <span class="k">Client</span>
                <span class="v">
                  {{ a.client }}
                  <span v-if="a.clientRegular" class="ret">Regular <span class="colon">·</span> {{ a.clientRegular }}</span>
                  <small v-else-if="a.clientNew">New</small>
                </span>
              </div>
              <div class="row"><span class="k">Time</span><span class="v">{{ a.timeStart }} <small>— {{ a.timeEnd }}</small></span></div>
            </div>
            <div class="appt__action">
              <!-- pill -->
              <span v-if="a.status === 'upcoming'" class="pill is-upcoming"><span class="dot"></span>Confirmed</span>
              <span v-else-if="a.status === 'cancelled'" class="pill is-cancelled"><span class="dot"></span>{{ a.pillCancelled }}</span>
              <template v-else>
                <span v-if="!a.late" class="pill is-past"><span class="dot"></span>Completed</span>
                <span v-else-if="!a.resolved" class="pill is-late"><span class="dot"></span>Late arrival <span class="colon">·</span> unresolved</span>
                <span v-else class="pill is-past"><span class="dot"></span>Completed <span class="colon">·</span> was late</span>
              </template>

              <!-- actions -->
              <div class="appt__actions">
                <template v-if="a.status === 'upcoming'">
                  <button class="btn btn--ghost">Details</button>
                  <button class="btn btn--ghost">Reschedule</button>
                </template>
                <template v-else-if="a.status === 'past'">
                  <button v-if="!a.late" class="btn btn--ghost" type="button" @click="markLate(a)">Mark late</button>
                  <button v-else-if="!a.resolved" class="btn btn--ghost btn--resolve" type="button" @click="markResolved(a)">Mark resolved</button>
                  <button v-else class="btn btn--ghost" type="button" @click="reopen(a)">Re-open</button>
                  <button class="btn btn--ghost">View</button>
                </template>
                <template v-else>
                  <button class="btn btn--ghost">View</button>
                </template>
              </div>
            </div>
          </article>

          <div v-show="filteredAppts.length === 0" class="appt-empty">
            <h4>Nothing here<span class="colon">.</span></h4>
            <p>The diary is empty for this view. Time for a coffee — or a fresh look at your hours.</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.barber-main { flex: 1; padding-top: 80px; }
.colon { color: var(--brass); }
.brass-accent { color: var(--brass); }
.btn .arrow { transition: transform .25s ease; }
.btn:hover .arrow { transform: translateX(4px); }

/* ========== HEAD ========== */
.ledger-head { padding: 80px 36px 0; border-bottom: 1px solid var(--rule); position: relative; overflow: hidden; }
.ledger-head__inner { max-width: 1320px; margin: 0 auto; position: relative; }
.topline { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 56px; }
.label { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.ledger-head h1 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(56px, 7.5vw, 128px); line-height: 0.92; letter-spacing: -0.02em;
}
.ledger-head h1 em { font-style: italic; color: var(--brass); }
.greeting { font-family: var(--serif); font-size: 22px; color: var(--bone-dim); margin-top: 24px; }
.greeting strong { color: var(--bone); font-weight: 400; font-style: italic; }

.meta-strip {
  display: grid; grid-template-columns: repeat(4, 1fr) auto;
  border-top: 1px solid var(--rule); margin-top: 72px;
}
.meta-strip .cell {
  padding: 22px 28px 24px;
  border-right: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 10px;
}
.meta-strip .cell:last-child { border-right: 0; }
.meta-strip .cell .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.meta-strip .cell .v { font-family: var(--serif); font-size: 22px; line-height: 1.1; }
.meta-strip .cell.action { padding: 22px 28px; align-items: flex-end; justify-content: center; }
.cell-sub { font-family: var(--grot); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); margin-left: 6px; }

.ledger-head__mono {
  position: absolute; right: -40px; top: -40px;
  font-family: var(--serif); font-size: 320px; line-height: 0.8;
  color: rgba(var(--brass-rgb), 0.045);
  pointer-events: none; user-select: none; letter-spacing: -0.04em;
}

/* ========== INSIGHTS ========== */
.insights { border-bottom: 1px solid var(--rule); padding: 80px 36px; }
.insights__inner { max-width: 1320px; margin: 0 auto; }
.insights-head {
  display: grid; grid-template-columns: auto 1fr auto; gap: 40px; align-items: end;
  padding-bottom: 28px; border-bottom: 1px solid var(--rule);
}
.insights-head .num { font-size: 12px; letter-spacing: 0.2em; color: var(--bone-dim); }
.insights-head h2 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(36px, 4.5vw, 64px); line-height: 0.95; letter-spacing: -0.015em;
}
.range-switch { display: flex; gap: 0; border: 1px solid var(--rule); }
.range-switch button {
  background: transparent; border: 0; color: var(--bone-dim);
  font: inherit; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600;
  padding: 10px 14px; cursor: pointer;
  border-right: 1px solid var(--rule);
  transition: all .25s ease;
}
.range-switch button:last-child { border-right: 0; }
.range-switch button:hover { color: var(--bone); }
.range-switch button.active { background: var(--bone); color: var(--ink); }

.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-bottom: 1px solid var(--rule); }
.kpi {
  padding: 36px 32px;
  border-right: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 18px;
  position: relative;
}
.kpi:last-child { border-right: 0; }
.kpi .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.kpi .v {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(40px, 4.2vw, 64px); line-height: 1; letter-spacing: -0.02em;
}
.kpi .v .unit { font-size: 0.5em; color: var(--bone-dim); margin-left: 6px; letter-spacing: 0; }
.kpi .v .currency { color: var(--brass); margin-right: 2px; }
.kpi .trend { display: flex; align-items: baseline; gap: 8px; font-size: 12px; letter-spacing: 0.05em; }
.kpi .trend.up { color: var(--green); }
.kpi .trend.down { color: var(--red); }
.kpi .trend .arrow { font-family: var(--serif); font-size: 18px; line-height: 1; }
.kpi .trend .dot-arrow { color: var(--brass); font-family: var(--serif); font-size: 18px; line-height: 1; }
.kpi .trend small { color: var(--bone-dim); letter-spacing: 0.05em; }

.kpi__spark { position: absolute; right: 24px; bottom: 24px; width: 90px; height: 32px; opacity: 0.75; color: var(--brass); }

.charts { display: grid; grid-template-columns: 2fr 1fr; gap: 0; border-bottom: 1px solid var(--rule); }
.panel { padding: 36px 32px 40px; border-right: 1px solid var(--rule); }
.panel:last-child { border-right: 0; }
.panel__head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 28px;
}
.panel__head .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.panel__head .lede { font-family: var(--serif); font-size: 22px; line-height: 1.1; margin-top: 6px; }
.panel__head .legend { display: flex; gap: 16px; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.panel__head .legend span { display: inline-flex; align-items: center; gap: 6px; }
.panel__head .legend .sw { width: 10px; height: 2px; background: var(--brass); }

.barchart { width: 100%; height: 220px; }
.barchart .axis { font-family: var(--grot); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; fill: var(--bone-dim); }
.barchart .gridline { stroke: var(--rule); stroke-width: 1; }
.barchart .bar { fill: var(--brass); transition: fill .25s ease; }
.barchart .bar.dim { fill: rgba(var(--brass-rgb), 0.25); }
.barchart .bar:hover { fill: var(--bone); }

.breakdown { display: flex; flex-direction: column; gap: 0; }
.breakdown__row {
  display: grid; grid-template-columns: 1fr auto;
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
  align-items: baseline;
  font-size: 14px;
}
.breakdown__row:last-child { border-bottom: 0; }
.breakdown__row .name { font-family: var(--serif); font-size: 18px; }
.breakdown__row .name .plus { color: var(--brass); }
.breakdown__row .pct { color: var(--bone-dim); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; }
.breakdown__row .bar-bg {
  grid-column: 1 / -1; height: 2px; background: var(--rule); margin-top: 12px; position: relative;
}
.breakdown__row .bar-fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--brass); transition: width 1s ease; }

.micro { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.micro__cell {
  padding: 32px;
  border-right: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 12px;
}
.micro__cell:last-child { border-right: 0; }
.micro__cell .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.micro__cell .v { font-family: var(--serif); font-size: 28px; line-height: 1.1; letter-spacing: -0.01em; }
.micro__cell .sub { font-size: 12px; color: var(--bone-dim); }
.micro__cell .sub b { color: var(--bone); font-weight: 500; }

/* ========== APPOINTMENTS ========== */
.appts { padding: 80px 36px 100px; }
.appts__inner { max-width: 1320px; margin: 0 auto; }
.appts-head {
  display: grid; grid-template-columns: auto 1fr auto; gap: 40px; align-items: end;
  padding-bottom: 28px; border-bottom: 1px solid var(--rule);
}
.appts-head .num { font-size: 12px; letter-spacing: 0.2em; color: var(--bone-dim); }
.appts-head h2 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(36px, 4.5vw, 64px); line-height: 0.95; letter-spacing: -0.015em;
}
.appts-head .legend { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.appts-head .legend b { color: var(--bone); font-weight: 500; }

.filters { display: flex; gap: 0; border-bottom: 1px solid var(--rule); }
.filters button {
  background: transparent; border: 0; color: var(--bone-dim);
  font: inherit; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600;
  padding: 24px 28px 22px; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all .25s ease;
  display: inline-flex; align-items: baseline; gap: 10px;
}
.filters button:hover { color: var(--bone); }
.filters button.active { color: var(--bone); border-bottom-color: var(--brass); }
.filters button .count { font-family: var(--serif); font-size: 13px; letter-spacing: 0; color: var(--bone-dim); font-weight: 400; }
.filters button.active .count { color: var(--brass); }

.appt-list { display: flex; flex-direction: column; }
.appt {
  display: grid;
  grid-template-columns: 130px 1fr 1fr auto;
  gap: 40px;
  padding: 32px 0;
  border-bottom: 1px solid var(--rule);
  align-items: center;
  position: relative;
  transition: padding .3s ease, background .3s ease;
}
.appt:hover { padding-left: 18px; padding-right: 18px; background: linear-gradient(to right, rgba(var(--brass-rgb), 0.03), transparent 60%); }

.appt__date {
  display: flex; flex-direction: column; gap: 4px;
  font-variant-numeric: tabular-nums;
  border-left: 2px solid var(--brass);
  padding-left: 18px;
  transition: border-color .25s ease;
}
.appt[data-status="past"] .appt__date { border-left-color: var(--rule); }
.appt[data-status="cancelled"] .appt__date { border-left-color: var(--bone-dim); opacity: 0.65; }
.appt__date .dow { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.appt__date .d { font-family: var(--serif); font-size: 48px; line-height: 1; letter-spacing: -0.02em; }
.appt__date .m { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); margin-top: 4px; }

.appt__svc { display: flex; flex-direction: column; gap: 10px; }
.appt__svc .num { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.appt__svc .num-plus { color: var(--brass); }
.appt__svc h3 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(24px, 2.4vw, 34px); line-height: 1.05; letter-spacing: -0.01em;
}
.appt__svc h3 .plus { color: var(--brass); }
.appt__svc .duration { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }

.appt__cust { display: flex; flex-direction: column; gap: 10px; }
.appt__cust .row { display: grid; grid-template-columns: 84px 1fr; gap: 16px; font-size: 14px; align-items: baseline; }
.appt__cust .row .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); padding-top: 2px; }
.appt__cust .row .v { font-family: var(--serif); font-size: 20px; line-height: 1; letter-spacing: -0.005em; }
.appt__cust .row .v small { font-family: var(--grot); font-size: 12px; color: var(--bone-dim); margin-left: 8px; letter-spacing: 0.04em; text-transform: none; }
.appt__cust .row .v .ret {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--grot); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--brass); margin-left: 10px; vertical-align: middle;
  padding: 3px 7px;
  border: 1px solid rgba(var(--brass-rgb), 0.35);
  background: rgba(var(--brass-rgb), 0.05);
}

.appt__action { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; min-width: 200px; }
.pill {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  padding: 6px 12px;
  border: 1px solid var(--rule);
  color: var(--bone-dim);
  background: rgba(var(--bone-rgb), 0.02);
}
.pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bone-dim); }
.pill.is-upcoming { color: var(--brass); border-color: rgba(var(--brass-rgb), 0.4); background: rgba(var(--brass-rgb), 0.06); }
.pill.is-upcoming .dot { background: var(--brass); box-shadow: 0 0 0 3px rgba(var(--brass-rgb), 0.18); }
.pill.is-past { color: var(--bone-dim); }
.pill.is-cancelled { color: var(--red); border-color: rgba(var(--red-rgb), 0.35); }
.pill.is-cancelled .dot { background: var(--red); }
.pill.is-late {
  color: rgb(var(--amber-rgb));
  border-color: rgba(var(--amber-rgb), 0.45);
  background: rgba(var(--amber-rgb), 0.07);
}
.pill.is-late .dot { background: rgb(var(--amber-rgb)); box-shadow: 0 0 0 3px rgba(var(--amber-rgb), 0.18); }

.appt__actions { display: flex; gap: 8px; }
.btn--resolve {
  border-color: rgba(var(--amber-rgb), 0.55);
  color: rgb(var(--amber-rgb));
  background: rgba(var(--amber-rgb), 0.06);
}
.btn--resolve:hover {
  background: rgb(var(--amber-rgb)); color: var(--ink); border-color: rgb(var(--amber-rgb));
}

.appt.is-next {
  background: linear-gradient(to right, rgba(var(--brass-rgb), 0.06), transparent 70%);
}
.appt.is-next .next-flag {
  position: absolute; top: 32px; right: 0;
  font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase;
  color: var(--brass);
}

.appt-empty { padding: 80px 24px; text-align: center; border-bottom: 1px solid var(--rule); color: var(--bone-dim); }
.appt-empty h4 { font-family: var(--serif); color: var(--bone); font-size: 32px; font-weight: 400; margin-bottom: 12px; }
.appt-empty p { max-width: 40ch; margin: 0 auto 28px; }

/* responsive */
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
  .micro { grid-template-columns: 1fr; }
  .micro__cell { border-right: 0; border-bottom: 1px solid var(--rule); }
  .micro__cell:last-child { border-bottom: 0; }
}
@media (max-width: 900px) {
  .ledger-head { padding: 56px 22px 0; }
  .topline { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
  .ledger-head__mono { font-size: 200px; right: -20px; top: -10px; }
  .meta-strip { grid-template-columns: 1fr; margin-top: 48px; }
  .meta-strip .cell { border-right: 0 !important; }
  .insights { padding: 56px 22px; }
  .insights-head { grid-template-columns: 1fr; gap: 18px; }
  .kpis { grid-template-columns: 1fr; }
  .kpi { border-right: 0 !important; padding: 28px 22px; }
  .panel { padding: 28px 22px; }
  .appts { padding: 56px 22px 80px; }
  .appts-head { grid-template-columns: 1fr; gap: 18px; }
  .filters { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .filters button { padding: 20px 18px; flex-shrink: 0; }
  .appt { grid-template-columns: 100px 1fr; gap: 22px 24px; padding: 28px 0; }
  .appt__date .d { font-size: 36px; }
  .appt__cust { grid-column: 1 / -1; }
  .appt__action { grid-column: 1 / -1; align-items: flex-start; flex-direction: row; justify-content: space-between; min-width: 0; }
  .appt.is-next .next-flag { position: static; margin-bottom: 8px; }
}
</style>
