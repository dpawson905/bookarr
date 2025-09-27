'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface SetupStatus {
  setupRequired: boolean
  userCount: number
}

export default function SetupChecker() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkSetupStatus = async () => {
      // Skip checking for certain paths
      if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico')
      ) {
        return
      }

      try {
        const response = await fetch('/api/setup')
        const data: SetupStatus = await response.json()
        
        // If setup is required and we're not on the setup page, redirect to setup
        if (data.setupRequired && pathname !== '/setup') {
          router.replace('/setup')
          return
        }
        
        // If setup is not required and we're on the setup page, redirect to signin
        if (!data.setupRequired && pathname === '/setup') {
          router.replace('/auth/signin')
          return
        }
        
        // If we're on the home page and setup is not required, redirect to signin
        if (pathname === '/' && !data.setupRequired) {
          router.replace('/auth/signin')
          return
        }
        
      } catch (error) {
        console.error('Failed to check setup status:', error)
        // If there's an error, allow the request to proceed
      }
    }

    checkSetupStatus()
  }, [mounted, router, pathname])

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return null
}
