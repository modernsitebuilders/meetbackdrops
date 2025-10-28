import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // Define your redirects
  const redirects = {
    '/category/ambient-lighting': '/category/bookshelves-dark',
    '/category/ambiant-lighting': '/category/bookshelves-dark',
    '/category/well-lit': '/category/bookshelves-bright',
    '/category/ambient': '/category/bookshelves-dark',
    '/category/conference-rooms': '/category/office-spaces',
    '/category/minimalist': '/category/bookshelves-bright',
    '/category/home-lifestyle': '/category/living-rooms',
    '/category/professional-shelves': '/category/office-spaces',
    '/category/open-offices': '/category/office-spaces',
    '/category/executive-offices': '/category/office-spaces',
    '/category/home-offices': '/category/office-spaces',
    '/category/premium-4k': '/',
    '/category/lobbies': '/category/office-spaces',
    '/category/lounges': '/category/living-rooms',
    '/category/private-offices': '/category/office-spaces',
    '/category/living-room': '/category/living-rooms',
    '/category/kitchen': '/category/kitchens',
  };
  
  // Check if current path needs to be redirected
  if (redirects[url.pathname]) {
    url.pathname = redirects[url.pathname];
    return NextResponse.redirect(url, 308); // 308 is permanent redirect
  }
  
  return NextResponse.next();
}

// Only run middleware on category pages that might need redirects
export const config = {
  matcher: '/category/:path*',
};