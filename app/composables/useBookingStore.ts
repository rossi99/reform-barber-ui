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

const empty = (): BookingState => ({
  barber:   null,
  service:  null,
  date:     null,
  time:     null,
  products: {},
})

// One visitor's half-finished booking. Held at module level it would instead
// be one object shared by every request the server renders.
export function useBookingStore() {
  const state = useState<BookingState>('booking', empty).value

  return {
    state,

    isComplete: computed(
      () => !!(state.barber && state.service && state.date && state.time)
    ),

    total: computed(() => {
      const svc = state.service?.price ?? 0
      const prods = Object.values(state.products).reduce((s, p) => s + p.price * p.qty, 0)
      return svc + prods
    }),

    setBarber(b: BookingBarber | null) {
      state.barber = b
      state.time = null
    },

    setService(s: BookingService | null) {
      state.service = s
      state.time = null
    },

    setDate(d: Date | null) {
      state.date = d
      state.time = null
    },

    setTime(t: string | null) {
      state.time = t
    },

    toggleProduct(id: string, name: string, price: number) {
      if (state.products[id]) {
        delete state.products[id]
      } else {
        state.products[id] = { id, name, price, qty: 1 }
      }
    },

    adjustQty(id: string, delta: number) {
      const p = state.products[id]
      if (!p) return
      const next = p.qty + delta
      if (next < 1) { delete state.products[id]; return }
      if (next > 3) return
      p.qty = next
    },
  }
}

export function priceFmt(pence: number) {
  return `£${(pence / 100).toFixed(0)}`
}

export function dateFmtShort(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

// The calendar day as the visitor picked it. toISOString would convert to UTC
// first, which moves a morning booking to the day before all summer.
export function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
