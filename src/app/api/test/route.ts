import { NextResponse } from 'next/server'
import { ApiRequest } from '@/types/auth'

export async function POST(request: Request) {
  const { apiUrl, walletAddress, verificationExpression, auth } = await request.json() as ApiRequest

  try {
    const headers: HeadersInit = {}

    // Apply authentication
    switch (auth.type) {
      case 'basic':
        headers['Authorization'] = `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`
        break
      case 'bearer':
        headers['Authorization'] = `Bearer ${auth.token}`
        break
      case 'apiKey':
        if (auth.inHeader && auth.headerKey) {
          headers[auth.headerKey] = auth.apiKey || ''
        }
        break
    }

    const url = auth.type === 'apiKey' && !auth.inHeader
      ? `${apiUrl}?walletAddress=${walletAddress}&${auth.headerKey}=${auth.apiKey}`
      : `${apiUrl}?walletAddress=${walletAddress}`

    const response = await fetch(url, { headers })
    const data = await response.json()

    // Safely evaluate the verification expression
    const verifyResponse = new Function('response', `
      try {
        ${verificationExpression}
      } catch (e) {
        return 0;
      }
    `)

    const isValid = verifyResponse(data)

    return NextResponse.json({
      success: true,
      data,
      isValid,
      status: isValid === 1 ? 'VALID ✅' : 'INVALID ❌'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
} 