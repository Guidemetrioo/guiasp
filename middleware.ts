import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const path = request.nextUrl.pathname

  if (!url || !key) {
    const hasMockSession = request.cookies.has('sb-mock-session')
    if (path.startsWith('/admin')) {
      if (path === '/admin/login') {
        if (hasMockSession) {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      } else {
        if (!hasMockSession) {
          return NextResponse.redirect(new URL('/admin/login', request.url))
        }
      }
    }
    return response
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      if (user) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } else {
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
