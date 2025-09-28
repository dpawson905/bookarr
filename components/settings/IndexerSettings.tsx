'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react'
import type { IndexerSettings } from '@/lib/validations/settings'

interface Indexer extends IndexerSettings {
  id: string
  createdAt: string
  updatedAt: string
  lastRequestAt?: string
}

interface TestResult {
  isValid: boolean
  message: string
  details?: {
    server?: string
    version?: string
    bookSearch?: boolean
  }
}

export default function IndexerSettings() {
  const [indexers, setIndexers] = useState<Indexer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  
  // Form state
  const [editingIndexer, setEditingIndexer] = useState<Indexer | null>(null)
  const [formData, setFormData] = useState<Partial<IndexerSettings>>({
    name: '',
    type: 'nzbgeek',
    url: '',
    apiKey: '',
    username: '',
    password: '',
    isActive: true,
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    searchEnabled: true,
    bookSearchEnabled: true,
  })

  // Load indexers on mount
  useEffect(() => {
    loadIndexers()
  }, [])

  const loadIndexers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/indexers', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to load indexers')
      
      const data = await response.json()
      setIndexers(data.indexers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load indexers')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (indexer: Indexer) => {
    try {
      setTesting(indexer.id)
      setError(null)
      
      const response = await fetch('/api/settings/indexers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(indexer)
      })
      
      if (!response.ok) throw new Error('Test failed')
      
      const result = await response.json()
      setTestResults(prev => ({
        ...prev,
        [indexer.id]: result
      }))
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [indexer.id]: {
          isValid: false,
          message: err instanceof Error ? err.message : 'Test failed'
        }
      }))
    } finally {
      setTesting(null)
    }
  }

  const saveIndexer = async () => {
    try {
      setError(null)
      
      const url = editingIndexer 
        ? `/api/settings/indexers/${editingIndexer.id}`
        : '/api/settings/indexers'
      
      const method = editingIndexer ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save indexer')
      }
      
      await loadIndexers()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save indexer')
    }
  }

  const deleteIndexer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this indexer?')) return
    
    try {
      setError(null)
      
      const response = await fetch(`/api/settings/indexers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to delete indexer')
      
      await loadIndexers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete indexer')
    }
  }

  const resetForm = () => {
    setEditingIndexer(null)
    setFormData({
      name: '',
      type: 'nzbgeek',
      url: '',
      apiKey: '',
      username: '',
      password: '',
      isActive: true,
      requestsPerMinute: 60,
      requestsPerDay: 1000,
      searchEnabled: true,
      bookSearchEnabled: true,
    })
  }

  const editIndexer = (indexer: Indexer) => {
    setEditingIndexer(indexer)
    setFormData({
      name: indexer.name,
      type: indexer.type,
      url: indexer.url,
      apiKey: indexer.apiKey || '',
      username: indexer.username || '',
      password: indexer.password || '',
      isActive: indexer.isActive,
      requestsPerMinute: indexer.requestsPerMinute,
      requestsPerDay: indexer.requestsPerDay,
      searchEnabled: indexer.searchEnabled,
      bookSearchEnabled: indexer.bookSearchEnabled,
    })
  }

  const getStatusIcon = (indexer: Indexer) => {
    if (!indexer.isActive) return <WifiOff className="h-4 w-4 text-gray-400" />
    if (testResults[indexer.id]?.isValid) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (testResults[indexer.id]?.isValid === false) return <XCircle className="h-4 w-4 text-red-500" />
    return <Wifi className="h-4 w-4 text-gray-400" />
  }

  const getStatusColor = (indexer: Indexer) => {
    if (!indexer.isActive) return 'bg-gray-100 text-gray-800'
    if (testResults[indexer.id]?.isValid) return 'bg-green-100 text-green-800'
    if (testResults[indexer.id]?.isValid === false) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading indexers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndexer ? 'Edit Indexer' : 'Add New Indexer'}
          </CardTitle>
          <CardDescription>
            Configure your NZB indexers for book searches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="indexer-name">Indexer Name</Label>
              <Input
                id="indexer-name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="NZBGeek"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indexer-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'nzbgeek' | 'nzbhydra' | 'newznab' | 'custom') => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nzbgeek">NZBGeek</SelectItem>
                  <SelectItem value="nzbhydra">NZBHydra2</SelectItem>
                  <SelectItem value="newznab">Newznab</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="indexer-url">URL</Label>
              <Input
                id="indexer-url"
                value={formData.url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://api.nzbgeek.info"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indexer-api-key">API Key</Label>
              <Input
                id="indexer-api-key"
                type="password"
                value={formData.apiKey || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Your API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indexer-username">Username (Optional)</Label>
              <Input
                id="indexer-username"
                value={formData.username || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indexer-password">Password (Optional)</Label>
              <Input
                id="indexer-password"
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requests-per-minute">Requests per Minute</Label>
              <Input
                id="requests-per-minute"
                type="number"
                min="1"
                max="1000"
                value={formData.requestsPerMinute || 60}
                onChange={(e) => setFormData(prev => ({ ...prev, requestsPerMinute: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requests-per-day">Requests per Day</Label>
              <Input
                id="requests-per-day"
                type="number"
                min="1"
                max="10000"
                value={formData.requestsPerDay || 1000}
                onChange={(e) => setFormData(prev => ({ ...prev, requestsPerDay: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="indexer-enabled"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="indexer-enabled">Enable this indexer</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="search-enabled"
                checked={formData.searchEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, searchEnabled: checked }))}
              />
              <Label htmlFor="search-enabled">Enable search</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="book-search-enabled"
                checked={formData.bookSearchEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bookSearchEnabled: checked }))}
              />
              <Label htmlFor="book-search-enabled">Enable book search</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveIndexer}>
              {editingIndexer ? 'Update Indexer' : 'Add Indexer'}
            </Button>
            {editingIndexer && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Indexers */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Indexers</CardTitle>
          <CardDescription>
            Manage your existing NZB indexers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {indexers.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No indexers configured</h3>
              <p className="text-muted-foreground mb-4">
                Add your first indexer to start searching for books
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {indexers.map((indexer) => (
                <div key={indexer.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(indexer)}
                      <div>
                        <h3 className="font-semibold">{indexer.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {indexer.type.toUpperCase()} • {indexer.url}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(indexer)}>
                        {indexer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(indexer)}
                        disabled={testing === indexer.id}
                      >
                        {testing === indexer.id ? (
                          <Clock className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <TestTube className="h-3 w-3 mr-1" />
                        )}
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editIndexer(indexer)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteIndexer(indexer.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {testResults[indexer.id] && (
                    <div className="text-sm">
                      <div className={`flex items-center gap-1 ${
                        testResults[indexer.id].isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResults[indexer.id].isValid ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{testResults[indexer.id].message}</span>
                      </div>
                      {testResults[indexer.id].details && (
                        <div className="mt-1 text-muted-foreground">
                          {testResults[indexer.id].details?.server && (
                            <span>Server: {testResults[indexer.id].details?.server}</span>
                          )}
                          {testResults[indexer.id].details?.version && (
                            <span className="ml-2">Version: {testResults[indexer.id].details?.version}</span>
                          )}
                          {testResults[indexer.id].details?.bookSearch !== undefined && (
                            <span className="ml-2">
                              Book Search: {testResults[indexer.id].details?.bookSearch ? 'Supported' : 'Not Supported'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
