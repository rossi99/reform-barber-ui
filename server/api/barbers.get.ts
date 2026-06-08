export interface Barber {
  id: string
  name: string
  title: string
  bio: string
  num: string
  role: string
}

const barbers: Barber[] = [
  { id: 'any',    name: 'Any Chair',  title: '',              bio: "Book the next available chair — we'll match you with whoever's free.", num: '00', role: '' },
  { id: 'nigel',  name: 'Nigel',      title: 'Founder',       bio: 'Built the room, sets the standard. Carries the original following into the new chair.', num: '01', role: 'Founder' },
  { id: 'barlow', name: 'Barlow',     title: 'Head Barber',   bio: 'Heads the floor. Sharp on fades, sharper on the brief no one writes down.', num: '02', role: 'Head' },
  { id: 'jordan', name: 'Jordan',     title: 'Senior Barber', bio: 'Skin fades and scissor work, the kind of quiet that lets a Saturday settle.', num: '03', role: 'Senior' },
  { id: 'josh',   name: 'Josh',       title: 'Senior Barber', bio: 'Modern shapes, clean lines, and the patience to walk through every option twice.', num: '04', role: 'Senior' },
  { id: 'kieran', name: 'Kieran',     title: 'Barber',        bio: 'Newest to the floor, already booked solid. Classics done with care.', num: '05', role: 'Barber' },
]

export default defineEventHandler(() => barbers)
