const theme = ref<'dark' | 'light'>('light')

function apply(t: 'light' | 'dark') {
  theme.value = t
  if (import.meta.client) {
    const root = document.documentElement
    if (t === 'dark') root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')
  }
}

export function useTheme() {
  function recheck() {
    apply(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }

  return { theme, recheck, apply }
}
