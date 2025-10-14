import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function MiniAppReady() {
  useEffect(() => {
    // Signal when app is ready to be displayed
    sdk.actions.ready()
  }, [])

  return null
}
