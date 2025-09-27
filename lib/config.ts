/**
 * Environment configuration with Docker-ready defaults
 * This ensures the app works both locally and in Docker without requiring .env files
 */

export const config = {
  // Server Configuration
  port: process.env.PORT || '2665',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/bookarr',
  
  // NextAuth Configuration
  nextAuth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:2665',
    secret: process.env.NEXTAUTH_SECRET || 'bookarr-default-secret-change-in-production',
  },
  
  // API Keys (optional - can be configured in app settings)
  apis: {
    googleBooks: process.env.GOOGLE_BOOKS_API_KEY || '',
    openLibrary: process.env.OPEN_LIBRARY_API_KEY || '',
  },
  
  // Download Clients (optional)
  downloadClients: {
    sabnzbd: {
      url: process.env.SABNZBD_URL || 'http://localhost:8080',
      apiKey: process.env.SABNZBD_API_KEY || '',
    },
    nzbget: {
      url: process.env.NZBGET_URL || 'http://localhost:6789',
      username: process.env.NZBGET_USERNAME || 'nzbget',
      password: process.env.NZBGET_PASSWORD || '',
    },
  },
  
  // NZB Indexers (optional)
  indexers: {
    nzbgeek: {
      apiKey: process.env.NZBGEEK_API_KEY || '',
    },
    nzbhydra: {
      url: process.env.NZBHYDRA_URL || 'http://localhost:5076',
      apiKey: process.env.NZBHYDRA_API_KEY || '',
    },
  },
  
  // File Management
  paths: {
    booksLibrary: process.env.BOOKS_LIBRARY_PATH || '/app/data/books',
    downloads: process.env.DOWNLOADS_PATH || '/app/data/downloads',
    temp: process.env.TEMP_PATH || '/tmp/bookarr',
  },
  
  // Application Settings
  app: {
    name: process.env.APP_NAME || 'Bookarr',
    version: process.env.APP_VERSION || '1.0.0',
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
    defaultTimezone: process.env.DEFAULT_TIMEZONE || 'UTC',
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days
  },
  
  // Features
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION === 'true',
    enableApiKeys: process.env.ENABLE_API_KEYS !== 'false', // Default enabled
    enableDownloads: process.env.ENABLE_DOWNLOADS !== 'false', // Default enabled
  },
} as const

// Validation function to check required environment variables
export function validateConfig() {
  const errors: string[] = []
  
  // Check for required variables in production
  if (config.nodeEnv === 'production') {
    if (config.nextAuth.secret === 'bookarr-default-secret-change-in-production') {
      errors.push('NEXTAUTH_SECRET must be set in production')
    }
    
    if (config.databaseUrl === 'mongodb://localhost:27017/bookarr') {
      errors.push('DATABASE_URL must be set in production')
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`)
  }
  
  return true
}

// Export individual configs for easier imports
export const {
  port,
  nodeEnv,
  databaseUrl,
  nextAuth,
  apis,
  downloadClients,
  indexers,
  paths,
  app,
  security,
  features,
} = config
