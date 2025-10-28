// middleware.js (in root directory, same level as pages folder)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  
  // Handle ambiant-lighting (with "i" misspelling)
  if (url.pathname === '/category/ambiant-lighting') {
    url.pathname = '/category/bookshelves-dark';
    // Force 308 redirect for ALL requests including bots
    return NextResponse.redirect(url, 308);
  }
  
  // Handle ambient-lighting (with "e" correct spelling)  
  if (url.pathname === '/category/ambient-lighting') {
    url.pathname = '/category/bookshelves-dark';
    return NextResponse.redirect(url, 308);
  }
}

// Only run this middleware on these specific paths
export const config = {
  matcher: ['/category/ambiant-lighting', '/category/ambient-lighting']
};