import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { googleBooksAPI } from '@/lib/apis/google-books'
import { Settings } from '@/lib/validations/settings'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's API key from preferences
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    })

    const apiKey = preferences?.googleBooksApiKey
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Books API key not configured. Please set it in Settings > API Keys.' },
        { status: 400 }
      )
    }

    // Update the API instance with the user's key
    googleBooksAPI.setApiKey(apiKey)
    
    // Get the referer from the request headers
    const referer = request.headers.get('origin') || 'https://bookarr.localhost'

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'books'
    const maxResults = parseInt(searchParams.get('maxResults') || '20')
    const startIndex = parseInt(searchParams.get('startIndex') || '0')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    let results

    switch (type) {
      case 'google-books':
        results = await googleBooksAPI.searchBooks(query, {
          maxResults,
          startIndex,
          printType: 'books',
          filter: 'ebooks'
        }, referer)
        break
      
      case 'isbn':
        results = await googleBooksAPI.searchByISBN(query, referer)
        break
      
      case 'title':
        const author = searchParams.get('author')
        results = await googleBooksAPI.searchByTitle(query, author || undefined, referer)
        break
      
      case 'author':
        results = await googleBooksAPI.searchByAuthor(query, referer)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid search type' },
          { status: 400 }
        )
    }

    // Format results for our application
    const formattedResults = {
      ...results,
      items: results.items?.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        subtitle: item.volumeInfo.subtitle,
        authors: item.volumeInfo.authors || [],
        description: item.volumeInfo.description,
        isbn: item.volumeInfo.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier,
        isbn13: item.volumeInfo.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier,
        language: item.volumeInfo.language || 'en',
        pageCount: item.volumeInfo.pageCount,
        publishedAt: item.volumeInfo.publishedDate,
        categories: item.volumeInfo.categories || [],
        imageUrl: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
        publisher: item.volumeInfo.publisher,
        googleBooksId: item.id
      })) || []
    }

    return NextResponse.json(formattedResults)

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
