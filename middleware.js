import { NextResponse } from 'next/server'

export function middleware(request) {
  // Only apply to image downloads
  if (request.nextUrl.pathname.startsWith('/category/')) {
    const response = NextResponse.next()
    
    // Get or create download count from cookie
    const downloads = parseInt(request.cookies.get('dl_count')?.value || '0')
    
    // Block if too many downloads (adjust this number as needed)
    if (downloads > 12 .toExponential) {
      return new NextResponse('Download limit exceeded. Please try again tomorrow.', {
        status: 429
      })
    }
    
    // Increment counter
    response.cookies.set('dl_count', (downloads + 1).toString(), {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // resets after 24 hours
    })
    
    return response
  }
}

export const config = {
  matcher: '/category/:path*'
}