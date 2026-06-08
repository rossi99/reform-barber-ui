<script setup lang="ts">
import { setService, type BookingService } from '~/composables/useBookingStore'
import type { Service } from '~/server/api/services.get'

const props = defineProps<{ barberName: string | null }>()
const emit = defineEmits<{ advance: [] }>()

const { data: services } = await useFetch<Service[]>('/api/services')
const selected = ref<string | null>(null)

function pick(s: Service) {
  selected.value = s.id
  const svc: BookingService = { id: s.id, name: s.name, price: s.price, duration: s.duration }
  setService(svc)
  setTimeout(() => emit('advance'), 260)
}

function priceFmt(pence: number) { return `£${(pence / 100).toFixed(0)}` }
</script>

<template>
  <div class="step__head">
    <div>
      <div class="step-label">— 02 / The Work</div>
      <h2>Pick a <em>cut.</em></h2>
    </div>
    <div class="step-meta">For <span class="v">{{ barberName || '—' }}</span></div>
  </div>

  <div class="services-list">
    <div
      v-for="s in services"
      :key="s.id"
      class="service-row"
      :class="{ 'is-selected': selected === s.id }"
      role="button"
      tabindex="0"
      @click="pick(s)"
      @keydown.enter.space.prevent="pick(s)"
    >
      <span class="service-row__num">/ {{ s.num }}</span>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span class="service-row__name" v-html="s.nameHtml" />
      <span class="service-row__meta">
        <span class="service-row__dur">{{ s.duration }} min</span>
        <span class="service-row__price">{{ priceFmt(s.price) }}</span>
      </span>
      <span class="service-row__check" />
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
.v { color: var(--bone); }

.services-list { border-top: 1px solid var(--rule); }

.service-row {
  display: grid;
  grid-template-columns: 70px 1fr auto 36px;
  align-items: center;
  gap: 32px;
  padding: 28px 12px;
  border-bottom: 1px solid var(--rule);
  cursor: pointer;
  transition: padding .25s ease, background .25s ease;
  background: transparent;
  color: inherit;
}
.service-row:hover { padding-left: 22px; background: rgba(176,141,87,0.04); }
.service-row:hover .service-row__name { color: var(--brass); }
.service-row.is-selected { background: rgba(176,141,87,0.08); }
.service-row.is-selected .service-row__name { color: var(--brass); }

.service-row__num { font-size: 11px; letter-spacing: 0.22em; color: var(--bone-dim); }
.service-row__name {
  font-family: var(--serif); font-size: clamp(24px, 2.6vw, 36px); line-height: 1;
  transition: color .25s ease;
}
:deep(.plus), :deep(.dot) { color: var(--brass); }

.service-row__meta { display: flex; gap: 24px; align-items: baseline; }
.service-row__dur { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.service-row__price { font-family: var(--serif); font-size: 22px; color: var(--bone); font-variant-numeric: tabular-nums; }

.service-row__check {
  width: 16px; height: 16px; border: 1px solid var(--rule);
  display: inline-flex; align-items: center; justify-content: center;
}
.service-row.is-selected .service-row__check::after { content: "✓"; font-size: 10px; font-weight: 700; }
.service-row.is-selected .service-row__check { background: var(--brass); border-color: var(--brass); color: var(--ink); }

@media (max-width: 900px) {
  .service-row { grid-template-columns: 40px 1fr; gap: 14px; padding: 22px 4px; }
  .service-row__meta { grid-column: 2; justify-content: space-between; width: 100%; }
  .service-row__check { display: none; }
  .service-row:hover { padding-left: 12px; }
  .step__head { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
