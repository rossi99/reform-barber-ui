import type { H3Event } from 'h3'

export interface Barber {
  id: string
  name: string
  title: string
  bio: string
  num: string
  photo_url?: string
}

export default defineEventHandler(async (_event: H3Event): Promise<Barber[]> => {
  const config = useRuntimeConfig()
  return $fetch<Barber[]>('/api/barbers', { baseURL: config.apiBaseUrl })
})
