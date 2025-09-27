'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  BookOpen,
  User,
  Calendar,
  Star
} from 'lucide-react'
import { BookWithDetails } from '@/types'

export default function BooksPage() {
  const [books, setBooks] = useState<BookWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for now
  useEffect(() => {
    const mockBooks: BookWithDetails[] = [
      {
        id: '1',
        title: 'The Foundation',
        subtitle: 'Foundation Series #1',
        description: 'A science fiction novel by Isaac Asimov',
        isbn: '0553293354',
        isbn13: '9780553293357',
        language: 'en',
        pageCount: 244,
        publishedAt: new Date('1951-05-01'),
        status: 'READ',
        readingProgress: 100,
        personalRating: 5,
        dateAdded: new Date('2024-01-15'),
        dateRead: new Date('2024-01-20'),
        userId: 'user1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        filePath: '/books/foundation.epub',
        fileName: 'foundation.epub',
        fileSize: 1024000,
        format: 'EPUB',
        quality: 'high',
        googleBooksId: 'foundation123',
        authors: [
          {
            id: '1',
            bookId: '1',
            authorId: '1',
            role: 'author',
            order: 0,
            author: {
              id: '1',
              name: 'Isaac Asimov',
              sortName: 'Asimov, Isaac',
              biography: 'American writer and professor of biochemistry',
              birthDate: new Date('1920-01-02'),
              deathDate: new Date('1992-04-06'),
              nationality: 'American',
              website: 'https://asimovonline.com',
              imageUrl: 'https://example.com/asimov.jpg',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
              googleBooksId: 'asimov123',
              openLibraryId: 'OL123456A',
              goodreadsId: '12345'
            }
          }
        ],
        series: {
          id: '1',
          name: 'Foundation Series',
          description: 'A series of science fiction novels',
          imageUrl: 'https://example.com/foundation-series.jpg',
          authorId: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        seriesId: '1',
        seriesOrder: 1,
        downloads: [],
        categories: [
          { id: '1', bookId: '1', category: 'Science Fiction' },
          { id: '2', bookId: '1', category: 'Fiction' }
        ]
      },
      {
        id: '2',
        title: 'Dune',
        subtitle: 'Dune Chronicles #1',
        description: 'A science fiction novel by Frank Herbert',
        isbn: '0441013597',
        isbn13: '9780441013593',
        language: 'en',
        pageCount: 688,
        publishedAt: new Date('1965-08-01'),
        status: 'READING',
        readingProgress: 45,
        personalRating: null,
        dateAdded: new Date('2024-01-10'),
        dateRead: null,
        userId: 'user1',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        filePath: '/books/dune.epub',
        fileName: 'dune.epub',
        fileSize: 2048000,
        format: 'EPUB',
        quality: 'high',
        googleBooksId: 'dune123',
        authors: [
          {
            id: '2',
            bookId: '2',
            authorId: '2',
            role: 'author',
            order: 0,
            author: {
              id: '2',
              name: 'Frank Herbert',
              sortName: 'Herbert, Frank',
              biography: 'American science fiction author',
              birthDate: new Date('1920-10-08'),
              deathDate: new Date('1986-02-11'),
              nationality: 'American',
              website: null,
              imageUrl: 'https://example.com/herbert.jpg',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
              googleBooksId: 'herbert123',
              openLibraryId: 'OL234567A',
              goodreadsId: '23456'
            }
          }
        ],
        series: {
          id: '2',
          name: 'Dune Chronicles',
          description: 'A series of science fiction novels',
          imageUrl: 'https://example.com/dune-series.jpg',
          authorId: '2',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        seriesId: '2',
        seriesOrder: 1,
        downloads: [],
        categories: [
          { id: '3', bookId: '2', category: 'Science Fiction' },
          { id: '4', bookId: '2', category: 'Fantasy' }
        ]
      }
    ]

    setBooks(mockBooks)
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READ': return 'bg-green-100 text-green-800'
      case 'READING': return 'bg-blue-100 text-blue-800'
      case 'UNREAD': return 'bg-gray-100 text-gray-800'
      case 'WANT_TO_READ': return 'bg-yellow-100 text-yellow-800'
      case 'DID_NOT_FINISH': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.authors.some(a => a.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground">
            Manage your book library
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search books, authors, or series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="flex-1 sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="UNREAD">Unread</SelectItem>
                <SelectItem value="READING">Reading</SelectItem>
                <SelectItem value="READ">Read</SelectItem>
                <SelectItem value="WANT_TO_READ">Want to Read</SelectItem>
                <SelectItem value="DID_NOT_FINISH">Did Not Finish</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1 sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="publishedAt">Published</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex border rounded-md self-start">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Books Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {book.authors.map(a => a.author.name).join(', ')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(book.status)}>
                      {book.status}
                    </Badge>
                    {book.format && (
                      <Badge variant="secondary" className="text-xs">
                        {book.format}
                      </Badge>
                    )}
                  </div>
                  {book.personalRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{book.personalRating}/5</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBooks.map((book) => (
            <Card key={book.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-muted flex items-center justify-center flex-shrink-0">
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {book.authors.map(a => a.author.name).join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(book.status)}>
                        {book.status}
                      </Badge>
                      {book.format && (
                        <Badge variant="secondary" className="text-xs">
                          {book.format}
                        </Badge>
                      )}
                      {book.series && (
                        <Badge variant="outline" className="text-xs">
                          {book.series.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {book.publishedAt?.getFullYear()}
                    </div>
                    {book.personalRating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{book.personalRating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first book'}
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      )}
    </div>
  )
}
