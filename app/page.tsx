import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSetupStatus() {
  try {
    const userCount = await prisma.user.count()
    return userCount === 0
  } catch (error) {
    console.error('Error checking setup status:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

export default async function HomePage() {
  // Check if setup is required
  const setupRequired = await checkSetupStatus()
  
  if (setupRequired) {
    redirect('/setup')
  }
  
  // If setup is not required, redirect to signin
  redirect('/auth/signin')
}