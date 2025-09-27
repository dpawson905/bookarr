import { z } from 'zod'

export const authorFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  sortName: z.string().max(200, 'Sort name is too long').optional(),
  biography: z.string().max(5000, 'Biography is too long').optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  nationality: z.string().max(100, 'Nationality is too long').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
})

export const authorSearchSchema = z.object({
  query: z.string().optional(),
  nationality: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'birthDate', 'bookCount']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type AuthorFormData = z.infer<typeof authorFormSchema>
export type AuthorSearchParams = z.infer<typeof authorSearchSchema>
