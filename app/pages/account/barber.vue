<script setup lang="ts">
import type { BookingRow } from "~/types/api";
import { toAppts, type Appt, type ApptStatus } from "~/utils/appointments";

definePageMeta({ accountRole: "Chair · Barber view" });
useHead({ title: "Chair - RE:FORM Hair & Culture" });

const { logout } = useAuth();
const api = useApiFetch();
const toast = useToast();

type FilterKey = ApptStatus | "all";
const filter = ref<FilterKey>("upcoming");
const appts = ref<Appt[]>([]);

function isoDate(daysFromToday: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

onMounted(async () => {
  try {
    // The past month and the next quarter.
    const rows = await api<BookingRow[]>("/api/barber/appointments", {
      query: { from: isoDate(-30), to: isoDate(90) },
    });
    appts.value = toAppts(rows);
  } catch {
    toast.error("Could not load your diary");
  }
});

const counts = computed(() => ({
  upcoming: appts.value.filter((a) => a.status === "upcoming").length,
  past: appts.value.filter((a) => a.status === "past").length,
  cancelled: appts.value.filter((a) => a.status === "cancelled").length,
  all: appts.value.length,
}));

const filteredAppts = computed(() =>
  filter.value === "all"
    ? appts.value
    : appts.value.filter((a) => a.status === filter.value),
);
</script>

<template>
  <main class="barber-main">
    <!-- ===== HEAD ===== -->
    <header class="ledger-head">
      <div class="ledger-head__inner">
        <div class="topline">
          <div class="label">
            — Vol<span class="colon">:</span> 01 / The Register
          </div>
          <div class="label">
            Signed in as Barlow <span class="colon">·</span>
            <a href="#" @click.prevent="logout()">Logout →</a>
          </div>
        </div>

        <h1>The <em>chair.</em></h1>
        <p class="greeting">
          Morning, <strong>Barlow</strong>. Today's chair runs nine deep - first
          in at 09:00.
        </p>

        <div class="meta-strip">
          <div class="cell">
            <span class="k">Today</span><span class="v">9 bookings</span>
          </div>
          <div class="cell">
            <span class="k">This week</span><span class="v">42 cuts</span>
          </div>
          <div class="cell">
            <span class="k">Next in chair</span
            ><span class="v">Daniel M. <span class="colon">·</span> 11:00</span>
          </div>
          <div class="cell">
            <span class="k"
              >Open slots <small class="cell-sub">- this week</small></span
            ><span class="v">3 left</span>
          </div>
          <div class="cell action">
            <NuxtLink class="btn btn--solid" to="/book"
              >Open Diary <span class="arrow">→</span></NuxtLink
            >
          </div>
        </div>

        <span class="ledger-head__mono">:</span>
      </div>
    </header>

    <!-- ===== APPOINTMENTS ===== -->
    <section class="appts">
      <div class="appts__inner">
        <div class="appts-head">
          <div class="num">- 02 / The Diary</div>
          <h2>Who's in<br />the chair<span class="colon">.</span></h2>
          <div class="legend">
            All times <span class="colon">·</span> <b>BST</b>
          </div>
        </div>

        <div class="filters" role="tablist">
          <button
            :class="{ active: filter === 'upcoming' }"
            @click="filter = 'upcoming'"
          >
            Upcoming <span class="count">{{ counts.upcoming }}</span>
          </button>
          <button
            :class="{ active: filter === 'past' }"
            @click="filter = 'past'"
          >
            Past <span class="count">{{ counts.past }}</span>
          </button>
          <button
            :class="{ active: filter === 'cancelled' }"
            @click="filter = 'cancelled'"
          >
            Cancelled <span class="count">{{ counts.cancelled }}</span>
          </button>
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">
            All <span class="count">{{ counts.all }}</span>
          </button>
        </div>

        <div class="appt-list">
          <article
            v-for="a in filteredAppts"
            :key="a.id"
            class="appt"
            :class="{ 'is-next': a.isNext }"
            :data-status="a.status"
          >
            <span v-if="a.isNext" class="next-flag">- Next in chair</span>
            <div class="appt__date">
              <span class="dow">{{ a.dow }}</span>
              <span class="d">{{ a.d }}</span>
              <span class="m">{{ a.m }}</span>
            </div>
            <div class="appt__svc">
              <span class="num">/ {{ a.svcNum }} - {{ a.svcName }}</span>
              <h3>{{ a.svcName }}</h3>
              <span class="duration"
                >{{ a.duration }} <span class="colon">·</span>
                {{ a.price }}</span
              >
            </div>
            <div class="appt__cust">
              <div class="row">
                <span class="k">Client</span>
                <span class="v">{{ a.client }}</span>
              </div>
              <div class="row">
                <span class="k">Time</span
                ><span class="v"
                  >{{ a.timeStart }} <small>- {{ a.timeEnd }}</small></span
                >
              </div>
            </div>
            <div class="appt__action">
              <!-- pill -->
              <span v-if="a.status === 'upcoming'" class="pill is-upcoming"
                ><span class="dot"></span>Confirmed</span
              >
              <span
                v-else-if="a.status === 'cancelled'"
                class="pill is-cancelled"
                ><span class="dot"></span>Cancelled</span
              >
              <span v-else class="pill is-past"
                ><span class="dot"></span>Completed</span
              >

              <!-- actions -->
              <div class="appt__actions">
                <template v-if="a.status === 'upcoming'">
                  <button class="btn btn--ghost">Details</button>
                  <button class="btn btn--ghost">Reschedule</button>
                </template>
                <button v-else class="btn btn--ghost">View</button>
              </div>
            </div>
          </article>

          <div v-show="filteredAppts.length === 0" class="appt-empty">
            <h4>Nothing here<span class="colon">.</span></h4>
            <p>
              The diary is empty for this view. Time for a coffee - or a fresh
              look at your hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped src="~/assets/css/account.css"></style>
<style scoped>
.barber-main {
  flex: 1;
  padding-top: 80px;
}
.btn .arrow {
  transition: transform 0.25s ease;
}

/* ========== HEAD ========== */
.topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 56px;
}
.greeting {
  font-family: var(--serif);
  font-size: 22px;
  color: var(--bone-dim);
  margin-top: 24px;
}
.greeting strong {
  color: var(--bone);
  font-weight: 400;
  font-style: italic;
}

.meta-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  border-top: 1px solid var(--rule);
  margin-top: 72px;
}
.meta-strip .cell {
  padding: 22px 28px 24px;
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.meta-strip .cell.action {
  padding: 22px 28px;
  align-items: flex-end;
  justify-content: center;
}
.cell-sub {
  font-family: var(--grot);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bone-dim);
  margin-left: 6px;
}

/* ========== INSIGHTS ========== */

/* ========== APPOINTMENTS ========== */

.filters {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--rule);
}
.filters button {
  background: transparent;
  border: 0;
  color: var(--bone-dim);
  font: inherit;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  padding: 24px 28px 22px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
}
.appt {
  display: grid;
  grid-template-columns: 130px 1fr 1fr auto;
  gap: 40px;
  padding: 32px 0;
  border-bottom: 1px solid var(--rule);
  align-items: center;
  position: relative;
  transition:
    padding 0.3s ease,
    background 0.3s ease;
}
.appt:hover {
  padding-left: 18px;
  padding-right: 18px;
  background: linear-gradient(
    to right,
    rgba(var(--brass-rgb), 0.03),
    transparent 60%
  );
}

.appt__date {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-variant-numeric: tabular-nums;
  border-left: 2px solid var(--brass);
  padding-left: 18px;
  transition: border-color 0.25s ease;
}
.appt[data-status="past"] .appt__date {
  border-left-color: var(--rule);
}
.appt[data-status="cancelled"] .appt__date {
  border-left-color: var(--bone-dim);
  opacity: 0.65;
}
.appt__date .dow {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.appt__date .d {
  font-family: var(--serif);
  font-size: 48px;
  line-height: 1;
  letter-spacing: -0.02em;
}
.appt__date .m {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  margin-top: 4px;
}

.appt__svc {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.appt__svc h3 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(24px, 2.4vw, 34px);
  line-height: 1.05;
  letter-spacing: -0.01em;
}
.appt__svc .duration {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bone-dim);
}

.appt__cust {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.appt__cust .row {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 16px;
  font-size: 14px;
  align-items: baseline;
}
.appt__cust .row .k {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  padding-top: 2px;
}
.appt__cust .row .v {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1;
  letter-spacing: -0.005em;
}
.appt__cust .row .v small {
  font-family: var(--grot);
  font-size: 12px;
  color: var(--bone-dim);
  margin-left: 8px;
  letter-spacing: 0.04em;
  text-transform: none;
}

.appt__action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  min-width: 200px;
}

/* responsive */
@media (max-width: 1100px) {
  .meta-strip {
    grid-template-columns: 1fr 1fr;
  }
  .meta-strip .cell {
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }
  .meta-strip .cell.action {
    grid-column: 1 / -1;
    align-items: stretch;
  }
}
@media (max-width: 900px) {
  .ledger-head {
    padding: 56px 22px 0;
  }
  .topline {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 32px;
  }
  .ledger-head__mono {
    font-size: 200px;
    right: -20px;
    top: -10px;
  }
  .meta-strip {
    grid-template-columns: 1fr;
    margin-top: 48px;
  }
  .meta-strip .cell {
    border-right: 0 !important;
  }
  .filters {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .filters button {
    padding: 20px 18px;
    flex-shrink: 0;
  }
  .appt {
    grid-template-columns: 100px 1fr;
    gap: 22px 24px;
    padding: 28px 0;
  }
  .appt__date .d {
    font-size: 36px;
  }
  .appt__cust {
    grid-column: 1 / -1;
  }
  .appt__action {
    grid-column: 1 / -1;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    min-width: 0;
  }
}
</style>
