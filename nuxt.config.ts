export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    // Direct URL to the Go API — used by SSR middleware to bypass Nuxt's
    // internal h3 routing (which does not apply routeRules.proxy).
    // Override with NUXT_API_BASE_URL in production.
    apiBaseUrl: 'http://localhost:8080',
  },

  routeRules: {
    // Proxy all /api/* requests to the Go backend in dev and SSR.
    // In production, a reverse proxy (nginx/Caddy) handles this instead.
    '/api/**': { proxy: 'http://localhost:8080/api/**' },
  },

  app: {
    head: {
      title: 'RE:FORM — Hair & Culture, Larne',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1' },
        { name: 'description', content: 'RE:FORM Barbers — formerly Two Brothers. 3 Upper Main Street, Larne.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Archivo:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/theme.css',
    '~/assets/css/base.css',
  ],
})
