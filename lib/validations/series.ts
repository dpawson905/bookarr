import { z } from 'zod'

export const seriesFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().max(5000, 'Description is too long').optional(),
  authorId: z.string().min(1, 'Author is required'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
})

export const seriesSearchSchema = z.object({
  query: z.string().optional(),
  authorId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'bookCount', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type SeriesFormData = z.infer<typeof seriesFormSchema>
export type SeriesSearchParams = z.infer<typeof seriesSearchSchema>
