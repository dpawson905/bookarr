const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSetup() {
  try {
    console.log('🧹 Clearing database for setup test...')
    
    // Clear all users and related data
    await prisma.userPreferences.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Database cleared')
    console.log('🌐 Visit http://localhost:3002 to test the setup flow')
    console.log('📝 You should be redirected to /setup to create an admin account')
    
  } catch (error) {
    console.error('❌ Error clearing database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSetup()
