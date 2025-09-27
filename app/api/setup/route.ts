import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Initialize database if it doesn't exist
async function ensureDatabaseExists() {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    // Try to connect to the database
    await prisma.$connect()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

const setupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// POST /api/setup - Create initial admin user
export async function POST(request: NextRequest) {
  try {
    // Check if any users already exist
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'Setup is only available when no users exist' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, username, password } = setupSchema.parse(body)

    // Check if username already exists (extra safety check)
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: 'ADMIN', // First user is always admin
      }
    })

    // Create default user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        defaultFormat: 'epub',
        autoDownload: false,
        defaultCategory: 'books',
        emailNotifications: true,
        downloadComplete: true,
        newBookAvailable: false,
      }
    })

    // Return success (don't return user data for security)
    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully' 
    })

  } catch (error) {
    console.error('Setup error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: `Failed to create admin account: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET /api/setup - Check if setup is needed
export async function GET() {
  try {
    // Ensure database exists first
    const dbExists = await ensureDatabaseExists()
    if (!dbExists) {
      return NextResponse.json({ 
        setupRequired: true,
        userCount: 0,
        error: 'Database not available'
      })
    }

    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      setupRequired: userCount === 0,
      userCount 
    })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      { 
        setupRequired: true,
        userCount: 0,
        error: 'Failed to check setup status'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
