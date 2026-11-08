/**
 * Auth helpers — email + password only (L11).
 * All functions use the browser client so they can be called from
 * Client Components and Server Actions alike.
 *
 * signIn  — sign in with email + password
 * signUp  — create account with email + password
 * signOut — invalidate the current session
 */
import { createClient } from './client'
import type { AuthError, Session, User } from '@supabase/supabase-js'
import { clearAllLocalCaches, setActiveUserId } from '@/lib/offlineSync'

export interface AuthResult {
  user:    User | null
  session: Session | null
  error:   AuthError | null
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (data?.user) {
    setActiveUserId(data.user.id)
  }
  return { user: data.user, session: data?.session ?? null, error }
}

export async function signUp(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (data?.user) {
    setActiveUserId(data.user.id)
  }
  return { user: data.user, session: data?.session ?? null, error }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  // Clear all caches on sign-out (Correction 2: Privacy / L11)
  await clearAllLocalCaches()
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}
