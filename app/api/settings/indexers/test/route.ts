import { isAuthenticatedSession } from "@/types/session"
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { indexerSettingsSchema } from '@/lib/validations/settings'

// POST /api/settings/indexers/test - Test indexer connection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!isAuthenticatedSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the indexer settings
    const validatedIndexer = indexerSettingsSchema.parse(body)

    let isValid = false
    let message = ''
    let details: {
      server?: string
      version?: string
      bookSearch?: boolean
    } = {}

    try {
      if (validatedIndexer.type === 'nzbgeek') {
        // Test NZBGeek API
        const response = await fetch(
          `${validatedIndexer.url}/api?t=caps&apikey=${validatedIndexer.apiKey}`,
          {
            method: 'GET',
            headers: {
              'User-Agent': 'Bookarr/1.0',
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          isValid = true
          message = 'NZBGeek connection successful'
          details = {
            server: data.server?.title || 'NZBGeek',
            version: data.server?.version || 'Unknown',
            bookSearch: data.caps?.searching?.search?.['book-search']?.supported || false
          }
        } else {
          const errorData = await response.json()
          message = `NZBGeek API error: ${errorData.error || 'Invalid API key or URL'}`
        }
      } else if (validatedIndexer.type === 'nzbhydra') {
        // Test NZBHydra2 API
        const response = await fetch(
          `${validatedIndexer.url}/api/v2.0/capabilities`,
          {
            method: 'GET',
            headers: {
              'X-API-Key': validatedIndexer.apiKey || '',
              'User-Agent': 'Bookarr/1.0',
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          isValid = true
          message = 'NZBHydra2 connection successful'
          details = {
            server: 'NZBHydra2',
            version: data.version || 'Unknown',
            bookSearch: data.searching?.book?.supported || false
          }
        } else {
          const errorData = await response.json()
          message = `NZBHydra2 API error: ${errorData.message || 'Invalid API key or URL'}`
        }
      } else if (validatedIndexer.type === 'newznab') {
        // Test Newznab API
        const response = await fetch(
          `${validatedIndexer.url}/api?t=caps&apikey=${validatedIndexer.apiKey}`,
          {
            method: 'GET',
            headers: {
              'User-Agent': 'Bookarr/1.0',
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          isValid = true
          message = 'Newznab connection successful'
          details = {
            server: data.server?.title || 'Newznab',
            version: data.server?.version || 'Unknown',
            bookSearch: data.caps?.searching?.search?.['book-search']?.supported || false
          }
        } else {
          const errorData = await response.json()
          message = `Newznab API error: ${errorData.error || 'Invalid API key or URL'}`
        }
      } else if (validatedIndexer.type === 'custom') {
        // Test custom indexer (basic connectivity test)
        const response = await fetch(
          `${validatedIndexer.url}/api?t=caps&apikey=${validatedIndexer.apiKey}`,
          {
            method: 'GET',
            headers: {
              'User-Agent': 'Bookarr/1.0',
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          isValid = true
          message = 'Custom indexer connection successful'
          details = {
            server: data.server?.title || 'Custom Indexer',
            version: data.server?.version || 'Unknown',
            bookSearch: data.caps?.searching?.search?.['book-search']?.supported || false
          }
        } else {
          message = `Custom indexer error: ${response.status} ${response.statusText}`
        }
      } else {
        return NextResponse.json(
          { error: 'Unknown indexer type' },
          { status: 400 }
        )
      }
    } catch (error) {
      message = `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return NextResponse.json({
      isValid,
      message,
      details
    })
  } catch (error) {
    console.error('Error testing indexer:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid indexer settings', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to test indexer' },
      { status: 500 }
    )
  }
}
