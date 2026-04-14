import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const SPOTIFY_TOKEN_COOKIE = 'sp_access_token'
const SPOTIFY_REFRESH_COOKIE = 'sp_refresh_token'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed, retryAfter } = rateLimit(`auth_callback:${ip}`, 10, 60_000)
  if (!allowed) {
    return new NextResponse('Too many requests', {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    })
  }

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/dashboard'
  // Only allow relative paths — block protocol-relative and external URLs
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/dashboard'

  if (code) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const redirectTo = isLocalEnv
      ? `${origin}${next}`
      : forwardedHost
        ? `https://${forwardedHost}${next}`
        : `${origin}${next}`

    const response = NextResponse.redirect(redirectTo)

    // Wire the Supabase client directly to the response so exchangeCodeForSession()
    // writes the session cookies onto the redirect response, not a separate object.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', error.code ?? 'unknown')
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }

    if (session) {
      const isProd = process.env.NODE_ENV === 'production'
      const baseOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax' as const,
        path: '/',
      }

      // Store the Spotify access token in its own cookie so server components
      // can read it reliably — provider_token is not guaranteed to survive
      // Supabase session serialization/deserialization.
      if (session.provider_token) {
        response.cookies.set(SPOTIFY_TOKEN_COOKIE, session.provider_token, {
          ...baseOptions,
          maxAge: 3600, // matches Spotify access token lifetime (1 hour)
        })
      }
      if (session.provider_refresh_token) {
        response.cookies.set(SPOTIFY_REFRESH_COOKIE, session.provider_refresh_token, {
          ...baseOptions,
          maxAge: 60 * 60 * 24 * 60, // 60 days
        })
      }

      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
