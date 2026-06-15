export function useApiFetch() {
  const { accessToken, refresh } = useAuth()

  const apiFetch = $fetch.create({
    onRequest({ options }) {
      const headers = new Headers(options.headers as HeadersInit | undefined)

      if (accessToken.value) {
        headers.set('Authorization', `Bearer ${accessToken.value}`)
      }

      if (import.meta.server) {
        const reqHeaders = useRequestHeaders(['cookie'])
        if (reqHeaders.cookie) headers.set('Cookie', reqHeaders.cookie)
      }

      options.headers = headers
    },

    async onResponseError({ request, options, response }) {
      if (response.status !== 401) return
      // @ts-expect-error -- custom flag to prevent infinite retry
      if (options._retried) return
      const ok = await refresh()
      if (!ok) return
      // @ts-expect-error
      options._retried = true
      await $fetch(request, { ...options })
    },
  })

  return apiFetch
}
