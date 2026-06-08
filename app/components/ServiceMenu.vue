<script setup lang="ts">
import type { Service } from '~/server/api/services.get'

const { data: services } = await useFetch<Service[]>('/api/services')

function priceFmt(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}
</script>

<template>
  <div class="service-list">
    <NuxtLink
      v-for="s in services"
      :key="s.id"
      class="service"
      to="/book"
    >
      <span class="service__num">/ {{ s.num }}</span>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span class="service__name" v-html="s.nameHtml" />
      <span class="service__desc">
        {{ s.desc }} <span class="dur">{{ s.duration }} min.</span>
      </span>
      <span class="service__action">{{ priceFmt(s.price) }} <span>→</span></span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.service-list { border-top: 1px solid var(--rule); }

.service {
  display: grid;
  grid-template-columns: 80px 1fr 2fr auto;
  gap: 40px;
  align-items: center;
  padding: 36px 0;
  border-bottom: 1px solid var(--rule);
  transition: padding .3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
.service:hover { padding-left: 18px; }
.service:hover .service__name { color: var(--brass); }

.service__num {
  font-family: var(--grot);
  font-size: 12px; letter-spacing: 0.2em;
  color: var(--bone-dim);
}
.service__name {
  font-family: var(--serif);
  font-size: clamp(32px, 4vw, 56px);
  line-height: 1;
  letter-spacing: -0.01em;
  transition: color .3s ease;
}
/* '+' and '·' inside name */
:deep(.plus), :deep(.dot) { color: var(--brass); }

.service__desc { color: var(--bone-dim); font-size: 14px; line-height: 1.55; max-width: 48ch; }
.dur { color: var(--bone-dim); }

.service__action {
  font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--bone-dim);
  display: inline-flex; align-items: center; gap: 10px;
  transition: color .25s ease;
  white-space: nowrap;
}
.service:hover .service__action { color: var(--bone); }

@media (max-width: 900px) {
  .service { grid-template-columns: 40px 1fr; gap: 16px; padding: 28px 0; }
  .service__desc, .service__action { grid-column: 2; }
  .service__action { justify-self: start; }
}
</style>
