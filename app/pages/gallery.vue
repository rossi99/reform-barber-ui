<script setup lang="ts">
useHead({ title: 'Gallery — RE:FORM Hair & Culture' })

const filters = ['all', 'precision', 'classic', 'beard', 'room'] as const
type Filter = (typeof filters)[number]

const active = ref<Filter>('all')

const frames = [
  { cls: 'f-1',  tag: 'room',      mono: 'R', label: 'The Room : 01',           name: '3 Upper Main',   num: '001' },
  { cls: 'f-2',  tag: 'precision', mono: 'P', label: 'Precision : Skin Fade',   name: 'Skin / 0 to 4', num: '002' },
  // divider
  { cls: 'f-3',  tag: 'classic',   mono: 'C', label: 'Classic : Side Part',     name: 'Scissor / Side', num: '003' },
  { cls: 'f-4',  tag: 'precision', mono: 'T', label: 'Precision : Taper',       name: 'Mid Taper',      num: '004' },
  { cls: 'f-5',  tag: 'beard',     mono: 'B', label: 'Beard : Straight Razor',  name: 'Hot Towel Finish', num: '005' },
  { cls: 'f-6',  tag: 'precision', mono: 'F', label: 'Precision : Bald Fade',   name: 'Skin to Scissor', num: '006' },
  // divider
  { cls: 'f-7',  tag: 'room',      mono: 'L', label: 'The Room : 02',           name: 'Light study',    num: '007' },
  { cls: 'f-8',  tag: 'classic',   mono: 'K', label: 'Classic : Crop',          name: 'French Crop',    num: '008' },
  { cls: 'f-9',  tag: 'beard',     mono: 'L', label: 'Beard : Line',            name: 'Line Up',        num: '009' },
  { cls: 'f-10', tag: 'room',      mono: 'M', label: 'The Room : 03',           name: 'Mirror',         num: '010' },
  { cls: 'f-11', tag: 'precision', mono: 'H', label: 'Precision : High Fade',   name: 'High & Tight',   num: '011' },
  { cls: 'f-12', tag: 'room',      mono: 'C', label: 'The Room : 04',           name: 'Chair / 02',     num: '012' },
]

// frames before the second divider (after index 1, before index 6)
const DIVIDERS = [1, 5] // insert divider after these frame indices

function visible(tag: string): boolean {
  return active.value === 'all' || active.value === tag
}

function labelParts(label: string) {
  const [left, right] = label.split(' : ')
  return { left, right }
}
</script>

<template>
  <header class="page-head">
    <div>
      <div class="page-label">— Vol<span class="colon">:</span> 01 / Index</div>
      <h1>The<br /><em>work.</em></h1>
    </div>
    <div class="meta">
      <span class="k">Updated</span>
      <span>May 2026</span>
      <span class="k mt">Frames</span>
      <span>Twelve <span class="colon">·</span> 12</span>
    </div>
  </header>

  <div class="filter-bar">
    <button
      v-for="f in filters"
      :key="f"
      :class="{ active: active === f }"
      @click="active = f"
    >{{ f === 'all' ? 'All' : f === 'beard' ? 'Beard & Razor' : f.charAt(0).toUpperCase() + f.slice(1) }}</button>
    <span class="count">12 frames</span>
  </div>

  <section class="gallery">
    <template v-for="(fr, i) in frames" :key="fr.num">
      <!-- section divider after frame index 1 and 5 -->
      <div v-if="i === 2 && active === 'all'" class="div-line">
        <span class="label">Section <span class="colon">:</span> 01 / Cuts</span>
        <span class="rule-line" />
        <span class="label">/ 03 — 06</span>
      </div>
      <div v-if="i === 6 && active === 'all'" class="div-line">
        <span class="label">Section <span class="colon">:</span> 02 / Detail</span>
        <span class="rule-line" />
        <span class="label">/ 07 — 12</span>
      </div>

      <figure
        v-show="visible(fr.tag)"
        class="frame"
        :class="fr.cls"
        :data-tag="fr.tag"
      >
        <div class="frame__tag">
          <span class="dot" />
          {{ labelParts(fr.label).left }} <span class="colon">:</span> {{ labelParts(fr.label).right }}
        </div>
        <span class="frame__mono">{{ fr.mono }}</span>
        <figcaption class="frame__caption">
          <span class="name">{{ fr.name }}</span>
          <span class="num">/ {{ fr.num }}</span>
        </figcaption>
      </figure>
    </template>
  </section>

  <section class="cta-strip">
    <h2>Pictures get<br />the chair <em>second</em>.</h2>
    <div class="actions">
      <NuxtLink class="btn btn--solid" to="/book">Book Now <span class="arrow">→</span></NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.page-head {
  padding: 160px 36px 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: end;
  border-bottom: 1px solid var(--rule);
}
.page-label {
  font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--bone-dim); margin-bottom: 24px;
}
.page-head h1 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(56px, 10vw, 160px); line-height: 0.92;
  letter-spacing: -0.02em;
}
.page-head h1 em { font-style: italic; }
.meta { text-align: right; color: var(--bone-dim); font-size: 13px; display: flex; flex-direction: column; gap: 6px; }
.meta .k { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; }
.meta .mt { margin-top: 14px; }

.filter-bar {
  display: flex; gap: 8px;
  padding: 28px 36px;
  border-bottom: 1px solid var(--rule);
  overflow-x: auto;
}
.filter-bar button {
  background: transparent; border: 1px solid var(--rule); color: var(--bone-dim);
  font: inherit; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 10px 18px; cursor: pointer;
  transition: all .25s ease; white-space: nowrap;
}
.filter-bar button:hover { color: var(--bone); border-color: var(--bone-dim); }
.filter-bar button.active { background: var(--bone); color: var(--ink); border-color: var(--bone); }
.count { color: var(--bone-dim); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; margin-left: auto; align-self: center; padding-left: 24px; }

.gallery {
  padding: 48px 36px 120px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 18px;
}

.frame {
  position: relative;
  background: var(--ink-2);
  border: 1px solid var(--rule);
  overflow: hidden;
  cursor: pointer;
  transition: border-color .35s ease;
}
.frame:hover { border-color: var(--brass); }
.frame::before {
  content: "";
  position: absolute; inset: 14px;
  border: 1px solid rgba(176,141,87,0.12);
  pointer-events: none;
  transition: inset .35s ease, border-color .35s ease;
}
.frame:hover::before { inset: 8px; border-color: rgba(176,141,87,0.3); }

.frame__mono {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: var(--serif); font-size: 64px; color: rgba(244,239,230,0.06);
  letter-spacing: -0.02em;
  transition: color .35s ease;
}
.frame:hover .frame__mono { color: rgba(176,141,87,0.18); }

.frame__tag {
  position: absolute; top: 16px; left: 16px;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--bone-dim);
  display: flex; gap: 8px; align-items: center;
}
.dot { width: 4px; height: 4px; background: var(--brass); border-radius: 50%; display: inline-block; }
.colon { color: var(--brass); }

.frame__caption {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 18px 18px 16px;
  display: flex; justify-content: space-between; align-items: end;
  background: linear-gradient(to top, rgba(10,10,10,0.85), rgba(10,10,10,0));
}
.frame__caption .name { font-family: var(--serif); font-size: 18px; }
.frame__caption .num { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }

/* asymmetric sizing */
.f-1  { grid-column: span 7; aspect-ratio: 16 / 11; }
.f-2  { grid-column: span 5; aspect-ratio: 4 / 5; }
.f-3  { grid-column: span 4; aspect-ratio: 4 / 5; }
.f-4  { grid-column: span 4; aspect-ratio: 1 / 1; }
.f-5  { grid-column: span 4; aspect-ratio: 4 / 5; }
.f-6  { grid-column: span 5; aspect-ratio: 5 / 4; }
.f-7  { grid-column: span 7; aspect-ratio: 16 / 9; }
.f-8  { grid-column: span 3; aspect-ratio: 3 / 4; }
.f-9  { grid-column: span 6; aspect-ratio: 16 / 11; }
.f-10 { grid-column: span 3; aspect-ratio: 3 / 4; }
.f-11 { grid-column: span 5; aspect-ratio: 4 / 5; }
.f-12 { grid-column: span 7; aspect-ratio: 16 / 10; }

.div-line {
  grid-column: 1 / -1;
  display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: center;
  padding: 30px 0 12px;
}
.div-line .label { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.rule-line { height: 1px; background: var(--rule); }

.cta-strip {
  padding: 100px 36px;
  border-top: 1px solid var(--rule);
  display: grid; grid-template-columns: 2fr 1fr; gap: 40px; align-items: center;
}
.cta-strip h2 { font-family: var(--serif); font-weight: 400; font-size: clamp(36px, 5vw, 64px); line-height: 1; letter-spacing: -0.015em; }
.cta-strip h2 em { font-style: italic; color: var(--brass); }
.actions { justify-self: end; display: flex; gap: 12px; }

@media (max-width: 900px) {
  .page-head { padding: 120px 22px 56px; grid-template-columns: 1fr; gap: 24px; }
  .meta { text-align: left; }
  .filter-bar { padding: 20px 22px; }
  .count { display: none; }
  .gallery { padding: 32px 22px 80px; grid-template-columns: repeat(6, 1fr); gap: 14px; }
  .f-1, .f-7, .f-9, .f-12 { grid-column: span 6; }
  .f-2, .f-3, .f-4, .f-5, .f-6, .f-11 { grid-column: span 3; }
  .f-8, .f-10 { grid-column: span 3; }
  .cta-strip { grid-template-columns: 1fr; padding: 80px 22px; }
  .cta-strip .actions { justify-self: start; }
}
</style>
