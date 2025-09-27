import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function initializeDatabase() {
  try {
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Check if database exists
    const dbPath = path.join(dataDir, 'bookarr.db')
    const dbExists = fs.existsSync(dbPath)

    if (!dbExists) {
      console.log('📊 Initializing database...')
      // Push the schema to create the database
      await prisma.$executeRaw`PRAGMA foreign_keys=ON`
      // The database will be created automatically when we first connect
      await prisma.$connect()
      console.log('✅ Database initialized successfully')
    } else {
      console.log('📊 Database already exists')
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
