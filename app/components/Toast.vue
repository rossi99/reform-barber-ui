<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.kind}`"
          role="alert"
          @click="dismiss(t.id)"
        >
          <span class="toast__msg">{{ t.message }}</span>
          <button class="toast__close" aria-label="Dismiss">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 280px;
  max-width: 420px;
  padding: 16px 20px;
  background: var(--ink-2);
  border: 1px solid var(--rule);
  border-left-width: 3px;
  cursor: pointer;
  pointer-events: all;
}

.toast--error   { border-left-color: #c0392b; }
.toast--success { border-left-color: var(--brass); }
.toast--info    { border-left-color: var(--bone-dim); }

.toast__msg {
  font-size: 13px;
  color: var(--bone);
  line-height: 1.4;
}

.toast__close {
  background: transparent;
  border: 0;
  color: var(--bone-dim);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 600px) {
  .toast-stack {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
  .toast {
    max-width: 100%;
  }
}
</style>
