import type { BookingRow } from '~/types/api'
import { priceFmt } from '~/composables/useBookingStore'

export type ApptStatus = 'upcoming' | 'past' | 'cancelled'

export interface Appt {
  id: string
  dow: string
  d: string
  m: string
  status: ApptStatus
  svcNum: string
  svcName: string
  duration: string
  price: string
  timeStart: string
  timeEnd: string
  isNext: boolean
  client: string
  chair: string
}

function minutes(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// toAppts shapes booking rows for the dashboard diary cards: upcoming soonest
// first, then everything else newest first, with the soonest flagged isNext.
export function toAppts(rows: BookingRow[]): Appt[] {
  const now = new Date()
  const today = now.toDateString()
  const items = rows.map((r) => {
    const [y = 0, mo = 1, d = 1] = r.date.split('-').map(Number)
    const day = new Date(y, mo - 1, d)
    const start = r.time_start.slice(0, 5)
    const end = r.time_end.slice(0, 5)
    const startsAt = day.getTime() + minutes(start) * 60_000
    const endsAt = day.getTime() + minutes(end) * 60_000
    const status: ApptStatus = r.status === 'cancelled' ? 'cancelled' : endsAt < now.getTime() ? 'past' : 'upcoming'
    return {
      startsAt,
      appt: {
        id: r.id,
        dow: day.toDateString() === today ? 'Today' : day.toLocaleDateString('en-GB', { weekday: 'short' }),
        d: String(d).padStart(2, '0'),
        m: `${day.toLocaleDateString('en-GB', { month: 'short' })} ' ${String(y).slice(2)}`,
        status,
        svcNum: '',
        svcName: r.service_name,
        duration: `${minutes(end) - minutes(start)} min`,
        price: priceFmt(r.price_pence),
        timeStart: start,
        timeEnd: end,
        isNext: false,
        client: [r.first_name, r.last_name].filter(Boolean).join(' ') || 'Guest',
        chair: r.barber_name ?? '',
      } satisfies Appt,
    }
  })

  items.sort((a, b) => {
    const au = a.appt.status === 'upcoming'
    const bu = b.appt.status === 'upcoming'
    if (au !== bu) return au ? -1 : 1
    return au ? a.startsAt - b.startsAt : b.startsAt - a.startsAt
  })

  const appts: Appt[] = items.map((x, i) => ({ ...x.appt, svcNum: String(i + 1).padStart(2, '0') }))
  const next = appts[0]
  if (next?.status === 'upcoming') next.isNext = true
  return appts
}
