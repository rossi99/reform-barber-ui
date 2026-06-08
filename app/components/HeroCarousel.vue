<script setup lang="ts">
const slides = [
  { tag: 'The Room', index: '01', mono: 'R', cap: '3 Upper Main' },
  { tag: 'Chair',    index: '02', mono: 'C', cap: 'Chair / 02'  },
  { tag: 'Detail',   index: '03', mono: 'D', cap: 'Light study' },
  { tag: 'Mirror',   index: '04', mono: 'M', cap: 'Mirror'      },
]

const current = ref(0)
let timer: ReturnType<typeof setInterval>

function go(n: number) {
  current.value = ((n % slides.length) + slides.length) % slides.length
}

function next() { go(current.value + 1) }
function prev() { go(current.value - 1) }

function restart() {
  clearInterval(timer)
  timer = setInterval(next, 5500)
}

onMounted(() => { restart() })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="carousel" aria-label="Shop gallery">
    <!-- dots -->
    <div class="carousel__dots">
      <button
        v-for="(_, i) in slides"
        :key="i"
        :class="{ active: i === current }"
        :aria-label="`Slide ${i + 1}`"
        @click="go(i); restart()"
      />
    </div>

    <!-- track -->
    <div class="carousel__track" :style="{ transform: `translateX(${-current * 100}%)` }">
      <div v-for="(s, i) in slides" :key="i" class="carousel__slide">
        <div class="ph-tag"><span class="dot" />&nbsp;{{ s.tag }} <span class="colon">:</span> {{ s.index }}</div>
        <span class="ph-mono">{{ s.mono }}</span>
        <div class="ph-cap">
          <span class="name">{{ s.cap }}</span>
        </div>
      </div>
    </div>

    <!-- controls -->
    <div class="carousel__controls">
      <button aria-label="Previous" @click="prev(); restart()">←</button>
      <button aria-label="Next"     @click="next(); restart()">→</button>
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  aspect-ratio: 4 / 5;
  border: 1px solid var(--rule);
  background: var(--ink-2);
  overflow: hidden;
}

.carousel__track {
  position: absolute; inset: 0;
  display: flex;
  transition: transform .9s cubic-bezier(.7,0,.2,1);
}

.carousel__slide {
  flex: 0 0 100%;
  position: relative;
  background: var(--ink-2);
}
.carousel__slide::before {
  content: "";
  position: absolute; inset: 16px;
  border: 1px solid rgba(176,141,87,0.18);
}
.carousel__slide .ph-mono {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: var(--serif); font-size: 120px; color: rgba(244,239,230,0.07);
  letter-spacing: -0.02em;
}
.carousel__slide .ph-tag {
  position: absolute; top: 22px; left: 22px;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(244,239,230,0.5);
  display: flex; gap: 8px; align-items: center;
}
.carousel__slide .ph-tag .dot { width: 4px; height: 4px; background: var(--brass); border-radius: 50%; }
.carousel__slide .ph-cap {
  position: absolute; bottom: 22px; left: 22px; right: 22px;
  display: flex; justify-content: space-between; align-items: end;
}
.carousel__slide .ph-cap .name { font-family: var(--serif); font-size: 22px; }

.carousel__controls {
  position: absolute; bottom: 22px; right: 22px;
  display: flex; gap: 8px;
  z-index: 2;
}
.carousel__controls button {
  width: 36px; height: 36px;
  background: rgba(10,10,10,0.7);
  border: 1px solid var(--rule);
  color: var(--bone);
  cursor: pointer;
  font-size: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all .25s ease;
}
.carousel__controls button:hover { background: var(--bone); color: var(--ink); border-color: var(--bone); }

.carousel__dots {
  position: absolute; top: 22px; right: 22px;
  display: flex; gap: 6px;
  z-index: 2;
}
.carousel__dots button {
  width: 24px; height: 2px;
  background: rgba(244,239,230,0.25);
  border: 0; padding: 0; cursor: pointer;
  transition: background .25s ease;
}
.carousel__dots button.active { background: var(--brass); }

.colon { color: var(--brass); }

@media (max-width: 900px) {
  .carousel { aspect-ratio: 3 / 4; }
}
</style>
