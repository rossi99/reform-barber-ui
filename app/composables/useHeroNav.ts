/**
 * Shared reactive flag: true while the home-page hero section is the primary
 * viewport content. Set by index.vue via a scroll listener; read by SiteNav
 * to switch between transparent-hero and solid-background modes.
 *
 * Initialises to true on the home route so SSR renders the transparent state
 * immediately — no flash of solid nav on first load.
 */
export const useHeroNav = () => {
  const route = useRoute()
  return useState<boolean>('heroNavActive', () => route.path === '/')
}
