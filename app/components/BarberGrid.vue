<script setup lang="ts">
const barbers = [
  { id: 'nigel',  num: '01', role: 'Founder',       title: 'Founder',       bio: 'Built the room, sets the standard. Carries the original following into the new chair.' },
  { id: 'barlow', num: '02', role: 'Head',           title: 'Head Barber',   bio: 'Heads the floor. Sharp on fades, sharper on the brief no one writes down.' },
  { id: 'jordan', num: '03', role: 'Senior',         title: 'Senior Barber', bio: 'Skin fades and scissor work, the kind of quiet that lets a Saturday settle.' },
  { id: 'josh',   num: '04', role: 'Senior',         title: 'Senior Barber', bio: 'Modern shapes, clean lines, and the patience to walk through every option twice.' },
  { id: 'kieran', num: '05', role: 'Barber',         title: 'Barber',        bio: 'Newest to the floor, already booked solid. Classics done with care.' },
]

</script>

<template>
  <div class="team-wrap">
    <div class="team">
      <div v-for="b in barbers" :key="b.id" class="barber">
        <div class="barber__portrait">
          <picture>
            <source :srcset="`/images/barbers/${b.id}-light.jpg`" media="all">
            <img
              :src="`/images/barbers/${b.id}.jpg`"
              :alt="`${b.id.charAt(0).toUpperCase() + b.id.slice(1)}, ${b.title}`"
              loading="lazy"
            />
          </picture>
          <span class="ph-label">/ {{ b.num }} <span class="dot-accent">·</span> {{ b.role }}</span>
        </div>
        <div class="barber__meta">
          <span class="barber__name">{{ b.id.charAt(0).toUpperCase() + b.id.slice(1) }}</span>
          <span class="barber__title">{{ b.title }}</span>
        </div>
        <p class="barber__bio">{{ b.bio }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-wrap { position: relative; }

.team {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.barber { display: flex; flex-direction: column; gap: 18px; }

.barber__portrait {
  aspect-ratio: 3 / 4;
  background: var(--ink-2);
  border: 1px solid var(--rule);
  position: relative;
  overflow: hidden;
  transition: border-color .3s ease;
}
.barber:hover .barber__portrait { border-color: var(--brass); }

.barber__portrait img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(0.15) contrast(1.02);
  transition: transform .6s cubic-bezier(.7,0,.2,1), filter .4s ease;
}
.barber:hover .barber__portrait img { transform: scale(1.03); filter: grayscale(0) contrast(1.05); }

.barber__portrait::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(10,10,10,0) 60%, rgba(10,10,10,0.45) 100%);
  pointer-events: none;
}

.ph-label {
  position: absolute; bottom: 16px; left: 18px;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(244,239,230,0.75);
  z-index: 2;
}
.dot-accent { color: var(--brass); }

.barber__meta { display: flex; justify-content: space-between; align-items: baseline; }
.barber__name { font-family: var(--serif); font-size: 24px; }
.barber__title { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); }
.barber__bio { color: var(--bone-dim); font-size: 14px; line-height: 1.55; max-width: 32ch; }

@media (max-width: 1100px) {
  .team { grid-template-columns: repeat(3, 1fr); }
  .team-wrap .team { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 18px; padding-bottom: 12px; -webkit-overflow-scrolling: touch; }
  .barber { flex: 0 0 70%; scroll-snap-align: start; }
}

@media (max-width: 900px) {
  .barber { flex: 0 0 78%; }
}

.team::-webkit-scrollbar { height: 2px; }
.team::-webkit-scrollbar-track { background: var(--rule); }
.team::-webkit-scrollbar-thumb { background: var(--brass); }
</style>
