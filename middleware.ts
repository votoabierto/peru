import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (resets on redeploy — fine for Vercel)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000   // 1 minute window
const MAX_REQUESTS = 60    // 60 req/min per IP

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/v1/')) {
    return NextResponse.next()
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return addRateLimitHeaders(NextResponse.next(), MAX_REQUESTS - 1)
  }

  entry.count++
  if (entry.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 60 requests per minute.' },
      {
        status: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return addRateLimitHeaders(NextResponse.next(), MAX_REQUESTS - entry.count)
}

function addRateLimitHeaders(response: NextResponse, remaining: number): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS))
  response.headers.set('X-RateLimit-Remaining', String(Math.max(remaining, 0)))
  return response
}

export const config = {
  matcher: '/api/v1/:path*',
}
