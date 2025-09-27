'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  User, 
  TrendingUp, 
  Plus,
  Search,
  Settings
} from 'lucide-react'

export default function Dashboard() {
  // Mock data - will be replaced with real data from API
  const stats = {
    totalBooks: 1247,
    readBooks: 342,
    unreadBooks: 905,
    readingBooks: 23,
    totalAuthors: 156,
    totalSeries: 89,
    recentBooks: [
      { id: '1', title: 'The Foundation', author: 'Isaac Asimov', status: 'READ', format: 'EPUB' },
      { id: '2', title: 'Dune', author: 'Frank Herbert', status: 'READING', format: 'EPUB' },
      { id: '3', title: '1984', author: 'George Orwell', status: 'UNREAD', format: 'PDF' },
    ],
    recentDownloads: [
      { id: '1', title: 'The Martian', author: 'Andy Weir', status: 'COMPLETED', progress: 100 },
      { id: '2', title: 'Project Hail Mary', author: 'Andy Weir', status: 'DOWNLOADING', progress: 67 },
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READ': return 'bg-green-100 text-green-800'
      case 'READING': return 'bg-blue-100 text-blue-800'
      case 'UNREAD': return 'bg-gray-100 text-gray-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'DOWNLOADING': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your library.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Search Books
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Read</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.readBooks}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.readBooks / stats.totalBooks) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Reading</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.readingBooks}</div>
            <p className="text-xs text-muted-foreground">
              Active reading sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAuthors}</div>
            <p className="text-xs text-muted-foreground">
              In your library
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Books</CardTitle>
            <CardDescription>
              Your latest book additions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {book.format}
                    </Badge>
                    <Badge className={getStatusColor(book.status)}>
                      {book.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download Queue</CardTitle>
            <CardDescription>
              Current and recent downloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentDownloads.map((download) => (
                <div key={download.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{download.title}</p>
                      <p className="text-sm text-muted-foreground">{download.author}</p>
                    </div>
                    <Badge className={getStatusColor(download.status)}>
                      {download.status}
                    </Badge>
                  </div>
                  {download.status === 'DOWNLOADING' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${download.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Search className="h-6 w-6" />
              Search Books
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Plus className="h-6 w-6" />
              Add Book
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <Settings className="h-6 w-6" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
