'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function clearSessionCookies() {
  const cookieStore = await cookies()
  cookieStore.set('sp_access_token', '', { maxAge: 0, path: '/' })
  cookieStore.set('sp_refresh_token', '', { maxAge: 0, path: '/' })
  cookieStore.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-')) {
      cookieStore.set(name, '', { maxAge: 0, path: '/' })
    }
  })
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  await clearSessionCookies()
  redirect('/')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Delete the auth user — requires service role key (admin client).
  // When tables with user data are added, cascade deletes should be handled
  // here before removing the auth record.
  const admin = createAdminClient()
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    throw new Error('Failed to delete account. Please try again.')
  }

  await clearSessionCookies()
  redirect('/')
}
