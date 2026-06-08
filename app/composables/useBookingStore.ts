export interface BookingBarber {
  id: string
  name: string
  title: string
  num: string
}

export interface BookingService {
  id: string
  name: string
  price: number   // pence
  duration: number
}

export interface ProductItem {
  id: string
  name: string
  price: number  // pence
  qty: number    // 1–3
}

export interface BookingState {
  barber:   BookingBarber | null
  service:  BookingService | null
  date:     Date | null
  time:     string | null           // "HH:MM"
  products: Record<string, ProductItem>  // id → item
}

const state = reactive<BookingState>({
  barber:   null,
  service:  null,
  date:     null,
  time:     null,
  products: {},
})

export const step = computed<1 | 2 | 3>(() => {
  if (!state.barber) return 1
  if (!state.service) return 2
  return 3
})

export const isComplete = computed(
  () => !!(state.barber && state.service && state.date && state.time)
)

export const total = computed(() => {
  const svc = state.service?.price ?? 0
  const prods = Object.values(state.products).reduce((s, p) => s + p.price * p.qty, 0)
  return svc + prods
})

export function priceFmt(pence: number) {
  return `£${(pence / 100).toFixed(0)}`
}

export function dateFmtShort(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function setBarber(b: BookingBarber | null) {
  state.barber = b
  state.time = null
}

export function setService(s: BookingService | null) {
  state.service = s
  state.time = null
}

export function setDate(d: Date | null) {
  state.date = d
  state.time = null
}

export function setTime(t: string | null) {
  state.time = t
}

export function toggleProduct(id: string, name: string, price: number) {
  if (state.products[id]) {
    delete state.products[id]
  } else {
    state.products[id] = { id, name, price, qty: 1 }
  }
}

export function adjustQty(id: string, delta: number) {
  const p = state.products[id]
  if (!p) return
  const next = p.qty + delta
  if (next < 1) { delete state.products[id]; return }
  if (next > 3) return
  p.qty = next
}

export function useBookingStore() {
  return { state, step, isComplete, total, priceFmt, dateFmtShort, setBarber, setService, setDate, setTime, toggleProduct, adjustQty }
}
