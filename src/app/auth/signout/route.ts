import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export function GET() {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
}

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Wire directly to the response so Set-Cookie headers are guaranteed
          // to be on this response — no staging through the cookies() abstraction.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Invalidates the session server-side and triggers setAll to clear sb-* cookies.
  await supabase.auth.signOut()

  // Belt-and-suspenders: explicitly delete all session cookies so the browser
  // evicts them even if signOut's internal setAll missed any.
  const isProd = process.env.NODE_ENV === 'production'
  const deleteOptions = {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
  }

  response.cookies.set('sp_access_token', '', deleteOptions)
  response.cookies.set('sp_refresh_token', '', deleteOptions)
  request.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-')) {
      response.cookies.set(name, '', deleteOptions)
    }
  })

  return response
}
