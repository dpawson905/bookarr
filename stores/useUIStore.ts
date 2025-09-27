import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Modals and dialogs
  modals: {
    searchBook: boolean
    addBook: boolean
    editBook: boolean
    deleteBook: boolean
    downloadSettings: boolean
    indexerSettings: boolean
    qualityProfile: boolean
    importBooks: boolean
  }
  
  // Notifications
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: Date
    read: boolean
  }>
  
  // Loading states
  loading: {
    books: boolean
    downloads: boolean
    search: boolean
    import: boolean
  }
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void
  reset: () => void
}

const initialModals = {
  searchBook: false,
  addBook: false,
  editBook: false,
  deleteBook: false,
  downloadSettings: false,
  indexerSettings: false,
  qualityProfile: false,
  importBooks: false
}

const initialLoading = {
  books: false,
  downloads: false,
  search: false,
  import: false
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: true,
      sidebarCollapsed: false,
      modals: initialModals,
      notifications: [],
      loading: initialLoading,

      // Actions
      setTheme: (theme) =>
        set({ theme }),

      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true }
        })),

      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false }
        })),

      closeAllModals: () =>
        set({ modals: initialModals }),

      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep only last 50
        }))
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        })),

      clearNotifications: () =>
        set({ notifications: [] }),

      setLoading: (key, loading) =>
        set((state) => ({
          loading: { ...state.loading, [key]: loading }
        })),

      reset: () =>
        set({
          theme: 'system',
          sidebarOpen: true,
          sidebarCollapsed: false,
          modals: initialModals,
          notifications: [],
          loading: initialLoading
        })
    }),
    {
      name: 'bookarr-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
)
