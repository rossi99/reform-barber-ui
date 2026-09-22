// Response shapes of the Go API.

export interface Barber {
  id: string
  name: string
  title: string
  bio: string
  num: string
  photo_url?: string
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
