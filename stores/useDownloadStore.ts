import { create } from 'zustand'
import { DownloadWithBook, DownloadStatus } from '@/types'

interface DownloadState {
  // Downloads data
  downloads: DownloadWithBook[]
  activeDownloads: DownloadWithBook[]
  completedDownloads: DownloadWithBook[]
  failedDownloads: DownloadWithBook[]
  
  // UI state
  isLoading: boolean
  error: string | null
  selectedDownloads: string[]
  
  // Stats
  totalSpeed: string
  totalProgress: number
  
  // Actions
  setDownloads: (downloads: DownloadWithBook[]) => void
  addDownload: (download: DownloadWithBook) => void
  updateDownload: (id: string, updates: Partial<DownloadWithBook>) => void
  removeDownload: (id: string) => void
  setSelectedDownloads: (ids: string[]) => void
  toggleDownloadSelection: (id: string) => void
  clearSelection: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateStats: () => void
  retryDownload: (id: string) => void
  pauseDownload: (id: string) => void
  resumeDownload: (id: string) => void
  cancelDownload: (id: string) => void
  clearCompleted: () => void
  clearFailed: () => void
  reset: () => void
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  // Initial state
  downloads: [],
  activeDownloads: [],
  completedDownloads: [],
  failedDownloads: [],
  isLoading: false,
  error: null,
  selectedDownloads: [],
  totalSpeed: '0 B/s',
  totalProgress: 0,

  // Actions
  setDownloads: (downloads) => {
    const active = downloads.filter(d => d.status === 'DOWNLOADING' || d.status === 'PENDING')
    const completed = downloads.filter(d => d.status === 'COMPLETED')
    const failed = downloads.filter(d => d.status === 'FAILED')
    
    set({
      downloads,
      activeDownloads: active,
      completedDownloads: completed,
      failedDownloads: failed,
      error: null
    })
    
    // Update stats
    get().updateStats()
  },

  addDownload: (download) =>
    set((state) => {
      const newDownloads = [...state.downloads, download]
      const active = newDownloads.filter(d => d.status === 'DOWNLOADING' || d.status === 'PENDING')
      const completed = newDownloads.filter(d => d.status === 'COMPLETED')
      const failed = newDownloads.filter(d => d.status === 'FAILED')
      
      return {
        downloads: newDownloads,
        activeDownloads: active,
        completedDownloads: completed,
        failedDownloads: failed
      }
    }),

  updateDownload: (id, updates) =>
    set((state) => {
      const newDownloads = state.downloads.map((download) =>
        download.id === id ? { ...download, ...updates } : download
      )
      
      const active = newDownloads.filter(d => d.status === 'DOWNLOADING' || d.status === 'PENDING')
      const completed = newDownloads.filter(d => d.status === 'COMPLETED')
      const failed = newDownloads.filter(d => d.status === 'FAILED')
      
      return {
        downloads: newDownloads,
        activeDownloads: active,
        completedDownloads: completed,
        failedDownloads: failed
      }
    }),

  removeDownload: (id) =>
    set((state) => {
      const newDownloads = state.downloads.filter((download) => download.id !== id)
      const active = newDownloads.filter(d => d.status === 'DOWNLOADING' || d.status === 'PENDING')
      const completed = newDownloads.filter(d => d.status === 'COMPLETED')
      const failed = newDownloads.filter(d => d.status === 'FAILED')
      
      return {
        downloads: newDownloads,
        activeDownloads: active,
        completedDownloads: completed,
        failedDownloads: failed,
        selectedDownloads: state.selectedDownloads.filter((downloadId) => downloadId !== id)
      }
    }),

  setSelectedDownloads: (ids) =>
    set({ selectedDownloads: ids }),

  toggleDownloadSelection: (id) =>
    set((state) => ({
      selectedDownloads: state.selectedDownloads.includes(id)
        ? state.selectedDownloads.filter((downloadId) => downloadId !== id)
        : [...state.selectedDownloads, id]
    })),

  clearSelection: () =>
    set({ selectedDownloads: [] }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),

  updateStats: () => {
    const { activeDownloads } = get()
    
    if (activeDownloads.length === 0) {
      set({ totalSpeed: '0 B/s', totalProgress: 0 })
      return
    }

    const totalProgress = activeDownloads.reduce((sum, download) => sum + download.progress, 0) / activeDownloads.length
    // Note: Speed calculation would need to be implemented based on your download client
    const totalSpeed = '0 B/s' // Placeholder

    set({ totalProgress, totalSpeed })
  },

  retryDownload: (id) => {
    // This would trigger an API call to retry the download
    console.log('Retrying download:', id)
  },

  pauseDownload: (id) => {
    // This would trigger an API call to pause the download
    console.log('Pausing download:', id)
  },

  resumeDownload: (id) => {
    // This would trigger an API call to resume the download
    console.log('Resuming download:', id)
  },

  cancelDownload: (id) => {
    // This would trigger an API call to cancel the download
    console.log('Canceling download:', id)
  },

  clearCompleted: () =>
    set((state) => ({
      downloads: state.downloads.filter(d => d.status !== 'COMPLETED'),
      completedDownloads: []
    })),

  clearFailed: () =>
    set((state) => ({
      downloads: state.downloads.filter(d => d.status !== 'FAILED'),
      failedDownloads: []
    })),

  reset: () =>
    set({
      downloads: [],
      activeDownloads: [],
      completedDownloads: [],
      failedDownloads: [],
      isLoading: false,
      error: null,
      selectedDownloads: [],
      totalSpeed: '0 B/s',
      totalProgress: 0
    })
}))
