import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Đọc cookie trực tiếp từ request
  const authCookie = request.cookies.get('auth')?.value;
  let user = null;
  
  if (authCookie) {
    try {
      user = JSON.parse(authCookie);
    } catch (error) {
      console.error('Error parsing auth cookie:', error);
    }
  }

  // Nếu đang ở trang login và đã có user, chuyển về trang chủ
  if (path === "/login") {
    if (user) {
      switch (user.role) {
        case "ADMIN":
          return NextResponse.redirect(new URL('/admin/home', request.url));
        case "MANAGER":
          return NextResponse.redirect(new URL('/manager/home', request.url));
        case "TRAINER":
          return NextResponse.redirect(new URL('/trainer/home', request.url));
        default:
          return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
    return NextResponse.next();
  }

  // Nếu đang ở trang chủ ("/")
  if (path === "/") {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Chuyển hướng dựa vào role
    switch (user.role) {
      case "ADMIN":
        return NextResponse.redirect(new URL('/admin/home', request.url));
      case "MANAGER":
        return NextResponse.redirect(new URL('/manager/home', request.url));
      case "TRAINER":
        return NextResponse.redirect(new URL('/trainer/home', request.url));
      default:
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Các route cần bảo vệ
  const protectedPaths = {
    '/admin': ['ADMIN'],
    '/manager': ['MANAGER'],
    '/trainer': ['TRAINER'],
    '/dashboard': ['ADMIN', 'MANAGER', 'TRAINER']
  };

  // Kiểm tra xem path hiện tại có phải là protected route không
  const isProtectedRoute = Object.keys(protectedPaths).some(protectedPath => 
    path.startsWith(protectedPath)
  );

  // Nếu là protected route
  if (isProtectedRoute) {
    // Chưa đăng nhập -> chuyển về login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Kiểm tra quyền truy cập
    const requiredRoles = Object.entries(protectedPaths).find(([protectedPath]) => 
      path.startsWith(protectedPath)
    )?.[1];

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/manager/:path*', '/trainer/:path*', '/dashboard/:path*']
}