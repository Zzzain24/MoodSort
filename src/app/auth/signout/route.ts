import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const { origin } = new URL(request.url)
  const response = NextResponse.redirect(`${origin}/`, { status: 303 })

  // Explicitly delete all sb-* cookies on the redirect response so they are
  // cleared in the browser regardless of how the server client writes them.
  const cookieStore = await cookies()
  cookieStore.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-')) {
      response.cookies.set(name, '', { maxAge: 0, path: '/' })
    }
  })

  return response
}
