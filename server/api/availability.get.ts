import type { H3Event } from 'h3'

export interface Slot {
  time: string   // "HH:MM"
  booked: boolean
}

export interface AvailabilityResponse {
  date: string
  groups: {
    morning:   Slot[]
    afternoon: Slot[]
    evening:   Slot[]
  }
}

export default defineEventHandler(async (event: H3Event): Promise<AvailabilityResponse> => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  return $fetch<AvailabilityResponse>('/api/availability', {
    baseURL: config.apiBaseUrl,
    query,
  })
})
