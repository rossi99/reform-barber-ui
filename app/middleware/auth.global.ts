export default defineNuxtRouteMiddleware(async (to) => {
  const isRoot = to.path === '/account'
  const isDash = /^\/account\/(customer|barber|founder)$/.test(to.path)
  if (!isRoot && !isDash) return

  const { user, accessToken, refresh, refreshSSR, fetchMe, roleDashboardPath } = useAuth()

  if (!user.value) {
    if (!accessToken.value) {
      // Capture all context-sensitive values synchronously before any await.
      // Composables called inside an async function that crosses executeAsync
      // boundaries lose the Nuxt injection context — so we pull them here.
      const event = import.meta.server ? useRequestEvent() : null
      const cookieHeader = import.meta.server ? (useRequestHeaders(['cookie']).cookie ?? '') : ''
      const apiBaseUrl = import.meta.server ? useRuntimeConfig().apiBaseUrl : ''

      const ok = import.meta.server
        ? await refreshSSR(cookieHeader, apiBaseUrl, event).catch(() => false)
        : await refresh().catch(() => false)

      if (ok) await fetchMe().catch(() => {})
    } else {
      await fetchMe().catch(() => {})
    }
  }

  if (isRoot && user.value) {
    return navigateTo(roleDashboardPath(user.value.role))
  }

  if (isDash && !user.value) {
    return navigateTo('/account')
  }

  if (isDash && user.value) {
    const expected = roleDashboardPath(user.value.role)
    if (to.path !== expected) return navigateTo(expected)
  }
})
