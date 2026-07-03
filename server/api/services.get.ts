// Shape of a service as returned by the Go API's GET /api/services
// (see api/internal/model.Service). In dev and production, /api/** is
// proxied straight to the Go backend, so this route handler is only a
// fallback — but this interface is the shared contract for the frontend.
export interface Service {
  id: string
  num: string
  name: string
  name_html: string
  description: string
  duration: number  // minutes
  price: number     // GBP pence
  published: boolean
}

const services: Service[] = [
  {
    id: 'precision-cut',
    num: '01',
    name: 'Precision Cut',
    name_html: 'Precision Cut',
    description: 'Most booked. Skin fades, tapers and modern styles, finished clean and designed to sit well as it grows out.',
    duration: 30,
    price: 2500,
    published: true,
  },
  {
    id: 'precision-beard',
    num: '02',
    name: 'Precision Cut + Beard',
    name_html: 'Precision Cut <span class="plus">+</span> Beard',
    description: 'Skin fades, tapers and modern styles with beard work. Detailed, balanced finish — designed to sit well as it grows.',
    duration: 40,
    price: 3000,
    published: true,
  },
  {
    id: 'classic-beard',
    num: '03',
    name: 'Classic + Beard',
    name_html: 'Classic <span class="plus">+</span> Beard',
    description: 'A quick, simple cut with beard work included. Clipper grades or basic scissor work — no skin fades or tight tapers.',
    duration: 30,
    price: 2500,
    published: true,
  },
  {
    id: 'classic-cut',
    num: '04',
    name: 'Classic Cut',
    name_html: 'Classic Cut',
    description: 'Grades 0.5 — 8. A quick, simple, no fuss cut. Clipper with basic scissor work on top; for fades or tight tapers, please book a Precision Cut.',
    duration: 20,
    price: 2000,
    published: true,
  },
  {
    id: 'under-16',
    num: '05',
    name: 'Under 16',
    name_html: 'Under 16',
    description: 'Standard cuts only. Skin fades must be booked as a Precision Cut.',
    duration: 20,
    price: 1500,
    published: true,
  },
  {
    id: 'senior-gent',
    num: '06',
    name: 'Senior Gent 65+',
    name_html: 'Senior Gent <span class="dot">·</span> 65+',
    description: 'A standard cut for the regulars who\'ve been sitting in chairs longer than we have.',
    duration: 20,
    price: 1500,
    published: true,
  },
]

export default defineEventHandler(() => services)
