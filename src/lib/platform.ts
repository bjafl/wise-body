const isCapacitor = () => !!(window as { Capacitor?: unknown }).Capacitor

export const platform = {
  isCapacitor,
  isWeb: () => !isCapacitor(),

  async vibrate() {
    if (isCapacitor()) {
      // const { Haptics } = await import('@capacitor/haptics')
      // await Haptics.vibrate()
    } else {
      navigator.vibrate?.(50)
    }
  },

  async share(text: string) {
    if (isCapacitor()) {
      // const { Share } = await import('@capacitor/share')
      // await Share.share({ text })
    } else {
      await navigator.share?.({ text })
    }
  },
}
