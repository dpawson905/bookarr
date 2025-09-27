'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check setup status on the client side
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/setup')
        const data = await response.json()
        
        if (data.setupRequired) {
          router.push('/setup')
        } else {
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error checking setup status:', error)
        // If there's any error, assume setup is required
        router.push('/setup')
      }
    }

    checkSetupStatus()
  }, [router])

  // Show loading state while checking
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}