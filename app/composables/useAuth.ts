export interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'customer' | 'barber' | 'founder' | 'admin'
  createdAt: string
}

export interface RegisterInput {
  email: string
  firstName: string
  lastName: string
  reminderOpt: boolean
}

interface TokenResponse {
  accessToken: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth.user', () => null)
  const accessToken = useState<string | null>('auth.accessToken', () => null)
  const status = computed(() => (user.value ? 'authed' : 'guest') as 'authed' | 'guest')

  function roleDashboardPath(role: AuthUser['role']): string {
    if (role === 'barber') return '/account/barber'
    if (role === 'founder') return '/account/founder'
    if (role === 'admin') return '/account/admin'
    return '/account/customer'
  }

  async function fetchMe() {
    if (!accessToken.value) return
    const data = await $fetch<AuthUser>('/api/me', {
      headers: { Authorization: `Bearer ${accessToken.value}` },
    })
    user.value = data
  }

  // SSR-safe refresh: takes pre-captured values so no composables are called
  // across an async boundary (which would lose the Nuxt injection context).
  async function refreshSSR(cookieHeader: string, apiBaseUrl: string, event: any): Promise<boolean> {
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { cookie: cookieHeader },
      })
      if (!res.ok) return false
      const setCookie = res.headers.get('set-cookie')
      if (setCookie && event) {
        // appendResponseHeader is not exported into the Vue SSR bundle -
        // use the raw Node.js response API instead.
        event.node?.res?.appendHeader?.('set-cookie', setCookie)
      }
      const data = await res.json() as TokenResponse
      accessToken.value = data.accessToken
      return true
    } catch {
      return false
    }
  }

  async function refresh(): Promise<boolean> {
    try {
      const data = await $fetch<TokenResponse>('/api/auth/refresh', { method: 'POST' })
      accessToken.value = data.accessToken
      return true
    } catch {
      return false
    }
  }

  // Registering only emails a sign-in code. The session starts when that code
  // comes back through verifyLoginCode, same as signing in.
  async function register(input: RegisterInput) {
    await $fetch<{ message: string }>('/api/auth/register', {
      method: 'POST',
      body: input,
    })
  }

  // Sign-in is passwordless and takes two calls: ask for a code, then send it
  // back. The request step deliberately succeeds even for an unknown address,
  // so it tells us nothing about whether an account exists.
  async function requestLoginCode(email: string) {
    await $fetch<{ message: string }>('/api/auth/login/request', {
      method: 'POST',
      body: { email },
    })
  }

  async function verifyLoginCode(email: string, code: string) {
    const data = await $fetch<TokenResponse>('/api/auth/login/verify', {
      method: 'POST',
      body: { email, code },
    })
    accessToken.value = data.accessToken
    await fetchMe()
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // best-effort
    }
    user.value = null
    accessToken.value = null
    await navigateTo('/account')
  }

  return { user, accessToken, status, register, requestLoginCode, verifyLoginCode, logout, refresh, refreshSSR, fetchMe, roleDashboardPath }
}
