import { z } from 'zod'

export const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  subtitle: z.string().max(500, 'Subtitle is too long').optional(),
  authors: z.array(z.string().min(1, 'Author name is required')).min(1, 'At least one author is required'),
  isbn: z.string().regex(/^[\d-]+$/, 'Invalid ISBN format').optional().or(z.literal('')),
  description: z.string().max(5000, 'Description is too long').optional(),
  publishedAt: z.string().optional(),
  pageCount: z.number().int().min(1, 'Page count must be positive').optional(),
  language: z.string().length(2, 'Language must be a 2-letter code').optional(),
  categories: z.array(z.string()).optional(),
  seriesId: z.string().optional(),
  seriesOrder: z.number().int().min(1, 'Series order must be positive').optional(),
})

export const bookSearchSchema = z.object({
  query: z.string().optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  format: z.string().optional(),
  status: z.enum(['UNREAD', 'READING', 'READ', 'WANT_TO_READ', 'DID_NOT_FINISH']).optional(),
  series: z.string().optional(),
  category: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['title', 'author', 'dateAdded', 'publishedAt', 'rating']).default('dateAdded'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const bookUpdateSchema = z.object({
  status: z.enum(['UNREAD', 'READING', 'READ', 'WANT_TO_READ', 'DID_NOT_FINISH']).optional(),
  readingProgress: z.number().int().min(0).max(100).optional(),
  personalRating: z.number().int().min(1).max(5).optional(),
  dateRead: z.string().optional(),
})

export type BookFormData = z.infer<typeof bookFormSchema>
export type BookSearchParams = z.infer<typeof bookSearchSchema>
export type BookUpdateData = z.infer<typeof bookUpdateSchema>
