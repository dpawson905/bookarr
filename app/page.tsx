import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Download, User, Settings, ArrowRight, LogIn } from 'lucide-react'
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