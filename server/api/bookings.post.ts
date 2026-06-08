import type { H3Event } from 'h3'

export interface BookingRequest {
  barberId:  string
  serviceId: string
  date:      string
  time:      string
  products:  Record<string, number>
}

export interface BookingResponse {
  id:        string
  status:    'confirmed'
  barberId:  string
  serviceId: string
  date:      string
  time:      string
  products:  Record<string, number>
  createdAt: string
}

function uid(): string {
  return `RFB-${Date.now().toString(36).toUpperCase()}`
}

export default defineEventHandler(async (event: H3Event): Promise<BookingResponse> => {
  const body = await readBody<BookingRequest>(event)

  return {
    id:        uid(),
    status:    'confirmed',
    barberId:  body.barberId  ?? '',
    serviceId: body.serviceId ?? '',
    date:      body.date      ?? '',
    time:      body.time      ?? '',
    products:  body.products  ?? {},
    createdAt: new Date().toISOString(),
  }
})
