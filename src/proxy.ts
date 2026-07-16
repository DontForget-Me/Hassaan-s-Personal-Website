import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/ai')) {
    // Rate limiting is handled inside the API route itself
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/ai/:path*', '/admin/:path*'],
};
