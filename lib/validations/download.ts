import { z } from 'zod'

export const downloadClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: z.enum(['sabnzbd', 'nzbget']),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535, 'Invalid port number'),
  username: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).max(100).default(0),
  maxConnections: z.number().int().min(1).max(50).default(4),
  maxSpeed: z.string().optional(),
  paused: z.boolean().default(false),
})

export const indexerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: z.enum(['nzbgeek', 'nzbhydra', 'newznab', 'custom']),
  url: z.string().url('Invalid URL'),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  isActive: z.boolean().default(true),
  requestsPerMinute: z.number().int().min(1).max(1000).default(60),
  requestsPerDay: z.number().int().min(1).max(10000).default(1000),
  searchEnabled: z.boolean().default(true),
  bookSearchEnabled: z.boolean().default(true),
})

export const qualityProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  isDefault: z.boolean().default(false),
  preferredFormats: z.array(z.string()).min(1, 'At least one format is required'),
  minFileSize: z.number().int().min(0).optional(),
  maxFileSize: z.number().int().min(0).optional(),
  minQuality: z.enum(['low', 'medium', 'high']).default('medium'),
  maxQuality: z.enum(['low', 'medium', 'high']).default('high'),
  preferredGroups: z.array(z.string()).default([]),
  rejectedGroups: z.array(z.string()).default([]),
})

export const downloadSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  format: z.string().optional(),
  quality: z.string().optional(),
  minSize: z.number().int().min(0).optional(),
  maxSize: z.number().int().min(0).optional(),
  maxAge: z.number().int().min(0).optional(), // days
  indexer: z.string().optional(),
})

export type DownloadClientFormData = z.infer<typeof downloadClientSchema>
export type IndexerFormData = z.infer<typeof indexerSchema>
export type QualityProfileFormData = z.infer<typeof qualityProfileSchema>
export type DownloadSearchParams = z.infer<typeof downloadSearchSchema>
