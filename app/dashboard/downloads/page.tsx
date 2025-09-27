'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  Pause, 
  Play, 
  X, 
  CheckCircle, 
  AlertCircle,
  Clock,
  HardDrive,
  Wifi,
  Settings
} from 'lucide-react'

interface DownloadItem {
  id: string
  title: string
  author: string
  status: 'PENDING' | 'DOWNLOADING' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'CANCELLED'
  progress: number
  speed?: string
  eta?: string
  size?: number
  downloaded?: number
  quality?: string
  format?: string
  clientType?: string
  error?: string
  createdAt: Date
  completedAt?: Date
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for now
  useEffect(() => {
    const mockDownloads: DownloadItem[] = [
      {
        id: '1',
        title: 'The Martian',
        author: 'Andy Weir',
        status: 'COMPLETED',
        progress: 100,
        size: 2048000,
        downloaded: 2048000,
        quality: 'high',
        format: 'EPUB',
        clientType: 'SABnzbd',
        createdAt: new Date('2024-01-20T10:00:00'),
        completedAt: new Date('2024-01-20T10:15:00')
      },
      {
        id: '2',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        status: 'DOWNLOADING',
        progress: 67,
        speed: '2.5 MB/s',
        eta: '5m 30s',
        size: 1800000,
        downloaded: 1206000,
        quality: 'high',
        format: 'EPUB',
        clientType: 'SABnzbd',
        createdAt: new Date('2024-01-25T14:30:00')
      },
      {
        id: '3',
        title: 'Dune Messiah',
        author: 'Frank Herbert',
        status: 'PAUSED',
        progress: 23,
        speed: '0 MB/s',
        eta: 'Paused',
        size: 1500000,
        downloaded: 345000,
        quality: 'medium',
        format: 'EPUB',
        clientType: 'NZBGet',
        createdAt: new Date('2024-01-24T09:15:00')
      },
      {
        id: '4',
        title: 'Foundation and Empire',
        author: 'Isaac Asimov',
        status: 'FAILED',
        progress: 0,
        error: 'Connection timeout',
        quality: 'high',
        format: 'EPUB',
        clientType: 'SABnzbd',
        createdAt: new Date('2024-01-23T16:45:00')
      }
    ]

    setDownloads(mockDownloads)
    setLoading(false)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'DOWNLOADING':
        return <Download className="h-4 w-4 text-blue-500" />
      case 'PAUSED':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'DOWNLOADING': return 'bg-blue-100 text-blue-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const activeDownloads = downloads.filter(d => d.status === 'DOWNLOADING' || d.status === 'PENDING')
  const completedDownloads = downloads.filter(d => d.status === 'COMPLETED')
  const failedDownloads = downloads.filter(d => d.status === 'FAILED')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading downloads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Downloads</h1>
          <p className="text-muted-foreground">
            Monitor and manage your download queue
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Add Download
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDownloads.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently downloading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDownloads.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully downloaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedDownloads.length}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Speed</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeDownloads.reduce((total, d) => {
                const speed = d.speed ? parseFloat(d.speed) : 0
                return total + speed
              }, 0).toFixed(1)} MB/s
            </div>
            <p className="text-xs text-muted-foreground">
              Combined download speed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Download Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Download Queue</CardTitle>
          <CardDescription>
            Current and recent downloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {downloads.map((download) => (
              <div key={download.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(download.status)}
                    <div>
                      <h3 className="font-semibold">{download.title}</h3>
                      <p className="text-sm text-muted-foreground">{download.author}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(download.status)}>
                      {download.status}
                    </Badge>
                    {download.quality && (
                      <Badge variant="outline" className="text-xs">
                        {download.quality}
                      </Badge>
                    )}
                    {download.format && (
                      <Badge variant="secondary" className="text-xs">
                        {download.format}
                      </Badge>
                    )}
                  </div>
                </div>

                {download.status === 'DOWNLOADING' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatFileSize(download.downloaded)} / {formatFileSize(download.size)}
                      </span>
                      <div className="flex items-center gap-4">
                        {download.speed && (
                          <span className="text-muted-foreground">
                            {download.speed}
                          </span>
                        )}
                        {download.eta && (
                          <span className="text-muted-foreground">
                            {download.eta} remaining
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={download.progress} className="h-2" />
                  </div>
                )}

                {download.status === 'FAILED' && download.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    Error: {download.error}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      <span>{download.clientType}</span>
                    </div>
                    <span>
                      Started {download.createdAt.toLocaleDateString()}
                    </span>
                    {download.completedAt && (
                      <span>
                        Completed {download.completedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {download.status === 'DOWNLOADING' && (
                      <Button variant="outline" size="sm">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    {download.status === 'PAUSED' && (
                      <Button variant="outline" size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                    )}
                    {(download.status === 'FAILED' || download.status === 'CANCELLED') && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {downloads.length === 0 && (
        <div className="text-center py-12">
          <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No downloads</h3>
          <p className="text-muted-foreground mb-4">
            Downloads will appear here when you add books to your queue
          </p>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Add Download
          </Button>
        </div>
      )}
    </div>
  )
}
