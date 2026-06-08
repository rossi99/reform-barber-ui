export interface Service {
  id: string
  num: string
  name: string
  nameHtml: string
  desc: string
  duration: number  // minutes
  price: number     // GBP pence
}

const services: Service[] = [
  {
    id: 'precision-cut',
    num: '01',
    name: 'Precision Cut',
    nameHtml: 'Precision Cut',
    desc: 'Most booked. Skin fades, tapers and modern styles, finished clean and designed to sit well as it grows out.',
    duration: 30,
    price: 2500,
  },
  {
    id: 'precision-beard',
    num: '02',
    name: 'Precision Cut + Beard',
    nameHtml: 'Precision Cut <span class="plus">+</span> Beard',
    desc: 'Skin fades, tapers and modern styles with beard work. Detailed, balanced finish — designed to sit well as it grows.',
    duration: 40,
    price: 3000,
  },
  {
    id: 'classic-beard',
    num: '03',
    name: 'Classic + Beard',
    nameHtml: 'Classic <span class="plus">+</span> Beard',
    desc: 'A quick, simple cut with beard work included. Clipper grades or basic scissor work — no skin fades or tight tapers.',
    duration: 30,
    price: 2500,
  },
  {
    id: 'classic-cut',
    num: '04',
    name: 'Classic Cut',
    nameHtml: 'Classic Cut',
    desc: 'Grades 0.5 — 8. A quick, simple, no fuss cut. Clipper with basic scissor work on top; for fades or tight tapers, please book a Precision Cut.',
    duration: 20,
    price: 2000,
  },
  {
    id: 'under-16',
    num: '05',
    name: 'Under 16',
    nameHtml: 'Under 16',
    desc: 'Standard cuts only. Skin fades must be booked as a Precision Cut.',
    duration: 20,
    price: 1500,
  },
  {
    id: 'senior-gent',
    num: '06',
    name: 'Senior Gent 65+',
    nameHtml: 'Senior Gent <span class="dot">·</span> 65+',
    desc: 'A standard cut for the regulars who\'ve been sitting in chairs longer than we have.',
    duration: 20,
    price: 1500,
  },
]

export default defineEventHandler(() => services)
