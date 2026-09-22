<script setup lang="ts">
import type { BookingRow } from "~/types/api";
import { toAppts, type Appt, type ApptStatus } from "~/utils/appointments";

definePageMeta({ accountRole: "Member · Customer view" });
useHead({ title: "Account - RE:FORM Hair & Culture" });

const { user, logout } = useAuth();
const api = useApiFetch();
const toast = useToast();

type FilterKey = ApptStatus | "all";
const filter = ref<FilterKey>("upcoming");
const appts = ref<Appt[]>([]);
const cancellingId = ref<string | null>(null);

async function loadBookings() {
  try {
    appts.value = toAppts(await api<BookingRow[]>("/api/me/bookings"));
  } catch {
    toast.error("Could not load your bookings");
  }
}

onMounted(loadBookings);

async function cancelBooking(a: Appt) {
  if (!confirm(`Cancel your ${a.svcName} on ${a.dow} ${a.d} ${a.m}, ${a.timeStart}?`)) return;
  cancellingId.value = a.id;
  try {
    await api(`/api/me/bookings/${a.id}/cancel`, { method: "POST" });
    toast.success("Booking cancelled");
    await loadBookings();
  } catch {
    toast.error("Could not cancel that booking");
  } finally {
    cancellingId.value = null;
  }
}

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
  <main class="customer-main">
    <!-- ===== LEDGER HEAD ===== -->
    <header class="ledger-head">
      <div class="ledger-head__inner">
        <div class="topline">
          <div class="label">
            - Vol<span class="colon">:</span> 01 / Your Ledger
          </div>
          <div class="label">
            Signed in <span class="colon">·</span>
            <a href="#" @click.prevent="logout()">Logout →</a>
          </div>
        </div>

        <h1>The <em>ledger.</em></h1>
        <p class="greeting">
          Welcome back, <strong>{{ user?.firstName || "friend" }}</strong
          >. The chair has been kept.
        </p>

        <div class="meta-strip" role="list">
          <div class="cell">
            <span class="k">Member since</span>
            <span class="v">March 2024</span>
          </div>
          <div class="cell">
            <span class="k">Visits on record</span>
            <span class="v">14 cuts</span>
          </div>
          <div class="cell">
            <span class="k">Preferred chair</span>
            <span class="v">Barlow</span>
          </div>
          <div class="cell">
            <span class="k">Next appointment</span>
            <span class="v"
              >Sat, 23 May <span class="colon">·</span> 11:00</span
            >
          </div>
          <div class="cell action">
            <NuxtLink class="btn btn--solid" to="/book"
              >Book Again <span class="arrow">→</span></NuxtLink
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
          <div class="num">- 02 / Appointments</div>
          <h2>The chairs<br />you've held<span class="colon">.</span></h2>
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
            <span v-if="a.isNext" class="next-flag">- Next up</span>
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
            <div class="appt__chair">
              <div class="row">
                <span class="k">Chair</span
                ><span class="v">{{ a.chair }}</span>
              </div>
              <div class="row">
                <span class="k">Time</span
                ><span class="v"
                  >{{ a.timeStart }} <small>- {{ a.timeEnd }}</small></span
                >
              </div>
            </div>
            <div class="appt__action">
              <span v-if="a.status === 'upcoming'" class="pill is-upcoming"
                ><span class="dot"></span>Confirmed</span
              >
              <span v-else-if="a.status === 'past'" class="pill is-past"
                ><span class="dot"></span>Completed</span
              >
              <span v-else class="pill is-cancelled"
                ><span class="dot"></span>Cancelled</span
              >
              <div class="appt__actions">
                <button
                  v-if="a.status === 'upcoming'"
                  type="button"
                  class="btn btn--ghost"
                  :disabled="cancellingId === a.id"
                  @click="cancelBooking(a)"
                >
                  {{ cancellingId === a.id ? "Cancelling…" : "Cancel" }}
                </button>
                <NuxtLink v-else class="btn btn--ghost" to="/book">{{
                  a.status === "past" ? "Book Again" : "Rebook"
                }}</NuxtLink>
              </div>
            </div>
          </article>

          <div v-show="filteredAppts.length === 0" class="appt-empty">
            <h4>Nothing on this page<span class="colon">.</span></h4>
            <p>
              You don't have any appointments in this view. The chair is open
              when you are.
            </p>
            <NuxtLink class="btn btn--solid" to="/book"
              >Book a chair <span class="arrow">→</span></NuxtLink
            >
          </div>
        </div>
      </div>
    </section>

    <!-- ===== POLICY ===== -->
    <section class="policy">
      <div class="policy__inner">
        <div class="policy__head">
          <div class="num">- 03 / The House Rules</div>
          <h2>
            Booking <span class="colon">&amp;</span><br />cancellation<span
              class="colon"
              >.</span
            >
          </h2>
          <p>
            A short read. The chair runs on time because everyone reads the same
            page.
          </p>
        </div>

        <div class="policy__body">
          <article class="policy__item">
            <span class="num">/ 01</span>
            <div>
              <h3>
                Cancellations <span class="accent">&amp;</span> Rescheduling
              </h3>
              <p>
                We ask for at least
                <span class="accent">3 hours' notice</span> to cancel or
                reschedule. You can manage your appointment anytime via our
                website.
              </p>
            </div>
          </article>

          <article class="policy__item">
            <span class="num">/ 02</span>
            <div>
              <h3>Late Arrivals</h3>
              <p>
                Please aim to arrive
                <span class="accent">5 minutes before</span> your appointment.
                Arriving late may mean a reduced service or, where necessary, a
                cancelled appointment - out of respect for clients booked after
                you.
              </p>
            </div>
          </article>

          <article class="policy__item">
            <span class="num">/ 03</span>
            <div>
              <h3>Missed Appointments</h3>
              <p>
                If an appointment is missed without notice, the
                <span class="accent">full service fee</span> becomes due before
                a new booking can be made. A secure payment link will be sent.
              </p>
              <p>
                Repeated no-shows may require prepayment on future bookings, or
                we may be unable to accommodate further appointments.
              </p>
            </div>
          </article>

          <article class="policy__item">
            <span class="num">/ 04</span>
            <div>
              <h3>Discretion</h3>
              <p>
                We know life happens. Genuine emergencies are handled on a
                case-by-case basis -
                <span class="accent">just get in touch</span>.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped src="~/assets/css/account.css"></style>
<style scoped>
.customer-main {
  flex: 1;
  padding-top: 80px;
}
.btn .arrow {
  transition: transform 0.25s ease;
}
.btn--xs {
  padding: 10px 14px;
  font-size: 10px;
  letter-spacing: 0.18em;
}

/* ========== LEDGER HEAD ========== */
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
  grid-template-columns: repeat(5, 1fr) auto;
  border-top: 1px solid var(--rule);
  margin-top: 80px;
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

.appt__chair {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.appt__chair .row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 16px;
  font-size: 14px;
  align-items: baseline;
}
.appt__chair .row .k {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  padding-top: 2px;
}
.appt__chair .row .v {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1;
  letter-spacing: -0.005em;
}
.appt__chair .row .v small {
  font-family: var(--grot);
  font-size: 12px;
  color: var(--bone-dim);
  margin-left: 8px;
  letter-spacing: 0.04em;
}

.appt__action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  min-width: 200px;
}
.appt__actions .btn--ghost {
  padding: 9px 14px;
  font-size: 10px;
  letter-spacing: 0.18em;
}

/* ========== POLICY ========== */
.policy {
  border-top: 1px solid var(--rule);
  padding: 100px 36px 120px;
}
.policy__inner {
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 80px;
}
.policy__head {
  position: sticky;
  top: 100px;
  align-self: start;
}
.policy__head .num {
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--bone-dim);
}
.policy__head h2 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(36px, 4.5vw, 64px);
  line-height: 0.95;
  letter-spacing: -0.015em;
  margin-top: 16px;
}
.policy__head p {
  color: var(--bone-dim);
  margin-top: 24px;
  max-width: 36ch;
  line-height: 1.55;
  font-size: 14px;
}

.policy__body {
  display: flex;
  flex-direction: column;
}
.policy__item {
  padding: 32px 0;
  border-top: 1px solid var(--rule);
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 32px;
}
.policy__item:last-child {
  border-bottom: 1px solid var(--rule);
}
.policy__item .num {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--bone-dim);
  padding-top: 12px;
}
.policy__item h3 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: -0.005em;
  margin-bottom: 14px;
}
.policy__item p {
  color: var(--bone-dim);
  line-height: 1.65;
  font-size: 15px;
}
.policy__item p + p {
  margin-top: 12px;
}
.policy__item .accent {
  color: var(--brass);
}

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
  .appt__chair {
    grid-column: 1 / -1;
  }
  .appt__chair .row {
    grid-template-columns: 70px 1fr;
  }
  .appt__action {
    grid-column: 1 / -1;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    min-width: 0;
  }
  .policy {
    padding: 60px 22px 80px;
  }
  .policy__inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .policy__head {
    position: static;
  }
  .policy__item {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
