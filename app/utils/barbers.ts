import type { Barber } from '~/types/api'

// An uploaded photo is one file; the local art it falls back to has a graded variant.
export function portrait(b: Barber): { srcset: string; src: string } {
  if (b.photo_url) return { srcset: b.photo_url, src: b.photo_url }
  const slug = b.name.toLowerCase().split(' ')[0]
  return { srcset: `/images/barbers/${slug}-light.jpg`, src: `/images/barbers/${slug}.jpg` }
}

// Short floor label: "Head Barber" reads as "Head" over the portrait.
export function role(title: string): string {
  if (!title) return 'Barber'
  return title === 'Barber' ? title : title.replace(/\s*Barber$/, '')
}
