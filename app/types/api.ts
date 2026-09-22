// Response shapes of the Go API.

export interface Barber {
  id: string
  name: string
  title: string
  bio: string
  num: string
  photo_url?: string
  active: boolean
}

export interface Service {
  id: string
  num: string
  name: string
  name_html: string
  description: string
  duration: number // minutes
  price: number // pence
  published: boolean
}

export interface Product {
  id: string
  name: string
  price: number // pence
  image_url?: string
}

export interface Slot {
  time: string // "HH:MM"
  booked: boolean
}

export interface AvailabilityResponse {
  date: string
  groups: {
    morning: Slot[]
    afternoon: Slot[]
    evening: Slot[]
  }
}

// Booking row as listed by /api/me/bookings, /api/barber/appointments and
// /api/founder/bookings; each endpoint adds the names it joins.
export interface BookingRow {
  id: string
  reference: string
  date: string // "YYYY-MM-DD"
  time_start: string // "HH:MM:SS"
  time_end: string
  status: 'confirmed' | 'cancelled' | 'completed'
  service_name: string
  price_pence: number
  barber_name?: string
  first_name?: string | null
  last_name?: string | null
}
