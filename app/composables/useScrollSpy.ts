import type { Ref } from 'vue'

// useScrollSpy tracks which of the given section ids is on screen, for jump navs.
export function useScrollSpy<T extends string>(ids: readonly T[]) {
  const active = ref(ids[0]) as Ref<T>
  onMounted(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) active.value = e.target.id as T
      }
    }, { rootMargin: '-30% 0px -60% 0px' })
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    onBeforeUnmount(() => io.disconnect())
  })
  return active
}
