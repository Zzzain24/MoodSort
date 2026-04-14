import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SpotifyLoginButton from './SpotifyLoginButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In — MoodSort',
  description: 'Connect your Spotify account to start sorting your music by mood.',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main
      className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center px-6 py-16"
      style={{ fontFamily: 'var(--font-manrope)' }}
    >
      <div className="w-full max-w-sm bg-[#ECEAE4]/60 border border-black/[0.10] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-8 py-10 flex flex-col items-center gap-7">

        {/* Logo */}
        <a href="/" className="flex items-center gap-1">
          <span className="text-2xl font-bold tracking-tight text-[#121212]">Mood</span>
          <span className="text-2xl font-bold tracking-tight text-[#1DB954]">Sort</span>
        </a>

        {/* Heading */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-xl font-extrabold text-[#121212] leading-tight">
            Connect your Spotify
          </h1>
          <p className="text-sm text-black/50 leading-relaxed">
            MoodSort uses your Spotify library to build mood-based playlists. One click — no password needed.
          </p>
        </div>

        {/* CTA */}
        <SpotifyLoginButton />

        {/* Security note */}
        <p className="text-xs text-black/35 text-center leading-relaxed">
          Secure OAuth via Spotify. MoodSort only reads your liked songs and manages playlists it creates.
        </p>

        <div className="w-full h-px bg-black/[0.08]" />

        <a
          href="/"
          className="text-sm text-black/40 hover:text-black/70 transition-colors duration-200"
        >
          ← Back to home
        </a>
      </div>
    </main>
  )
}
