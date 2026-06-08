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

const SHOP_OPEN: Record<number, { open: string; close: string } | null> = {
  0: null,                          // Sun — closed
  1: { open: '09:30', close: '16:30' }, // Mon
  2: { open: '09:00', close: '16:30' }, // Tue
  3: { open: '09:00', close: '16:30' }, // Wed
  4: { open: '09:30', close: '19:00' }, // Thu
  5: { open: '09:00', close: '16:30' }, // Fri
  6: { open: '07:30', close: '14:30' }, // Sat
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) { h = (Math.imul(31, h) + s.charCodeAt(i)) | 0 }
  return Math.abs(h)
}

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minsToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export default defineEventHandler((event: H3Event): AvailabilityResponse => {
  const q = getQuery(event)
  const barberId  = String(q.barber ?? 'any')
  const serviceId = String(q.service ?? 'precision-cut')
  const dateStr   = String(q.date ?? '')

  const date = dateStr ? new Date(dateStr + 'T12:00:00') : new Date()
  const dow  = date.getDay()
  const hours = SHOP_OPEN[dow]

  if (!hours) {
    return { date: dateStr, groups: { morning: [], afternoon: [], evening: [] } }
  }

  const openMins  = timeToMins(hours.open)
  const closeMins = timeToMins(hours.close)
  const slots: Slot[] = []

  for (let m = openMins; m < closeMins; m += 10) {
    const t = minsToTime(m)
    const key = `${barberId}:${dateStr}:${t}`
    // ~30% booked deterministically
    const booked = hash(key) % 10 < 3
    slots.push({ time: t, booked })
  }

  const morning   = slots.filter(s => timeToMins(s.time) < 12 * 60)
  const afternoon = slots.filter(s => timeToMins(s.time) >= 12 * 60 && timeToMins(s.time) < 17 * 60)
  const evening   = slots.filter(s => timeToMins(s.time) >= 17 * 60)

  return { date: dateStr, groups: { morning, afternoon, evening } }
})
