import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./data/bookarr.db'
    }
  }
})

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    })

    if (!preferences) {
      // Return default settings if none exist
      const defaultSettings = {
        general: {
          appName: 'Bookarr',
          language: 'en',
          timezone: 'UTC',
          autoStart: false,
          minimizeToTray: false,
        },
        apiKeys: {
          googleBooksApiKey: '',
          openLibraryApiKey: '',
        },
        downloadClients: [],
        indexers: [],
        library: {
          libraryPath: '',
          downloadPath: '',
          namingScheme: '{Author} - {Title} ({Year})',
          folderScheme: 'author',
          autoOrganize: true,
          duplicateDetection: true,
          preferredFormats: ['epub', 'pdf'],
        },
        notifications: {
          emailNotifications: false,
          emailAddress: '',
          downloadComplete: true,
          downloadFailed: true,
          newBookAvailable: false,
        },
      }
      return NextResponse.json({ settings: defaultSettings })
    }

    // Convert preferences to settings format
    const settings = {
      general: {
        appName: 'Bookarr',
        language: preferences.language,
        timezone: preferences.timezone,
        autoStart: false,
        minimizeToTray: false,
      },
      apiKeys: {
        googleBooksApiKey: preferences.googleBooksApiKey || '',
        openLibraryApiKey: preferences.openLibraryApiKey || '',
      },
      downloadClients: [],
      indexers: [],
      library: {
        libraryPath: '',
        downloadPath: '',
        namingScheme: '{Author} - {Title} ({Year})',
        folderScheme: 'author',
        autoOrganize: preferences.autoDownload,
        duplicateDetection: true,
        preferredFormats: [preferences.defaultFormat, 'pdf'],
      },
      notifications: {
        emailNotifications: preferences.emailNotifications,
        emailAddress: '',
        downloadComplete: preferences.downloadComplete,
        downloadFailed: true,
        newBookAvailable: preferences.newBookAvailable,
      },
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update user preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        language: body.general?.language || 'en',
        timezone: body.general?.timezone || 'UTC',
        defaultFormat: body.library?.preferredFormats?.[0] || 'epub',
        autoDownload: body.library?.autoOrganize || false,
        emailNotifications: body.notifications?.emailNotifications || false,
        downloadComplete: body.notifications?.downloadComplete || true,
        newBookAvailable: body.notifications?.newBookAvailable || false,
        googleBooksApiKey: body.apiKeys?.googleBooksApiKey || '',
        openLibraryApiKey: body.apiKeys?.openLibraryApiKey || '',
      },
      create: {
        userId: session.user.id,
        language: body.general?.language || 'en',
        timezone: body.general?.timezone || 'UTC',
        defaultFormat: body.library?.preferredFormats?.[0] || 'epub',
        autoDownload: body.library?.autoOrganize || false,
        emailNotifications: body.notifications?.emailNotifications || false,
        downloadComplete: body.notifications?.downloadComplete || true,
        newBookAvailable: body.notifications?.newBookAvailable || false,
        googleBooksApiKey: body.apiKeys?.googleBooksApiKey || '',
        openLibraryApiKey: body.apiKeys?.openLibraryApiKey || '',
      }
    })

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      preferences
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
