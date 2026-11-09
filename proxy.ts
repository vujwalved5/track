import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/db'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Use getUser() (not getSession()) per Condition 1 and Supabase security guidelines
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const redirectResponse = NextResponse.redirect(url)
    // Add Cache-Control: no-store per Condition 2
    redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return redirectResponse
  }

  // Set Cache-Control: no-store on book spread and desk responses per Condition 2
  supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

  return supabaseResponse
}

export const config = {
  matcher: ['/book/:path*', '/home', '/home/:path*'],
}
