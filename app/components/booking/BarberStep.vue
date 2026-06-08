<script setup lang="ts">
import { setBarber, type BookingBarber } from '~/composables/useBookingStore'

const barbers: BookingBarber[] = [
  { id: 'nigel',  name: 'Nigel',      title: 'Founder',       num: '01' },
  { id: 'barlow', name: 'Barlow',     title: 'Head Barber',   num: '02' },
  { id: 'jordan', name: 'Jordan',     title: 'Senior',        num: '03' },
  { id: 'josh',   name: 'Josh',       title: 'Senior',        num: '04' },
  { id: 'kieran', name: 'Kieran',     title: 'Barber',        num: '05' },
  { id: 'any',    name: 'Any chair',  title: 'Next available', num: '06' },
]

const notes: Record<string, string> = {
  nigel:  'Built the room, sets the standard.',
  barlow: 'Sharp on fades, sharper on the brief.',
  jordan: 'Skin fades and scissor work, quiet hands.',
  josh:   'Modern shapes, clean lines, patient.',
  kieran: 'Newest to the floor, classics done with care.',
  any:    'Whichever chair is open first. Same cut, same standard.',
}

const emit = defineEmits<{ advance: [] }>()
const selected = ref<string | null>(null)

function pick(b: BookingBarber) {
  selected.value = b.id
  setBarber(b)
  setTimeout(() => emit('advance'), 260)
}

</script>

<template>
  <div class="step__head">
    <div>
      <div class="step-label">— 01 / The Chair</div>
      <h2>Pick a <em>barber.</em></h2>
    </div>
    <div class="step-meta">Five chairs <span class="colon">·</span> <span class="v">one standard</span></div>
  </div>

  <div class="barbers">
    <div
      v-for="b in barbers"
      :key="b.id"
      class="barber-card"
      :class="{ 'is-selected': selected === b.id, 'any-card': b.id === 'any' }"
      role="button"
      tabindex="0"
      @click="pick(b)"
      @keydown.enter.space.prevent="pick(b)"
    >
      <div class="barber-card__img">
        <span class="num">/ {{ b.num }}</span>
        <template v-if="b.id === 'any'">
          <span class="glyph">:</span>
        </template>
        <template v-else>
          <picture>
            <source :srcset="`/images/barbers/${b.id}-light.jpg`" media="all">
            <img :src="`/images/barbers/${b.id}.jpg`" :alt="`${b.name}, ${b.title}`" loading="lazy" />
          </picture>
        </template>
      </div>
      <div class="barber-card__body">
        <div class="barber-card__row">
          <span class="barber-card__name">{{ b.name }}</span>
          <span class="barber-card__check" />
        </div>
        <div class="barber-card__role">{{ b.title }}</div>
        <p class="barber-card__note">{{ notes[b.id] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step__head {
  display: flex; justify-content: space-between; align-items: flex-end;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 24px; margin-bottom: 36px;
}
.step-label { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); margin-bottom: 14px; }
h2 { font-family: var(--serif); font-weight: 400; font-size: clamp(32px, 4vw, 52px); line-height: 1; letter-spacing: -0.015em; }
h2 em { font-style: italic; color: var(--brass); }
.step-meta { font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.colon { color: var(--brass); }
.v { color: var(--bone); }

.barbers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }

.barber-card {
  border: 1px solid var(--rule);
  background: transparent;
  text-align: left;
  color: inherit;
  font: inherit;
  cursor: pointer;
  display: flex; flex-direction: column;
  transition: border-color .25s ease;
}
.barber-card:hover { border-color: var(--brass); }
.barber-card.is-selected { border-color: var(--brass); background: rgba(176,141,87,0.06); }

.barber-card__img {
  aspect-ratio: 4/5;
  background: var(--ink-2);
  overflow: hidden;
  position: relative;
}
.barber-card__img img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  filter: grayscale(0.1) contrast(1.02);
  transition: filter .3s ease, transform .6s cubic-bezier(.7,0,.2,1);
}
.barber-card:hover .barber-card__img img { filter: none; transform: scale(1.03); }
.num {
  position: absolute; top: 14px; left: 14px;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(244,239,230,0.75); z-index: 1;
}
.barber-card__body { padding: 18px 18px 22px; }
.barber-card__row { display: flex; justify-content: space-between; align-items: baseline; }
.barber-card__name { font-family: var(--serif); font-size: 22px; letter-spacing: -0.005em; }
.barber-card__role { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.barber-card__note { color: var(--bone-dim); font-size: 13px; margin-top: 8px; line-height: 1.45; }
.barber-card__check {
  width: 16px; height: 16px; border: 1px solid var(--rule); flex-shrink: 0; margin-top: 4px;
  display: inline-flex; align-items: center; justify-content: center; font-size: 10px;
}
.barber-card.is-selected .barber-card__check::after { content: "✓"; font-weight: 700; }
.barber-card.is-selected .barber-card__check { background: var(--brass); border-color: var(--brass); color: var(--ink); }

.any-card .barber-card__img {
  background: repeating-linear-gradient(135deg, rgba(176,141,87,0.07) 0 12px, transparent 12px 24px), var(--ink-2);
  display: flex; align-items: center; justify-content: center;
}
.glyph { font-family: var(--serif); font-size: 96px; color: var(--bone-dim); letter-spacing: -0.04em; }

@media (max-width: 900px) {
  .barbers { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .barber-card__body { padding: 14px; }
  .barber-card__name { font-size: 18px; }
  .step__head { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
