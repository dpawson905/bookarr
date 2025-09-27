import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSettingsStore } from '@/stores/useSettingsStore'

export function useSettingsInitialization() {
  const { data: session, status } = useSession()
  const { setApiKeys, setLoading, setError } = useSettingsStore()

  useEffect(() => {
    // Only load API keys if user is authenticated
    if (status !== 'authenticated' || !session?.user?.id) {
      return
    }

    const loadApiKeys = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/settings/api-keys')
        
        if (!response.ok) {
          if (response.status === 401) {
            // User not authenticated, don't show error
            return
          }
          throw new Error('Failed to load API keys')
        }

        const data = await response.json()
        setApiKeys(data.apiKeys)
      } catch (error) {
        console.error('Error loading API keys:', error)
        setError(error instanceof Error ? error.message : 'Failed to load API keys')
      } finally {
        setLoading(false)
      }
    }

    loadApiKeys()
  }, [session, status, setApiKeys, setLoading, setError])
}
