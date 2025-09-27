import { Book, Author, Series, Download, User, BookStatus, DownloadStatus } from '@prisma/client'

// Re-export Prisma types
export type { Book, Author, Series, Download, User, BookStatus, DownloadStatus }

// Extended HTML input attributes for file inputs
declare module 'react' {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: string
    directory?: string
  }
}

// Extended types with relations
export interface BookWithDetails extends Book {
  authors: (BookAuthor & { author: Author })[]
  series?: Series | null
  downloads: Download[]
  categories: BookCategory[]
}

export interface AuthorWithBooks extends Author {
  books: (BookAuthor & { book: Book })[]
  series: Series[]
}

export interface SeriesWithBooks extends Series {
  author: Author
  books: Book[]
}

export interface DownloadWithBook extends Download {
  book: Book
}

// API Response types
export interface GoogleBooksResponse {
  kind: string
  totalItems: number
  items: GoogleBookItem[]
}

export interface GoogleBookItem {
  id: string
  volumeInfo: {
    title: string
    subtitle?: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    pageCount?: number
    categories?: string[]
    language?: string
    imageLinks?: {
      smallThumbnail?: string
      thumbnail?: string
      small?: string
      medium?: string
      large?: string
      extraLarge?: string
    }
  }
}

export interface OpenLibraryResponse {
  key: string
  title: string
  subtitle?: string
  authors?: Array<{
    key: string
    name: string
  }>
  publishers?: Array<{
    name: string
  }>
  publish_date?: string
  description?: string
  isbn_10?: string[]
  isbn_13?: string[]
  number_of_pages?: number
  subjects?: string[]
  languages?: Array<{
    key: string
  }>
  covers?: number[]
}

// Search and filter types
export interface BookSearchParams {
  query?: string
  author?: string
  isbn?: string
  format?: string
  status?: BookStatus
  series?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: 'title' | 'author' | 'dateAdded' | 'publishedAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
  books: BookWithDetails[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Download client types
export interface DownloadClientConfig {
  id: string
  name: string
  type: 'sabnzbd' | 'nzbget'
  host: string
  port: number
  username?: string
  password?: string
  apiKey?: string
  category: string
  isActive: boolean
}

export interface DownloadProgress {
  id: string
  status: DownloadStatus
  progress: number
  speed?: string
  eta?: string
  error?: string
}

// NZB Indexer types
export interface NZBSearchResult {
  id: string
  title: string
  size: number
  category: string
  nzbUrl: string
  indexer: string
  quality?: string
  format?: string
  releaseGroup?: string
  age: number // days
}

export interface IndexerConfig {
  id: string
  name: string
  type: 'nzbgeek' | 'nzbhydra' | 'newznab' | 'custom'
  url: string
  apiKey?: string
  username?: string
  password?: string
  isActive: boolean
}

// Form types
export interface BookFormData {
  title: string
  subtitle?: string
  authors: string[]
  isbn?: string
  description?: string
  publishedAt?: string
  pageCount?: number
  language?: string
  categories?: string[]
  seriesId?: string
  seriesOrder?: number
}

export interface AuthorFormData {
  name: string
  sortName?: string
  biography?: string
  birthDate?: string
  deathDate?: string
  nationality?: string
  website?: string
  imageUrl?: string
}

export interface SeriesFormData {
  name: string
  description?: string
  authorId: string
  imageUrl?: string
}

// UI State types
export interface LibraryViewState {
  view: 'grid' | 'list'
  sortBy: 'title' | 'author' | 'dateAdded' | 'publishedAt' | 'rating'
  sortOrder: 'asc' | 'desc'
  filter: {
    status?: BookStatus[]
    format?: string[]
    category?: string[]
    author?: string[]
    series?: string[]
  }
  search: string
}

export interface DashboardStats {
  totalBooks: number
  readBooks: number
  unreadBooks: number
  readingBooks: number
  totalAuthors: number
  totalSeries: number
  recentBooks: BookWithDetails[]
  recentDownloads: DownloadWithBook[]
  readingGoal?: {
    target: number
    current: number
    progress: number
  }
}

// Import types
export interface ImportSource {
  type: 'goodreads' | 'csv' | 'manual'
  name: string
  data?: unknown
  file?: File
}

export interface ImportResult {
  success: number
  failed: number
  errors: string[]
  books: BookWithDetails[]
}

// Re-export Prisma relation types
export type BookAuthor = {
  id: string
  bookId: string
  authorId: string
  role: string
  order: number
}

export type BookCategory = {
  id: string
  bookId: string
  category: string
}
