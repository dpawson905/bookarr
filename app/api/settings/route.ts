import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    
    // Validate the settings data
    const validatedSettings = settingsSchema.parse(body)

    // Upsert settings (create or update)
    const settings = await prisma.settings.upsert({
      where: { userId: session.user.id },
      update: { 
        settings: validatedSettings,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        settings: validatedSettings
      }
    })

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: settings.settings as Settings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
