import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { logger } from '@/lib/logger'

// SD1 backend URL - should be in environment variable
const SD1_API_URL = process.env.SD1_API_URL || 'http://localhost:8000'

// Proxy all requests to SD1 backend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Check authentication
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Construct the path
    const path = params.path.join('/')
    const url = `${SD1_API_URL}/api/${path}`

    // Log the request
    logger.info('SD1 API proxy request', undefined, {
      method,
      path,
      userId: user.id,
      component: 'SD1Proxy'
    })

    // Prepare headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('X-User-Id', user.id)
    headers.set('X-User-Email', user.emailAddresses[0]?.emailAddress || '')
    headers.set('X-User-Role', user.unsafeMetadata?.role as string || 'team_member')

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    }

    // Handle body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      const contentType = request.headers.get('content-type')
      
      if (contentType?.includes('multipart/form-data')) {
        // Handle file uploads
        const formData = await request.formData()
        headers.delete('Content-Type') // Let fetch set the boundary
        options.body = formData
      } else {
        // Handle JSON
        try {
          const body = await request.json()
          options.body = JSON.stringify(body)
        } catch {
          // If not JSON, get raw body
          options.body = await request.text()
        }
      }
    }

    // Make the request to SD1 backend
    const response = await fetch(url, options)

    // Get response data
    const responseData = await response.text()
    let parsedData
    try {
      parsedData = JSON.parse(responseData)
    } catch {
      parsedData = responseData
    }

    // Return the response
    return NextResponse.json(
      parsedData,
      { 
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json'
        }
      }
    )

  } catch (error) {
    logger.error('SD1 API proxy error', error instanceof Error ? error : undefined, {
      method,
      path: params.path.join('/'),
      component: 'SD1Proxy'
    })

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}