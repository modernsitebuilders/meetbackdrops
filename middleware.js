import { NextResponse } from 'next/server'

export function middleware(request) {
  // Only apply to image downloads
  if (request.nextUrl.pathname.startsWith('/category/')) {
    const response = NextResponse.next()
    
    // Check if user is banned
    const isBanned = request.cookies.get('user_banned')?.value === 'true'
    
    if (isBanned) {
      return new NextResponse('You have been banned from downloading due to excessive use. Please contact support if you believe this is an error.', {
        status: 403
      })
    }
    
    // Get daily download count
    const dailyDownloads = parseInt(request.cookies.get('dl_count_daily')?.value || '0')
    
    // Get weekly download count
    const weeklyDownloads = parseInt(request.cookies.get('dl_count_weekly')?.value || '0')
    
    // Check daily limit (5 per day)
    if (dailyDownloads >= 5) {
      return new NextResponse('Daily download limit of 5 reached. Please try again tomorrow.', {
        status: 429
      })
    }
    
    // Check if they're about to hit the weekly ban limit
    if (weeklyDownloads + 1 >= 30) {
      // Ban them for 90 days (you can change this number)
      response.cookies.set('user_banned', 'true', {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      })
      
      return new NextResponse('You have exceeded 30 downloads in a week and have been banned for 90 days. Please contact support if you believe this is an error.', {
        status: 403
      })
    }
    
    // Increment daily counter (resets after 24 hours)
    response.cookies.set('dl_count_daily', (dailyDownloads + 1).toString(), {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })
    
    // Increment weekly counter (resets after 7 days)
    response.cookies.set('dl_count_weekly', (weeklyDownloads + 1).toString(), {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
    
    return response
  }
}

export const config = {
  matcher: '/category/:path*'
}