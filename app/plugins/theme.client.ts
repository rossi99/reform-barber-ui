export default defineNuxtPlugin(() => {
  // Force light theme — system `prefers-color-scheme` detection disabled.
  // Dark CSS in theme.css is preserved for a future manual toggle.
  useTheme().apply('light')
})
