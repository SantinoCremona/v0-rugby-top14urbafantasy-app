import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Lógica de protección para /torneos
  if (!user && request.nextUrl.pathname.startsWith('/torneos')) {
    const url = request.nextUrl.clone()
    const joinCode = url.searchParams.get('join')
    
    // Cambiamos el destino al login
    url.pathname = '/'
    
    // Si traía un código, lo mantenemos en la URL del login para que 
    // al terminar el login, Next sepa a dónde volver.
    if (joinCode) {
      url.searchParams.set('join', joinCode)
    }

    return NextResponse.redirect(url)
  }

  return response
}

// IMPORTANTE: Esto le dice a Next.js que solo corra el middleware en estas rutas
export const config = {
  matcher: ['/torneos/:path*'],
}
