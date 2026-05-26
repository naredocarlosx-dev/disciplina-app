import { useState, useEffect } from 'react'

export function usePWA() {
  const ua = navigator.userAgent.toLowerCase()
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  const isAndroid = /android/.test(ua)
  const isIOS     = !isAndroid && /iphone|ipad|ipod/.test(ua)
  const isSafari  = /safari/.test(ua) && !/chrome/.test(ua) && !/crios/.test(ua) && !/fxios/.test(ua)
  const isChrome  = /chrome/.test(ua) && !/edge/.test(ua) && !/opr/.test(ua)
  const isMac     = /macintosh/.test(ua) && !isIOS
  const isWindows = /windows/.test(ua)

  const [canInstallNatively, setCanInstallNatively] = useState(!!window.deferredInstallPrompt)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      window.deferredInstallPrompt = e
      setCanInstallNatively(true)
    }
    const onInstalled = () => {
      window.deferredInstallPrompt = null
      setCanInstallNatively(false)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const triggerInstall = async () => {
    if (!window.deferredInstallPrompt) return false
    window.deferredInstallPrompt.prompt()
    const { outcome } = await window.deferredInstallPrompt.userChoice
    if (outcome === 'accepted') {
      window.deferredInstallPrompt = null
      setCanInstallNatively(false)
      setInstalled(true)
      return true
    }
    return false
  }

  return { isStandalone, installed, isIOS, isAndroid, isSafari, isChrome, isMac, isWindows, canInstallNatively, triggerInstall }
}
