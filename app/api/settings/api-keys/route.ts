import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { apiKeySettingsSchema } from '@/lib/validations/settings'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./data/bookarr.db'
    }
  }
})

// GET /api/settings/api-keys - Get API key settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    })

    const apiKeys = {
      googleBooksApiKey: preferences?.googleBooksApiKey || '',
      openLibraryApiKey: preferences?.openLibraryApiKey || '',
    }

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Error fetching API key settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API key settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/api-keys - Update API key settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the API key settings
    const validatedApiKeys = apiKeySettingsSchema.parse(body)

    // Upsert user preferences with API keys
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: { 
        googleBooksApiKey: validatedApiKeys.googleBooksApiKey,
        openLibraryApiKey: validatedApiKeys.openLibraryApiKey,
      },
      create: {
        userId: session.user.id,
        googleBooksApiKey: validatedApiKeys.googleBooksApiKey,
        openLibraryApiKey: validatedApiKeys.openLibraryApiKey,
      }
    })

    return NextResponse.json({ 
      message: 'API key settings updated successfully',
      apiKeys: {
        googleBooksApiKey: updatedPreferences.googleBooksApiKey || '',
        openLibraryApiKey: updatedPreferences.openLibraryApiKey || '',
      }
    })
  } catch (error) {
    console.error('Error updating API key settings:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid API key settings', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update API key settings' },
      { status: 500 }
    )
  }
}

