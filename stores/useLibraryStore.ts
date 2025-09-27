import { create } from 'zustand'
import { BookWithDetails, LibraryViewState, BookStatus } from '@/types'

interface LibraryState {
  // View state
  viewState: LibraryViewState
  
  // Books data
  books: BookWithDetails[]
  selectedBooks: string[]
  isLoading: boolean
  error: string | null
  
  // Pagination
  currentPage: number
  totalPages: number
  hasMore: boolean
  
  // Actions
  setViewState: (viewState: Partial<LibraryViewState>) => void
  setBooks: (books: BookWithDetails[]) => void
  addBooks: (books: BookWithDetails[]) => void
  updateBook: (id: string, updates: Partial<BookWithDetails>) => void
  removeBook: (id: string) => void
  setSelectedBooks: (ids: string[]) => void
  toggleBookSelection: (id: string) => void
  clearSelection: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (page: number, totalPages: number, hasMore: boolean) => void
  reset: () => void
}

const initialViewState: LibraryViewState = {
  view: 'grid',
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  filter: {},
  search: ''
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  // Initial state
  viewState: initialViewState,
  books: [],
  selectedBooks: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,

  // Actions
  setViewState: (newViewState) =>
    set((state) => ({
      viewState: { ...state.viewState, ...newViewState }
    })),

  setBooks: (books) =>
    set({ books, selectedBooks: [], error: null }),

  addBooks: (newBooks) =>
    set((state) => ({
      books: [...state.books, ...newBooks]
    })),

  updateBook: (id, updates) =>
    set((state) => ({
      books: state.books.map((book) =>
        book.id === id ? { ...book, ...updates } : book
      )
    })),

  removeBook: (id) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== id),
      selectedBooks: state.selectedBooks.filter((bookId) => bookId !== id)
    })),

  setSelectedBooks: (ids) =>
    set({ selectedBooks: ids }),

  toggleBookSelection: (id) =>
    set((state) => ({
      selectedBooks: state.selectedBooks.includes(id)
        ? state.selectedBooks.filter((bookId) => bookId !== id)
        : [...state.selectedBooks, id]
    })),

  clearSelection: () =>
    set({ selectedBooks: [] }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),

  setPagination: (page, totalPages, hasMore) =>
    set({ currentPage: page, totalPages, hasMore }),

  reset: () =>
    set({
      viewState: initialViewState,
      books: [],
      selectedBooks: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      hasMore: false
    })
}))
