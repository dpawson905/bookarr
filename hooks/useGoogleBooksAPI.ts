import { useEffect } from 'react'
import { googleBooksAPI } from '@/lib/apis/google-books'
import { useApiKeys } from '@/stores/useSettingsStore'

export function useGoogleBooksAPI() {
  const apiKeys = useApiKeys()

  useEffect(() => {
    // Update the Google Books API with the current API key from settings
    if (apiKeys.googleBooksApiKey) {
      googleBooksAPI.setApiKey(apiKeys.googleBooksApiKey)
    }
  }, [apiKeys.googleBooksApiKey])

  return {
    googleBooksAPI,
    isConfigured: googleBooksAPI.isConfigured(),
    apiKey: apiKeys.googleBooksApiKey
  }
}
