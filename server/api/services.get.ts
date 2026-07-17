import type { H3Event } from 'h3'

// Shape of a service as returned by the Go API's GET /api/services
// (see api/internal/model.Service).
export interface Service {
  id: string
  num: string
  name: string
  name_html: string
  description: string
  duration: number   // minutes
  price: number      // GBP pence
  published: boolean
}

export default defineEventHandler(async (_event: H3Event): Promise<Service[]> => {
  const config = useRuntimeConfig()
  return $fetch<Service[]>('/api/services', { baseURL: config.apiBaseUrl })
})
