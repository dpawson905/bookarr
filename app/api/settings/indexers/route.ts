import { isAuthenticatedSession } from "@/types/session"
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { indexerSettingsSchema } from '@/lib/validations/settings'

const prisma = new PrismaClient()

// GET /api/settings/indexers - Get all indexers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!isAuthenticatedSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const indexers = await prisma.indexer.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ indexers })
  } catch (error) {
    console.error('Error fetching indexers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch indexers' },
      { status: 500 }
    )
  }
}

// POST /api/settings/indexers - Create new indexer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!isAuthenticatedSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the indexer settings
    const validatedIndexer = indexerSettingsSchema.parse(body)

    // Create new indexer
    const indexer = await prisma.indexer.create({
      data: {
        name: validatedIndexer.name,
        type: validatedIndexer.type,
        url: validatedIndexer.url,
        apiKey: validatedIndexer.apiKey || null,
        username: validatedIndexer.username || null,
        password: validatedIndexer.password || null,
        isActive: validatedIndexer.isActive,
        requestsPerMinute: validatedIndexer.requestsPerMinute || 60,
        requestsPerDay: validatedIndexer.requestsPerDay || 1000,
        searchEnabled: validatedIndexer.searchEnabled !== false,
        bookSearchEnabled: validatedIndexer.bookSearchEnabled !== false,
      }
    })

    return NextResponse.json({ 
      message: 'Indexer created successfully',
      indexer
    })
  } catch (error) {
    console.error('Error creating indexer:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid indexer settings', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create indexer' },
      { status: 500 }
    )
  }
}
