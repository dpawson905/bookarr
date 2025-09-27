import { z } from 'zod'

export const apiKeySettingsSchema = z.object({
  googleBooksApiKey: z.string().min(1, 'Google Books API key is required').optional(),
  openLibraryApiKey: z.string().optional(),
})

export const downloadClientSettingsSchema = z.object({
  clientType: z.enum(['sabnzbd', 'nzbget']).default('sabnzbd'),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535, 'Port must be between 1 and 65535'),
  apiKey: z.string().min(1, 'API key is required'),
  username: z.string().optional(),
  password: z.string().optional(),
  category: z.string().default('books'),
  useSsl: z.boolean().default(false),
  enabled: z.boolean().default(true),
})

export const indexerSettingsSchema = z.object({
  name: z.string().min(1, 'Indexer name is required'),
  type: z.enum(['nzbgeek', 'nzbhydra', 'newznab', 'custom']),
  url: z.string().url('Invalid URL format'),
  apiKey: z.string().min(1, 'API key is required'),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(1).max(10).default(5),
})

export const librarySettingsSchema = z.object({
  libraryPath: z.string().min(1, 'Library path is required'),
  downloadPath: z.string().min(1, 'Download path is required'),
  namingScheme: z.string().default('{Author} - {Title} ({Year})'),
  folderScheme: z.enum(['author', 'series', 'flat']).default('author'),
  autoOrganize: z.boolean().default(true),
  duplicateDetection: z.boolean().default(true),
  preferredFormats: z.array(z.enum(['epub', 'pdf', 'mobi', 'azw3'])).default(['epub', 'pdf']),
})

export const generalSettingsSchema = z.object({
  appName: z.string().min(1, 'App name is required').default('Bookarr'),
  language: z.string().length(2).default('en'),
  timezone: z.string().default('UTC'),
  autoStart: z.boolean().default(false),
  minimizeToTray: z.boolean().default(false),
})

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(false),
  emailAddress: z.string().email('Invalid email address').optional(),
  downloadComplete: z.boolean().default(true),
  downloadFailed: z.boolean().default(true),
  newBookAvailable: z.boolean().default(false),
})

export const settingsSchema = z.object({
  general: generalSettingsSchema,
  apiKeys: apiKeySettingsSchema,
  downloadClients: z.array(downloadClientSettingsSchema).default([]),
  indexers: z.array(indexerSettingsSchema).default([]),
  library: librarySettingsSchema,
  notifications: notificationSettingsSchema,
})

export type ApiKeySettings = z.infer<typeof apiKeySettingsSchema>
export type DownloadClientSettings = z.infer<typeof downloadClientSettingsSchema>
export type IndexerSettings = z.infer<typeof indexerSettingsSchema>
export type LibrarySettings = z.infer<typeof librarySettingsSchema>
export type GeneralSettings = z.infer<typeof generalSettingsSchema>
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
export type Settings = z.infer<typeof settingsSchema>
