'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  User, 
  BookOpen,
  Plus,
  Grid,
  List
} from 'lucide-react'

interface AuthorWithBooks {
  id: string
  name: string
  sortName?: string
  biography?: string
  birthDate?: Date
  deathDate?: Date
  nationality?: string
  website?: string
  imageUrl?: string
  bookCount: number
  books: Array<{
    id: string
    title: string
    status: string
  }>
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<AuthorWithBooks[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data for now
  useEffect(() => {
    const mockAuthors: AuthorWithBooks[] = [
      {
        id: '1',
        name: 'Isaac Asimov',
        sortName: 'Asimov, Isaac',
        biography: 'American writer and professor of biochemistry at Boston University. He was known for his works of science fiction and popular science.',
        birthDate: new Date('1920-01-02'),
        deathDate: new Date('1992-04-06'),
        nationality: 'American',
        website: 'https://asimovonline.com',
        imageUrl: 'https://example.com/asimov.jpg',
        bookCount: 12,
        books: [
          { id: '1', title: 'The Foundation', status: 'READ' },
          { id: '2', title: 'I, Robot', status: 'READ' },
          { id: '3', title: 'The Caves of Steel', status: 'READING' }
        ]
      },
      {
        id: '2',
        name: 'Frank Herbert',
        sortName: 'Herbert, Frank',
        biography: 'American science fiction author best known for the 1965 novel Dune and its five sequels.',
        birthDate: new Date('1920-10-08'),
        deathDate: new Date('1986-02-11'),
        nationality: 'American',
        imageUrl: 'https://example.com/herbert.jpg',
        bookCount: 8,
        books: [
          { id: '4', title: 'Dune', status: 'READING' },
          { id: '5', title: 'Dune Messiah', status: 'UNREAD' }
        ]
      },
      {
        id: '3',
        name: 'George Orwell',
        sortName: 'Orwell, George',
        biography: 'English novelist, essayist, journalist, and critic. His work is characterised by lucid prose, biting social criticism, and opposition to totalitarianism.',
        birthDate: new Date('1903-06-25'),
        deathDate: new Date('1950-01-21'),
        nationality: 'British',
        imageUrl: 'https://example.com/orwell.jpg',
        bookCount: 5,
        books: [
          { id: '6', title: '1984', status: 'READ' },
          { id: '7', title: 'Animal Farm', status: 'READ' }
        ]
      }
    ]

    setAuthors(mockAuthors)
    setLoading(false)
  }, [])

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.nationality?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getAge = (birthDate: Date, deathDate?: Date) => {
    const endDate = deathDate || new Date()
    const age = endDate.getFullYear() - birthDate.getFullYear()
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading authors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Authors</h1>
          <p className="text-muted-foreground">
            Browse and manage authors in your library
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex border rounded-md">
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

      {/* Authors Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAuthors.map((author) => (
            <Card key={author.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={author.imageUrl} alt={author.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(author.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{author.name}</h3>
                    {author.nationality && (
                      <Badge variant="outline">{author.nationality}</Badge>
                    )}
                    {author.birthDate && (
                      <p className="text-sm text-muted-foreground">
                        {author.birthDate.getFullYear()}
                        {author.deathDate ? ` - ${author.deathDate.getFullYear()}` : ' - Present'}
                        {author.deathDate && (
                          <span className="ml-1">
                            (Age {getAge(author.birthDate, author.deathDate)})
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{author.bookCount} books</span>
                    </div>
                  </div>

                  {author.biography && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {author.biography}
                    </p>
                  )}

                  <div className="w-full space-y-2">
                    <h4 className="text-sm font-medium">Recent Books</h4>
                    <div className="space-y-1">
                      {author.books.slice(0, 3).map((book) => (
                        <div key={book.id} className="flex items-center justify-between text-xs">
                          <span className="truncate">{book.title}</span>
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {book.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAuthors.map((author) => (
            <Card key={author.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={author.imageUrl} alt={author.name} />
                    <AvatarFallback>
                      {getInitials(author.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{author.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {author.nationality && (
                        <Badge variant="outline" className="text-xs">
                          {author.nationality}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>{author.bookCount} books</span>
                      </div>
                    </div>
                    {author.birthDate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {author.birthDate.getFullYear()}
                        {author.deathDate ? ` - ${author.deathDate.getFullYear()}` : ' - Present'}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="space-y-1">
                      {author.books.slice(0, 2).map((book) => (
                        <div key={book.id} className="flex items-center gap-2">
                          <span className="text-sm truncate max-w-32">{book.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {book.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAuthors.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No authors found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Authors will appear here when you add books'}
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Author
          </Button>
        </div>
      )}
    </div>
  )
}
