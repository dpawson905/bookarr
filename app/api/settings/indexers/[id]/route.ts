import { isAuthenticatedSession } from "@/types/session"
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { indexerSettingsSchema } from '@/lib/validations/settings'

const prisma = new PrismaClient()

// GET /api/settings/indexers/[id] - Get specific indexer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!isAuthenticatedSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const indexer = await prisma.indexer.findUnique({
      where: { id }
    })

    if (!indexer) {
      return NextResponse.json(
        { error: 'Indexer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ indexer })
  } catch (error) {
    console.error('Error fetching indexer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch indexer' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/indexers/[id] - Update indexer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!isAuthenticatedSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate the indexer settings
    const validatedIndexer = indexerSettingsSchema.parse(body)

    // Check if indexer exists
    const existingIndexer = await prisma.indexer.findUnique({
      where: { id }
    })

    if (!existingIndexer) {
      return NextResponse.json(
        { error: 'Indexer not found' },
        { status: 404 }
      )
    }

    // Update indexer
    const indexer = await prisma.indexer.update({
      where: { id },
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
      message: 'Indexer updated successfully',
      indexer
    })
  } catch (error) {
    console.error('Error updating indexer:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid indexer settings', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update indexer' },
      { status: 500 }
    )
  }
}

// DELETE /api/settings/indexers/[id] - Delete indexer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!isAuthenticatedSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Check if indexer exists
    const existingIndexer = await prisma.indexer.findUnique({
      where: { id }
    })

    if (!existingIndexer) {
      return NextResponse.json(
        { error: 'Indexer not found' },
        { status: 404 }
      )
    }

    // Delete indexer
    await prisma.indexer.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Indexer deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting indexer:', error)
    return NextResponse.json(
      { error: 'Failed to delete indexer' },
      { status: 500 }
    )
  }
}
