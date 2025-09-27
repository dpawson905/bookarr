import { isAuthenticatedSession } from "@/types/session"
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// POST /api/settings/api-keys/test - Test API key connection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!isAuthenticatedSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { apiKey, service } = body

    if (!apiKey || !service) {
      return NextResponse.json(
        { error: 'API key and service are required' },
        { status: 400 }
      )
    }

    let isValid = false
    let message = ''

    try {
      if (service === 'google-books') {
        // Test Google Books API
        const referer = request.headers.get('origin') || 'https://bookarr.localhost'
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=test&key=${apiKey}&maxResults=1`,
          {
            headers: {
              'Referer': referer,
              'User-Agent': 'Bookarr/1.0'
            }
          }
        )
        
        if (response.ok) {
          isValid = true
          message = 'Google Books API key is valid'
        } else {
          const errorData = await response.json()
          message = `Google Books API error: ${errorData.error?.message || 'Invalid API key'}`
        }
      } else if (service === 'open-library') {
        // Test Open Library API (no key required, but we can test the connection)
        const response = await fetch(
          'https://openlibrary.org/api/books?bibkeys=ISBN:9780385533225&format=json&jscmd=data'
        )
        
        if (response.ok) {
          isValid = true
          message = 'Open Library API connection is working'
        } else {
          message = 'Open Library API connection failed'
        }
      } else {
        return NextResponse.json(
          { error: 'Unknown service' },
          { status: 400 }
        )
      }
    } catch (error) {
      message = `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return NextResponse.json({
      isValid,
      message
    })
  } catch (error) {
    console.error('Error testing API key:', error)
    return NextResponse.json(
      { error: 'Failed to test API key' },
      { status: 500 }
    )
  }
}
