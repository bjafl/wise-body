export const isCapacitor = !!(window as typeof window & { Capacitor?: unknown }).Capacitor

export function vibrate(pattern: number | number[] = 10) {
  if (navigator.vibrate) navigator.vibrate(pattern)
}
