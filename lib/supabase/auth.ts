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
import type { AuthError, User } from '@supabase/supabase-js'

export interface AuthResult {
  user:  User | null
  error: AuthError | null
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
  return { user: data.user, error }
}

export async function signUp(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data.user, error }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}
