import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ApiKeySettings } from '@/lib/validations/settings'

interface SettingsState {
  apiKeys: ApiKeySettings
  isLoading: boolean
  error: string | null
  
  // Actions
  setApiKeys: (apiKeys: ApiKeySettings) => void
  updateApiKeys: (apiKeys: Partial<ApiKeySettings>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetApiKeys: () => void
}

const defaultApiKeys: ApiKeySettings = {
  googleBooksApiKey: '',
  openLibraryApiKey: '',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKeys: defaultApiKeys,
      isLoading: false,
      error: null,

      setApiKeys: (apiKeys) => set({ apiKeys, error: null }),
      
      updateApiKeys: (apiKeys) => set((state) => ({
        apiKeys: { ...state.apiKeys, ...apiKeys },
        error: null
      })),

      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      resetApiKeys: () => set({ apiKeys: defaultApiKeys, error: null }),
    }),
    {
      name: 'bookarr-api-keys',
      partialize: (state) => ({ apiKeys: state.apiKeys }),
    }
  )
)

// Selectors for easier access
export const useApiKeys = () => useSettingsStore((state) => state.apiKeys)
