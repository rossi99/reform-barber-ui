<script setup lang="ts">
import {
  useBookingStore,
  priceFmt,
  dateFmtShort,
} from "~/composables/useBookingStore";

useHead({ title: "Book — RE:FORM Hair & Culture" });

const { state, step, isComplete } = useBookingStore();

// which step pane is showing (can be different from derived step — user can navigate back)
const activeStep = ref<1 | 2 | 3>(1);

function goTo(s: 1 | 2 | 3) {
  activeStep.value = s;
}
function stepBack() {
  if (activeStep.value > 1)
    activeStep.value = (activeStep.value - 1) as 1 | 2 | 3;
}
function advance() {
  if (activeStep.value < 3)
    activeStep.value = (activeStep.value + 1) as 1 | 2 | 3;
}

function stepEnabled(s: 1 | 2 | 3) {
  if (s === 1) return true;
  if (s === 2) return !!state.barber;
  return !!state.barber && !!state.service;
}

function stepDone(s: 1 | 2 | 3) {
  if (s === 1) return !!state.barber && activeStep.value > 1;
  if (s === 2) return !!state.service && activeStep.value > 2;
  return isComplete.value;
}

const canContinue = computed(() => {
  if (activeStep.value === 1) return !!state.barber;
  if (activeStep.value === 2) return !!state.service;
  return false; // step 3 uses confirm card directly
});

// hours for today highlight
const todayDow = new Date().getDay();
const todayMins = new Date().getHours() * 60 + new Date().getMinutes();
const HOURS: Record<number, [number, number] | null> = {
  0: null,
  1: [570, 990],
  2: [540, 990],
  3: [540, 990],
  4: [570, 1140],
  5: [540, 990],
  6: [450, 870],
};
function isOpenNow(): boolean {
  const r = HOURS[todayDow];
  return !!(r && todayMins >= r[0] && todayMins < r[1]);
}

const HOUR_ROWS = [
  { dow: 1, label: "Mon", times: "09:30 — 16:30", tag: "" },
  { dow: 2, label: "Tue", times: "09:00 — 16:30", tag: "" },
  { dow: 3, label: "Wed", times: "09:00 — 16:30", tag: "" },
  { dow: 4, label: "Thu", times: "09:30 — 19:00", tag: "Late" },
  { dow: 5, label: "Fri", times: "09:00 — 16:30", tag: "" },
  { dow: 6, label: "Sat", times: "07:30 — 14:30", tag: "Early" },
  { dow: 0, label: "Sun", times: "Closed", tag: "", closed: true },
];
</script>

<template>
  <main class="book-main">
    <header class="head">
      <div>
        <div class="head-label">
          — Vol<span class="colon">:</span> 01 / Booking
        </div>
        <h1>Take<br />the <em>chair.</em></h1>
      </div>
      <div class="head-right">
        Pick a barber, a service, a slot. Confirm the room and we'll see you at
        the door - two minutes, kept tight.
      </div>
    </header>

    <!-- BOOKING WIZARD -->
    <section class="wizard" id="wizard">
      <!-- stepper -->
      <div class="stepper">
        <button
          v-for="n in [1, 2, 3] as const"
          :key="n"
          type="button"
          class="stepper__item"
          :class="{
            'is-active': activeStep === n,
            'is-done': stepDone(n),
          }"
          :disabled="!stepEnabled(n)"
          @click="goTo(n)"
        >
          <span class="stepper__num">0{{ n }}</span>
          <span class="stepper__txt">
            <span class="stepper__label">{{
              ["Barber", "Service", "Time"][n - 1]
            }}</span>
            <span class="stepper__value">
              {{
                [
                  state.barber?.name ?? "Choose a chair",
                  state.service
                    ? state.service.name + " · " + priceFmt(state.service.price)
                    : "Choose a cut",
                  state.date && state.time
                    ? dateFmtShort(state.date) + " · " + state.time
                    : "Pick a slot",
                ][n - 1]
              }}
            </span>
          </span>
        </button>
      </div>

      <!-- step 1 — barber -->
      <div v-show="activeStep === 1" class="step is-active">
        <booking-barber-step @advance="advance" />
      </div>

      <!-- step 2 — service -->
      <div v-show="activeStep === 2" class="step is-active">
        <booking-service-step
          :barber-name="state.barber?.name ?? null"
          @advance="advance"
        />
      </div>

      <!-- step 3 — calendar/slots -->
      <div v-show="activeStep === 3" class="step is-active">
        <booking-calendar-step
          :barber="state.barber"
          :service="state.service"
          :sel-date="state.date"
          :sel-time="state.time"
          @update="() => {}"
        />
      </div>

      <!-- wizard footer -->
      <div class="wizard-foot">
        <button
          type="button"
          class="wizard-foot__back"
          :disabled="activeStep === 1"
          @click="stepBack"
        >
          ← Back
        </button>

        <div class="wizard-foot__summary">
          <div class="item">
            <span class="k">Barber</span>
            <span class="v" :class="{ empty: !state.barber }">{{
              state.barber?.name ?? "—"
            }}</span>
          </div>
          <div class="item">
            <span class="k">Service</span>
            <span class="v" :class="{ empty: !state.service }">{{
              state.service?.name ?? "—"
            }}</span>
          </div>
          <div class="item">
            <span class="k">When</span>
            <span class="v" :class="{ empty: !state.date || !state.time }">
              {{
                state.date && state.time
                  ? dateFmtShort(state.date) + " · " + state.time
                  : "—"
              }}
            </span>
          </div>
        </div>

        <button
          v-if="activeStep < 3 || !isComplete"
          type="button"
          class="btn btn--solid wizard-foot__cta"
          :disabled="!canContinue && activeStep < 3"
          @click="advance"
        >
          {{ activeStep === 3 ? "Pick a slot" : "Continue" }}
          <span class="arrow">→</span>
        </button>
      </div>

      <!-- confirm card -->
      <booking-confirm-card
        v-if="isComplete"
        :barber="state.barber"
        :service="state.service"
        :date="state.date"
        :time="state.time"
        :products="state.products"
        @confirmed="() => {}"
      />
    </section>

    <!-- find us / hours -->
    <div class="info-grid">
      <section class="panel">
        <div class="panel-label">— 04 / The Room</div>
        <h2>Find us.</h2>
        <p class="panel-sub">Ground floor, first door past the square.</p>
        <div class="addr-block">
          <div class="lines">
            <span class="line">3 Upper Main Street</span>
            <span class="line">Larne, Co. Antrim</span>
            <span class="line muted"
              >BT40 <span class="colon">·</span> Northern Ireland</span
            >
          </div>
          <div class="addr-meta">
            <a
              href="https://maps.google.com/?q=3+Upper+Main+Street+Larne"
              target="_blank"
              rel="noopener"
              >Open in Maps ↗</a
            >
            <a href="mailto:Info@reformbarber.co.uk">Info@reformbarber.co.uk</a>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-label">— 05 / Hours</div>
        <h2>The week.</h2>
        <p class="panel-sub">Five chairs, one booking sheet.</p>
        <div class="hours">
          <div
            v-for="row in HOUR_ROWS"
            :key="row.dow"
            class="hour-row"
            :class="{ closed: row.closed, today: row.dow === todayDow }"
          >
            <span class="day">{{ row.label }}</span>
            <span class="times">{{ row.times }}</span>
            <span
              class="tag"
              :class="{ now: row.dow === todayDow && isOpenNow() }"
            >
              {{ row.dow === todayDow && isOpenNow() ? "Open Now" : row.tag }}
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- notes -->
    <section class="finer">
      <div class="finer-item">
        <div class="finer-label">/ 01</div>
        <h4>Walk-ins.</h4>
        <p>
          Welcome when the chair allows. The booking sheet has the right of way
          — Saturday morning is the wrong time to chance it.
        </p>
      </div>
      <div class="finer-item">
        <div class="finer-label">/ 02</div>
        <h4>Late or canceling.</h4>
        <p>
          Two messages get through. Email or the booking sheet — both reach the
          chair. Twelve hours' notice is a kindness.
        </p>
      </div>
      <div class="finer-item">
        <div class="finer-label">/ 03</div>
        <h4>First visit.</h4>
        <p>
          Arrive five early. The consultation is part of the cut — we'd rather
          not rush it.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.book-main {
  flex: 1;
  padding: 80px 36px;
  max-width: 1240px;
  margin: 0 auto;
  width: 100%;
}

/* header */
.head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: end;
  padding-bottom: 60px;
  border-bottom: 1px solid var(--rule);
  margin-top: 40px;
  margin-bottom: 60px;
}
.head-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  margin-bottom: 24px;
}
h1 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(48px, 8vw, 132px);
  line-height: 0.92;
  letter-spacing: -0.02em;
}
h1 em {
  font-style: italic;
  color: var(--brass);
}
.head-right {
  color: var(--bone-dim);
  font-size: 14px;
  line-height: 1.55;
  max-width: 42ch;
  justify-self: end;
  text-align: right;
}
.colon {
  color: var(--brass);
}

/* wizard */
.wizard {
  margin-bottom: 80px;
  padding: 10px 0px;
}

.stepper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--rule);
  margin-bottom: 24px;
}
.stepper__item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  border-right: 1px solid var(--rule);
  cursor: pointer;
  transition: background 0.2s ease;
  background: transparent;
  border-top: 0;
  border-bottom: 0;
  border-left: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  width: 100%;
}
.stepper__item:last-child {
  border-right: 0;
}
.stepper__item:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.stepper__num {
  width: 28px;
  height: 28px;
  border: 1px solid var(--rule);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--bone-dim);
  flex-shrink: 0;
  font-family: var(--grot);
  font-variant-numeric: tabular-nums;
}
.stepper__txt {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.stepper__label {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.stepper__value {
  font-family: var(--serif);
  font-size: 18px;
  letter-spacing: -0.005em;
  color: var(--bone-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stepper__item.is-active {
  background: rgba(176, 141, 87, 0.07);
}
.stepper__item.is-active .stepper__num {
  color: var(--brass);
  border-color: var(--brass);
}
.stepper__item.is-active .stepper__label {
  color: var(--brass);
}
.stepper__item.is-done .stepper__num {
  background: var(--brass);
  border-color: var(--brass);
  color: var(--ink);
}
.stepper__item.is-done .stepper__value {
  color: var(--bone);
}
.stepper__value.empty {
  color: rgba(244, 239, 230, 0.3);
  font-style: italic;
  font-family: var(--grot);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.step {
  border: 1px solid var(--rule);
  background: #060606;
  padding: 48px;
  min-height: 520px;
}

/* wizard footer */
.wizard-foot {
  margin-top: 24px;
  border: 1px solid var(--rule);
  background: #060606;
  padding: 24px 32px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 32px;
  align-items: center;
}
.wizard-foot__back {
  background: transparent;
  border: 1px solid var(--rule);
  color: var(--bone-dim);
  padding: 12px 18px;
  font: inherit;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}
.wizard-foot__back:hover:not(:disabled) {
  color: var(--bone);
  border-color: var(--bone);
}
.wizard-foot__back:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.wizard-foot__summary {
  display: flex;
  gap: 28px;
  font-size: 12px;
  letter-spacing: 0.12em;
}
.item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.k {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.v {
  font-family: var(--serif);
  font-size: 16px;
  color: var(--bone);
  letter-spacing: -0.005em;
}
.v.empty {
  color: rgba(244, 239, 230, 0.3);
  font-style: italic;
  font-family: var(--grot);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.wizard-foot__cta {
  padding: 16px 28px;
}
.wizard-foot__cta:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  background: var(--rule);
  border-color: var(--rule);
  color: var(--bone-dim);
}

/* info grid */
.info-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  margin-bottom: 80px;
}

.panel {
  border: 1px solid var(--rule);
  padding: 40px;
  background: #060606;
  position: relative;
}
.panel-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  margin-bottom: 28px;
}
h2 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 36px;
  line-height: 1.05;
  letter-spacing: -0.01em;
  margin-bottom: 8px;
}
.panel-sub {
  color: var(--bone-dim);
  font-size: 14px;
}

.addr-block {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--rule);
}
.lines {
  font-family: var(--serif);
  font-size: 26px;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.line {
  display: block;
}
.muted {
  color: var(--bone-dim);
}
.addr-meta {
  display: flex;
  gap: 32px;
  margin-top: 24px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.addr-meta a {
  color: var(--bone);
  border-bottom: 1px solid var(--brass);
  padding-bottom: 2px;
}

.hours {
  display: flex;
  flex-direction: column;
  margin-top: 32px;
}
.hour-row {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
  align-items: center;
}
.hour-row:first-of-type {
  border-top: 1px solid var(--rule);
}
.day {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.times {
  font-family: var(--serif);
  font-size: 22px;
  letter-spacing: 0.01em;
}
.tag {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.tag.now {
  color: var(--brass);
}
.hour-row.closed .times {
  color: var(--bone-dim);
  font-style: italic;
}
.hour-row.today {
  background: rgba(176, 141, 87, 0.05);
  padding-left: 12px;
  padding-right: 12px;
  margin-left: -12px;
  margin-right: -12px;
}
.hour-row.today .day {
  color: var(--brass);
}

/* notes */
.finer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  border-top: 1px solid var(--rule);
  padding-top: 60px;
}
.finer-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  margin-bottom: 14px;
}
.finer-item h4 {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}
.finer-item p {
  color: var(--bone-dim);
  font-size: 14px;
  line-height: 1.55;
}

@media (max-width: 900px) {
  .book-main {
    padding: 56px 22px;
  }
  .head {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-bottom: 48px;
    margin-bottom: 48px;
  }
  .head-right {
    justify-self: start;
    text-align: left;
  }
  .stepper {
    grid-template-columns: 1fr;
  }
  .stepper__item {
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }
  .stepper__item:last-child {
    border-bottom: 0;
  }
  .step {
    padding: 24px;
    min-height: auto;
  }
  .wizard-foot {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
  }
  .wizard-foot__summary {
    flex-wrap: wrap;
    gap: 16px;
  }
  .info-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 56px;
  }
  .panel {
    padding: 28px;
  }
  .finer {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-top: 40px;
  }
}
</style>
