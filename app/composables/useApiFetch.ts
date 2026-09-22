type FetchOpts = NonNullable<Parameters<typeof $fetch>[1]>

// The signed-in caller's fetch: bearer token attached, and one retry through
// refresh() when it has expired. The retry sits here rather than in ofetch's
// onResponseError hook, which has no way to hand its response back.
export function useApiFetch() {
  const { accessToken, refresh } = useAuth()

  function authed(opts: FetchOpts): FetchOpts {
    const headers = new Headers(opts.headers as HeadersInit | undefined)

    if (accessToken.value) {
      headers.set('Authorization', `Bearer ${accessToken.value}`)
    }

    if (import.meta.server) {
      const { cookie } = useRequestHeaders(['cookie'])
      if (cookie) headers.set('Cookie', cookie)
    }

    return { ...opts, headers }
  }

  return async function apiFetch<T>(request: string, opts: FetchOpts = {}): Promise<T> {
    try {
      return await $fetch<T>(request, authed(opts))
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status !== 401 || !(await refresh())) throw err
      return await $fetch<T>(request, authed(opts))
    }
  }
}
