'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies()

  // Delete Spotify token cookies with explicit path=/ to match how they were set
  cookieStore.set('sp_access_token', '', { maxAge: 0, path: '/' })
  cookieStore.set('sp_refresh_token', '', { maxAge: 0, path: '/' })

  // Explicitly delete any remaining sb-* session cookies with path=/
  cookieStore.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-')) {
      cookieStore.set(name, '', { maxAge: 0, path: '/' })
    }
  })

  redirect('/')
}
