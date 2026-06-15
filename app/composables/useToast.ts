export type ToastKind = 'error' | 'success' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

let nextId = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function push(kind: ToastKind, message: string, ttl = 4000) {
    const id = ++nextId
    toasts.value.push({ id, kind, message })
    if (import.meta.client) {
      setTimeout(() => dismiss(id), ttl)
    }
  }

  function dismiss(id: number) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return {
    toasts,
    push,
    dismiss,
    error: (msg: string) => push('error', msg),
    success: (msg: string) => push('success', msg),
    info: (msg: string) => push('info', msg),
  }
}
