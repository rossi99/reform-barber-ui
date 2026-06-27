<script setup lang="ts">
const STORAGE_KEY = 'rb_cookie_notice_dismissed'
const dismissed = ref(true)

onMounted(() => {
  dismissed.value = localStorage.getItem(STORAGE_KEY) === '1'
})

function accept() {
  localStorage.setItem(STORAGE_KEY, '1')
  dismissed.value = true
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cookie-notice">
      <div
        v-if="!dismissed"
        class="cookie-notice"
        role="dialog"
        aria-label="Cookie notice"
        aria-modal="false"
      >
        <p class="cookie-notice__msg">
          We use a cookie to keep you signed in. No tracking, no ads.
          <NuxtLink to="/privacy" class="cookie-notice__link">Learn more</NuxtLink>
        </p>
        <button class="cookie-notice__btn" @click="accept">Got it</button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cookie-notice {
  position: fixed;
  bottom: 108px;
  right: 32px;
  z-index: 9001;
  min-width: 280px;
  max-width: 380px;
  padding: 16px 20px;
  background: var(--ink-2);
  border: 1px solid var(--rule);
  border-left: 3px solid var(--brass);
  display: flex;
  align-items: center;
  gap: 16px;
}

.cookie-notice__msg {
  font-size: 13px;
  color: var(--bone);
  line-height: 1.4;
  flex: 1;
}

.cookie-notice__link {
  color: var(--brass);
  text-decoration: underline;
  margin-left: 4px;
}

.cookie-notice__btn {
  flex-shrink: 0;
  font-family: var(--grot);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 8px 14px;
  background: var(--bone);
  color: var(--ink);
  border: 1px solid var(--bone);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.cookie-notice__btn:hover {
  background: var(--brass);
  border-color: var(--brass);
}

.cookie-notice-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.cookie-notice-leave-active {
  transition: opacity 0.2s ease;
}
.cookie-notice-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.cookie-notice-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .cookie-notice {
    bottom: 88px;
    right: 16px;
    left: 16px;
    max-width: 100%;
  }
}
</style>
