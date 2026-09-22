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
  startsAt: number // ms since epoch
  pence: number
}

export interface Period {
  from: number
  to: number
}

// periods gives today, this week (Monday first) and this month, local time.
export function periods(now = new Date()): Record<'today' | 'week' | 'month', Period> {
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()
  const monday = d - ((now.getDay() + 6) % 7)
  return {
    today: { from: new Date(y, m, d).getTime(), to: new Date(y, m, d + 1).getTime() },
    week: { from: new Date(y, m, monday).getTime(), to: new Date(y, m, monday + 7).getTime() },
    month: { from: new Date(y, m, 1).getTime(), to: new Date(y, m + 1, 1).getTime() },
  }
}

// within keeps the bookings still standing (not cancelled) that start in p.
export function within(appts: Appt[], p: Period): Appt[] {
  return appts.filter((a) => a.status !== 'cancelled' && a.startsAt >= p.from && a.startsAt < p.to)
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
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
        startsAt,
        pence: r.price_pence,
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
