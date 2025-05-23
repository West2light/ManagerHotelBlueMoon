import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const authCookie = request.cookies.get('auth')?.value;
  let user = null;

  if (authCookie) {
    try {
      user = JSON.parse(authCookie);
    } catch (error) {
      console.error('Lỗi khi phân tích auth cookie:', error);
    }
  }

  const isAuthPage = path.startsWith('/login');

  if (path === "/" || path === "") {
    if (user) {
      if (user.role === 'manager') {
        return NextResponse.redirect(new URL('/manager/home', request.url));
      } else if (user.role === 'PT') {
        return NextResponse.redirect(new URL('/trainer/home', request.url));
      } else if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/user-manage', request.url));
      } else if (user.role === 'customer') {
        return NextResponse.redirect(new URL('/customer/home', request.url));
      }
    }
    return NextResponse.next();
  }

  if (user && isAuthPage) {
    if (user.role === 'manager') {
      return NextResponse.redirect(new URL('/manager/home', request.url));
    } else if (user.role === 'PT') {
      return NextResponse.redirect(new URL('/trainer/home', request.url));
    } else if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/user-manage', request.url));
    } else if (user.role === 'customer') {
      return NextResponse.redirect(new URL('/customer/home', request.url));
    }
  }

  const protectedPaths = {
    '/admin': ['admin'],
    '/manager': ['manager'],
    '/trainer': ['PT'],
    '/customer': ['customer']
  };

  const isProtectedRoute = Object.keys(protectedPaths).some(protectedPath =>
    path.startsWith(protectedPath)
  );

  if (isProtectedRoute) {
    if (!user) {
      const returnUrl = encodeURIComponent(request.nextUrl.pathname);
      const loginUrl = new URL(`/login?returnUrl=${returnUrl}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    const requiredRoles = Object.entries(protectedPaths).find(([protectedPath]) =>
      path.startsWith(protectedPath)
    )?.[1];

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (user && user.token) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('token', `${user.token}`);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tất cả các đường dẫn request ngoại trừ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}