'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSettingsStore, useApiKeys } from '@/stores/useSettingsStore'
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'

export default function ApiKeysSettings() {
  const { updateApiKeys, setLoading, setError, isLoading, error } = useSettingsStore()
  const apiKeys = useApiKeys()
  
  const [googleBooksKey, setGoogleBooksKey] = useState(apiKeys.googleBooksApiKey || '')
  const [openLibraryKey, setOpenLibraryKey] = useState(apiKeys.openLibraryApiKey || '')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [openLibraryStatus, setOpenLibraryStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
  const [testResults, setTestResults] = useState<{
    googleBooks: { status: 'idle' | 'testing' | 'success' | 'error'; message: string }
    openLibrary: { status: 'idle' | 'testing' | 'success' | 'error'; message: string }
  }>({
    googleBooks: { status: 'idle', message: '' },
    openLibrary: { status: 'idle', message: '' }
  })

  // Check Open Library API availability
  const checkOpenLibraryStatus = async () => {
    try {
      setOpenLibraryStatus('checking')
      const response = await fetch(
        'https://openlibrary.org/api/books?bibkeys=ISBN:9780385533225&format=json&jscmd=data',
        { 
          method: 'HEAD', // Just check if the endpoint is reachable
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      )
      
      if (response.ok) {
        setOpenLibraryStatus('available')
      } else {
        setOpenLibraryStatus('unavailable')
      }
    } catch (error) {
      console.warn('Open Library API check failed:', error)
      setOpenLibraryStatus('unavailable')
    }
  }

  // Update local state when store changes
  useEffect(() => {
    setGoogleBooksKey(apiKeys.googleBooksApiKey || '')
    setOpenLibraryKey(apiKeys.openLibraryApiKey || '')
    setHasUnsavedChanges(false)
  }, [apiKeys])

  // Check Open Library status on component mount
  useEffect(() => {
    checkOpenLibraryStatus()
  }, [])

  // Track changes to detect unsaved modifications
  const handleGoogleBooksKeyChange = (value: string) => {
    setGoogleBooksKey(value)
    setHasUnsavedChanges(true)
  }

  const handleOpenLibraryKeyChange = (value: string) => {
    setOpenLibraryKey(value)
    setHasUnsavedChanges(true)
  }

  const testApiKey = async (service: 'google-books' | 'open-library', apiKey: string) => {
    if (!apiKey.trim()) {
      setTestResults(prev => ({
        ...prev,
        [service === 'google-books' ? 'googleBooks' : 'openLibrary']: {
          status: 'error',
          message: 'Please enter an API key first'
        }
      }))
      return
    }

    setTestResults(prev => ({
      ...prev,
      [service === 'google-books' ? 'googleBooks' : 'openLibrary']: {
        status: 'testing',
        message: 'Testing connection...'
      }
    }))

    try {
      const response = await fetch('/api/settings/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, service })
      })

      const result = await response.json()

      setTestResults(prev => ({
        ...prev,
        [service === 'google-books' ? 'googleBooks' : 'openLibrary']: {
          status: result.isValid ? 'success' : 'error',
          message: result.message
        }
      }))
    } catch {
      setTestResults(prev => ({
        ...prev,
        [service === 'google-books' ? 'googleBooks' : 'openLibrary']: {
          status: 'error',
          message: 'Failed to test API key'
        }
      }))
    }
  }

  const saveApiKeys = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleBooksApiKey: googleBooksKey,
          openLibraryApiKey: openLibraryKey
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save API keys')
      }

      await response.json()
      updateApiKeys({
        googleBooksApiKey: googleBooksKey,
        openLibraryApiKey: openLibraryKey
      })

      // Clear unsaved changes flag
      setHasUnsavedChanges(false)

      // Show success message
      setTestResults(prev => ({
        ...prev,
        googleBooks: { status: 'success', message: 'API keys saved successfully!' },
        openLibrary: { status: 'success', message: 'API keys saved successfully!' }
      }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save API keys')
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = () => {
    setGoogleBooksKey('')
    setOpenLibraryKey('')
    setHasUnsavedChanges(false)
    setTestResults({
      googleBooks: { status: 'idle', message: '' },
      openLibrary: { status: 'idle', message: '' }
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Configure API keys for external services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Books API */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Google Books API</h3>
                <p className="text-sm text-muted-foreground">
                  Required for book metadata and cover images
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  apiKeys.googleBooksApiKey && !hasUnsavedChanges ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-muted-foreground">
                  {apiKeys.googleBooksApiKey && !hasUnsavedChanges ? 'Configured' : 'Not configured'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="google-books-key">API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="google-books-key" 
                  type="password" 
                  placeholder="Enter your Google Books API key"
                  value={googleBooksKey}
                  onChange={(e) => handleGoogleBooksKeyChange(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testApiKey('google-books', googleBooksKey)}
                  disabled={testResults.googleBooks.status === 'testing'}
                >
                  {testResults.googleBooks.status === 'testing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
              
              {testResults.googleBooks.message && (
                <div className={`flex items-center gap-2 text-sm ${getStatusColor(testResults.googleBooks.status)}`}>
                  {getStatusIcon(testResults.googleBooks.status)}
                  <span>{testResults.googleBooks.message}</span>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Get your API key from the{' '}
                <a 
                  href="https://console.cloud.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Google Cloud Console
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Open Library API */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Open Library API</h3>
                <p className="text-sm text-muted-foreground">
                  Free fallback source for book metadata (no key required)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  openLibraryStatus === 'checking' 
                    ? 'bg-yellow-500 animate-pulse' 
                    : openLibraryStatus === 'available' 
                    ? (apiKeys.openLibraryApiKey && !hasUnsavedChanges ? 'bg-green-500' : 'bg-blue-500')
                    : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-muted-foreground">
                  {openLibraryStatus === 'checking' 
                    ? 'Checking...' 
                    : openLibraryStatus === 'available' 
                    ? (apiKeys.openLibraryApiKey && !hasUnsavedChanges ? 'Configured' : 'Available')
                    : 'Unavailable'
                  }
                </span>
                {openLibraryStatus !== 'checking' && (
                  <button
                    onClick={checkOpenLibraryStatus}
                    className="text-xs text-blue-500 hover:text-blue-700 underline"
                  >
                    {openLibraryStatus === 'unavailable' ? 'Retry' : 'Refresh'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="open-library-key">API Key (Optional)</Label>
              <div className="flex gap-2">
                <Input 
                  id="open-library-key" 
                  type="password" 
                  placeholder="Enter your Open Library API key (optional)"
                  value={openLibraryKey}
                  onChange={(e) => handleOpenLibraryKeyChange(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testApiKey('open-library', openLibraryKey)}
                  disabled={testResults.openLibrary.status === 'testing'}
                >
                  {testResults.openLibrary.status === 'testing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
              
              {testResults.openLibrary.message && (
                <div className={`flex items-center gap-2 text-sm ${getStatusColor(testResults.openLibrary.status)}`}>
                  {getStatusIcon(testResults.openLibrary.status)}
                  <span>{testResults.openLibrary.message}</span>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                {openLibraryStatus === 'available' 
                  ? 'Open Library is free and doesn\'t require an API key, but you can get one for higher rate limits'
                  : openLibraryStatus === 'unavailable'
                  ? 'Open Library API is currently unavailable. You can still add an API key for when it comes back online.'
                  : 'Checking Open Library API availability...'
                }
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={saveApiKeys}
              disabled={isLoading || !hasUnsavedChanges}
              variant={hasUnsavedChanges ? "default" : "outline"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                'Save API Keys'
              ) : (
                'No Changes to Save'
              )}
            </Button>
            <Button variant="outline" onClick={resetToDefaults} disabled={!hasUnsavedChanges}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
