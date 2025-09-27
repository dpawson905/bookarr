import axios from 'axios'
import { GoogleBooksResponse, GoogleBookItem } from '@/types'

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1'

class GoogleBooksAPI {
  private apiKey: string
  private baseURL: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ''
    this.baseURL = GOOGLE_BOOKS_API_BASE
  }

  // Method to update API key from settings
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  // Method to check if API key is configured
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== ''
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string | number> = {}, referer?: string): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Google Books API key is not configured. Please set it in Settings > API Keys.')
    }

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          ...params,
          key: this.apiKey
        },
        headers: {
          'Referer': referer || 'https://bookarr.localhost',
          'User-Agent': 'Bookarr/1.0'
        }
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Google Books API error: ${error.response?.data?.error?.message || error.message}`)
      }
      throw error
    }
  }

  async searchBooks(query: string, options: {
    maxResults?: number
    startIndex?: number
    orderBy?: 'relevance' | 'newest'
    printType?: 'books' | 'magazines'
    filter?: 'ebooks' | 'free-ebooks' | 'paid-ebooks' | 'partial'
  } = {}, referer?: string): Promise<GoogleBooksResponse> {
    const {
      maxResults = 20,
      startIndex = 0,
      orderBy = 'relevance',
      printType = 'books',
      filter
    } = options

    const params: Record<string, string | number> = {
      q: query,
      maxResults,
      startIndex,
      orderBy,
      printType
    }

    if (filter) {
      params.filter = filter
    }

    return this.makeRequest<GoogleBooksResponse>('/volumes', params, referer)
  }

  async getBookById(bookId: string, referer?: string): Promise<GoogleBookItem> {
    return this.makeRequest<GoogleBookItem>(`/volumes/${bookId}`, {}, referer)
  }

  async searchByISBN(isbn: string, referer?: string): Promise<GoogleBooksResponse> {
    return this.searchBooks(`isbn:${isbn}`, {}, referer)
  }

  async searchByTitle(title: string, author?: string, referer?: string): Promise<GoogleBooksResponse> {
    let query = `intitle:"${title}"`
    if (author) {
      query += `+inauthor:"${author}"`
    }
    return this.searchBooks(query, {}, referer)
  }

  async searchByAuthor(author: string, referer?: string): Promise<GoogleBooksResponse> {
    return this.searchBooks(`inauthor:"${author}"`, {}, referer)
  }

  async getBookCover(bookId: string, size: 'small' | 'medium' | 'large' = 'medium'): Promise<string | null> {
    try {
      const book = await this.getBookById(bookId)
      const imageLinks = book.volumeInfo.imageLinks
      
      if (!imageLinks) return null

      switch (size) {
        case 'small':
          return imageLinks.smallThumbnail || imageLinks.thumbnail || null
        case 'medium':
          return imageLinks.medium || imageLinks.thumbnail || null
        case 'large':
          return imageLinks.large || imageLinks.extraLarge || imageLinks.medium || null
        default:
          return imageLinks.thumbnail || null
      }
    } catch (error) {
      console.error('Error getting book cover:', error)
      return null
    }
  }

  // Helper method to extract ISBN from industry identifiers
  extractISBN(book: GoogleBookItem): { isbn10?: string; isbn13?: string } {
    const identifiers = book.volumeInfo.industryIdentifiers || []
    const result: { isbn10?: string; isbn13?: string } = {}

    for (const identifier of identifiers) {
      if (identifier.type === 'ISBN_10') {
        result.isbn10 = identifier.identifier
      } else if (identifier.type === 'ISBN_13') {
        result.isbn13 = identifier.identifier
      }
    }

    return result
  }

  // Helper method to format book data for our database
  formatBookData(book: GoogleBookItem) {
    const isbn = this.extractISBN(book)
    const publishedDate = book.volumeInfo.publishedDate
      ? new Date(book.volumeInfo.publishedDate)
      : null

    return {
      googleBooksId: book.id,
      title: book.volumeInfo.title,
      subtitle: book.volumeInfo.subtitle,
      authors: book.volumeInfo.authors || [],
      description: book.volumeInfo.description,
      isbn: isbn.isbn10,
      isbn13: isbn.isbn13,
      language: book.volumeInfo.language || 'en',
      pageCount: book.volumeInfo.pageCount,
      publishedAt: publishedDate,
      categories: book.volumeInfo.categories || [],
      imageUrl: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail,
      publisher: book.volumeInfo.publisher
    }
  }
}

// Export singleton instance
export const googleBooksAPI = new GoogleBooksAPI()
export default GoogleBooksAPI
