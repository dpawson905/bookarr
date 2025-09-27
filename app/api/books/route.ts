import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookSearchSchema } from '@/lib/validations/book'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    // Validate search parameters
    const validatedParams = bookSearchSchema.parse({
      query: params.query,
      author: params.author,
      isbn: params.isbn,
      format: params.format,
      status: params.status,
      series: params.series,
      category: params.category,
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 20,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    })

    const { page, limit, sortBy, sortOrder, ...filters } = validatedParams
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { subtitle: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { authors: { some: { author: { name: { contains: filters.query, mode: 'insensitive' } } } } }
      ]
    }

    if (filters.author) {
      where.authors = { some: { author: { name: { contains: filters.author, mode: 'insensitive' } } } }
    }

    if (filters.isbn) {
      where.OR = [
        { isbn: { contains: filters.isbn } },
        { isbn13: { contains: filters.isbn } }
      ]
    }

    if (filters.format) {
      where.format = filters.format
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.series) {
      where.series = { name: { contains: filters.series, mode: 'insensitive' } }
    }

    if (filters.category) {
      where.categories = { some: { category: { contains: filters.category, mode: 'insensitive' } } }
    }

    // Build orderBy clause
    let orderBy: Record<string, unknown> = {}
    switch (sortBy) {
      case 'title':
        orderBy = { title: sortOrder }
        break
      case 'author':
        orderBy = { authors: { _count: sortOrder } }
        break
      case 'dateAdded':
        orderBy = { dateAdded: sortOrder }
        break
      case 'publishedAt':
        orderBy = { publishedAt: sortOrder }
        break
      case 'rating':
        orderBy = { personalRating: sortOrder }
        break
      default:
        orderBy = { dateAdded: 'desc' }
    }

    // Get books with relations
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          authors: {
            include: {
              author: true
            }
          },
          series: true,
          downloads: true,
          categories: true
        }
      }),
      prisma.book.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      books,
      total,
      page,
      limit,
      totalPages,
      hasMore
    })

  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create book with authors
    const book = await prisma.book.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        isbn: body.isbn,
        isbn13: body.isbn13,
        language: body.language || 'en',
        pageCount: body.pageCount,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        userId: body.userId, // This should come from auth
        authors: {
          create: body.authors?.map((authorId: string, index: number) => ({
            authorId,
            order: index,
            role: 'author'
          })) || []
        },
        categories: {
          create: body.categories?.map((category: string) => ({
            category
          })) || []
        },
        seriesId: body.seriesId,
        seriesOrder: body.seriesOrder
      },
      include: {
        authors: {
          include: {
            author: true
          }
        },
        series: true,
        categories: true
      }
    })

    return NextResponse.json(book, { status: 201 })

  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}
