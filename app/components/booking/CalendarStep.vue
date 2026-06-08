<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { setDate, setTime, type BookingBarber, type BookingService } from '~/composables/useBookingStore'
import type { AvailabilityResponse, Slot } from '~/server/api/availability.get'

const props = defineProps<{
  barber:  BookingBarber | null
  service: BookingService | null
  selDate: Date | null
  selTime: string | null
}>()

const emit = defineEmits<{ update: [] }>()

// Calendar state
const today = new Date(); today.setHours(0, 0, 0, 0)
const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1)
const viewMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const calEl = ref<HTMLElement | null>(null)
const slotsEl = ref<HTMLElement | null>(null)

// Fetch availability when date changes
const dateKey = computed(() =>
  props.selDate
    ? `${props.selDate.getFullYear()}-${String(props.selDate.getMonth() + 1).padStart(2, '0')}-${String(props.selDate.getDate()).padStart(2, '0')}`
    : null
)

const { data: availability, refresh: refreshSlots } = useFetch<AvailabilityResponse>(
  () => `/api/availability?barber=${props.barber?.id ?? 'any'}&service=${props.service?.id ?? ''}&date=${dateKey.value ?? ''}`,
  { watch: [dateKey, () => props.barber?.id, () => props.service?.id] }
)

// Calendar computed
const calTitle = computed(() =>
  viewMonth.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
)

const canPrev = computed(() =>
  !(viewMonth.value.getMonth() === today.getMonth() && viewMonth.value.getFullYear() === today.getFullYear())
)
const canNext = computed(() =>
  !(viewMonth.value.getMonth() === maxMonth.getMonth() && viewMonth.value.getFullYear() === maxMonth.getFullYear())
)

const CLOSED_DAYS = [0] // Sunday

function prevMonth() {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() - 1, 1)
}
function nextMonth() {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 1)
}

interface CalDay {
  date: Date | null
  day: number
  isEmpty: boolean
  isPast: boolean
  isToday: boolean
  isClosed: boolean
  isSelected: boolean
}

const calDays = computed<CalDay[]>(() => {
  const year = viewMonth.value.getFullYear()
  const month = viewMonth.value.getMonth()
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7  // Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: CalDay[] = []

  for (let i = 0; i < offset; i++) {
    days.push({ date: null, day: 0, isEmpty: true, isPast: false, isToday: false, isClosed: false, isSelected: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push({
      date,
      day: d,
      isEmpty: false,
      isPast: date < today,
      isToday: +date === +today,
      isClosed: CLOSED_DAYS.includes(date.getDay()),
      isSelected: props.selDate ? +date === +props.selDate : false,
    })
  }
  return days
})

function pickDate(day: CalDay) {
  if (!day.date || day.isPast || day.isClosed) return
  setDate(day.date)
  emit('update')
}

function pickTime(t: string) {
  setTime(t)
  emit('update')
}

// Sync slots height to calendar height
const { width } = useWindowSize()

function syncHeight() {
  if (!calEl.value || !slotsEl.value) return
  if (width.value < 900) { slotsEl.value.style.height = ''; return }
  slotsEl.value.style.height = calEl.value.offsetHeight + 'px'
}

watch([() => props.selDate, () => availability.value, width], () => nextTick(syncHeight))
onMounted(() => nextTick(syncHeight))

function slotCount(slots: Slot[]) {
  return slots.filter(s => !s.booked).length
}

function dateLong(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: 'short' }) + ' / ' +
         d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="step__head">
    <div>
      <div class="step-label">— 03 / The Slot</div>
      <h2>Pick a <em>time.</em></h2>
    </div>
    <div class="step-meta">
      <span class="v">{{ barber?.name ?? '—' }}</span>
      <span class="colon"> · </span>
      <span class="v">{{ service?.name ?? '—' }}</span>
    </div>
  </div>

  <div class="cal-wrap">
    <!-- Calendar -->
    <div class="cal" ref="calEl">
      <div class="cal__head">
        <div class="cal__title">{{ calTitle }}</div>
        <div class="cal__nav">
          <button type="button" :disabled="!canPrev" aria-label="Previous month" @click="prevMonth">←</button>
          <button type="button" :disabled="!canNext" aria-label="Next month"     @click="nextMonth">→</button>
        </div>
      </div>

      <div class="cal__grid">
        <div v-for="d in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :key="d" class="cal__dow">{{ d }}</div>
        <button
          v-for="(day, i) in calDays"
          :key="i"
          type="button"
          class="cal__day"
          :class="{
            'is-empty':    day.isEmpty,
            'is-today':    day.isToday,
            'is-closed':   day.isClosed,
            'is-selected': day.isSelected,
          }"
          :disabled="day.isEmpty || day.isPast || day.isClosed"
          @click="pickDate(day)"
        >{{ day.day || '' }}</button>
      </div>

      <div class="cal__legend">
        <span><span class="swatch now" /> Today</span>
        <span><span class="swatch sel" /> Selected</span>
        <span class="legend-r">Sun · Closed</span>
      </div>
    </div>

    <!-- Slots -->
    <div class="slots" ref="slotsEl">
      <template v-if="!selDate">
        <div class="slots__prompt">Pick a day to see open slots.</div>
      </template>
      <template v-else>
        <div class="slots__head">
          <div class="slots__date">
            <span class="day-of-week">{{ dateLong(selDate) }}</span>
            {{ service?.name ?? 'Select a service for accurate slots' }}
          </div>
          <span class="slots__count"></span>
        </div>

        <div class="slots__body">
          <template v-if="availability?.groups">
            <div v-if="availability.groups.morning.length" class="slots__group">
              <div class="g-label">
                <span><span class="dot" />Morning</span>
                <span>{{ slotCount(availability.groups.morning) }} open</span>
              </div>
              <div class="slots__grid">
                <button
                  v-for="s in availability.groups.morning"
                  :key="s.time"
                  type="button"
                  class="slot"
                  :class="{ 'is-selected': selTime === s.time }"
                  :disabled="s.booked"
                  @click="pickTime(s.time)"
                >{{ s.time }}</button>
              </div>
            </div>

            <div v-if="availability.groups.afternoon.length" class="slots__group">
              <div class="g-label">
                <span><span class="dot" />Afternoon</span>
                <span>{{ slotCount(availability.groups.afternoon) }} open</span>
              </div>
              <div class="slots__grid">
                <button
                  v-for="s in availability.groups.afternoon"
                  :key="s.time"
                  type="button"
                  class="slot"
                  :class="{ 'is-selected': selTime === s.time }"
                  :disabled="s.booked"
                  @click="pickTime(s.time)"
                >{{ s.time }}</button>
              </div>
            </div>

            <div v-if="availability.groups.evening.length" class="slots__group">
              <div class="g-label">
                <span><span class="dot" />Evening</span>
                <span>{{ slotCount(availability.groups.evening) }} open</span>
              </div>
              <div class="slots__grid">
                <button
                  v-for="s in availability.groups.evening"
                  :key="s.time"
                  type="button"
                  class="slot"
                  :class="{ 'is-selected': selTime === s.time }"
                  :disabled="s.booked"
                  @click="pickTime(s.time)"
                >{{ s.time }}</button>
              </div>
            </div>

            <div v-if="!availability.groups.morning.length && !availability.groups.afternoon.length && !availability.groups.evening.length"
              class="slots__empty">Closed this day.</div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.step__head {
  display: flex; justify-content: space-between; align-items: flex-end;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 24px; margin-bottom: 0;
}
.step-label { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); margin-bottom: 14px; }
h2 { font-family: var(--serif); font-weight: 400; font-size: clamp(32px, 4vw, 52px); line-height: 1; letter-spacing: -0.015em; }
h2 em { font-style: italic; color: var(--brass); }
.step-meta { font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.colon { color: var(--brass); }
.v { color: var(--bone); }

/* calendar */
.cal-wrap { display: grid; grid-template-columns: 1.2fr 1fr; gap: 0; border-top: 1px solid var(--rule); }
.cal { padding: 28px 28px 28px 0; border-right: 1px solid var(--rule); }

.cal__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.cal__title { font-family: var(--serif); font-size: 24px; letter-spacing: -0.01em; }
.cal__nav { display: flex; gap: 6px; }
.cal__nav button {
  width: 34px; height: 34px;
  background: transparent; border: 1px solid var(--rule); color: var(--bone);
  cursor: pointer; font: inherit;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all .2s ease;
}
.cal__nav button:hover:not(:disabled) { background: var(--bone); color: var(--ink); border-color: var(--bone); }
.cal__nav button:disabled { opacity: 0.3; cursor: not-allowed; }

.cal__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal__dow { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); padding: 8px 0; text-align: center; }

.cal__day {
  aspect-ratio: 1;
  background: transparent; border: 1px solid transparent; color: var(--bone);
  font: inherit; font-variant-numeric: tabular-nums; font-size: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s ease; padding: 0;
}
.cal__day:hover:not(:disabled) { border-color: var(--bone-dim); }
.cal__day:disabled { color: rgba(244,239,230,0.18); cursor: not-allowed; }
.cal__day.is-empty { background: transparent !important; }
.cal__day.is-closed { color: rgba(244,239,230,0.22); cursor: not-allowed; }
.cal__day.is-closed::after { content: "·"; font-size: 8px; color: rgba(244,239,230,0.3); margin-top: -2px; }
.cal__day.is-today { color: var(--brass); }
.cal__day.is-selected { background: var(--bone); color: var(--ink); border-color: var(--bone); }

.cal__legend {
  margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--rule);
  display: flex; gap: 22px;
  font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--bone-dim);
}
.swatch { display: inline-block; width: 8px; height: 8px; margin-right: 8px; vertical-align: middle; }
.swatch.now { background: var(--brass); }
.swatch.sel { background: var(--bone); }
.legend-r { margin-left: auto; }

/* slots */
.slots {
  padding: 28px 0 28px 36px;
  display: flex; flex-direction: column;
  min-height: 0; overflow: hidden;
}
.slots__prompt { color: var(--bone-dim); padding: 60px 0; text-align: center; font-size: 14px; }
.slots__empty  { color: var(--bone-dim); font-style: italic; padding: 60px 0; text-align: center; font-size: 14px; }

.slots__head {
  flex-shrink: 0;
  padding-bottom: 18px; margin-bottom: 0;
  border-bottom: 1px solid var(--rule);
  display: flex; justify-content: space-between; align-items: baseline;
}
.slots__date .day-of-week {
  display: block;
  font-size: 10px; font-family: var(--grot); letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--bone-dim); margin-bottom: 6px;
}
.slots__count { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }

.slots__body {
  flex: 1; min-height: 0;
  overflow-y: auto;
  padding-right: 8px; margin-right: -8px;
  scrollbar-width: thin;
  scrollbar-color: var(--rule) transparent;
  margin-top: 18px;
}
.slots__body::-webkit-scrollbar { width: 6px; }
.slots__body::-webkit-scrollbar-track { background: transparent; }
.slots__body::-webkit-scrollbar-thumb { background: var(--rule); }
.slots__body::-webkit-scrollbar-thumb:hover { background: var(--bone-dim); }

.slots__group { margin-bottom: 22px; }
.slots__group:first-child { margin-top: 0; }
.g-label {
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim);
  padding: 8px 0; border-bottom: 1px solid var(--rule); margin-bottom: 12px;
  display: flex; justify-content: space-between;
}
.dot { width: 4px; height: 4px; background: var(--brass); border-radius: 50%; display: inline-block; vertical-align: middle; margin-right: 8px; }

.slots__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }

.slot {
  background: transparent; border: 1px solid var(--rule); color: var(--bone);
  padding: 12px 0;
  font: inherit; font-size: 13px; letter-spacing: 0.04em; font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: all .2s ease;
}
.slot:hover:not(:disabled) { background: var(--bone); color: var(--ink); border-color: var(--bone); }
.slot:disabled { color: rgba(244,239,230,0.25); cursor: not-allowed; text-decoration: line-through; }
.slot.is-selected { background: var(--brass); color: var(--ink); border-color: var(--brass); font-weight: 600; }

@media (max-width: 900px) {
  .cal-wrap { grid-template-columns: 1fr; }
  .cal { border-right: 0; border-bottom: 1px solid var(--rule); padding: 0 0 24px; }
  .slots { padding: 24px 0 0; height: auto !important; }
  .step__head { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
