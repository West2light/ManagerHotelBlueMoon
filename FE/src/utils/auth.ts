// Định nghĩa các kiểu role
export type UserRole = 'ADMIN' | 'MANAGER' | 'TRAINER';

// Interface cho user
interface User {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

// Interface cho response API
interface AuthResponse {
  user: User;
  token: string;
}

// Xử lí cookies 
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const authenticate = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Đăng nhập thất bại');
    }

    const data: AuthResponse = await response.json();
    return data.user;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return null;
  }
};

export const setAuthenticated = (user: User) => {
  setCookie('auth', JSON.stringify({
    isAuthenticated: true,
    role: user.role,
    email: user.email,
    name: user.name
  }), {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
};

export const getCurrentUser = () => {
  const authCookie = getCookie('auth');
  if (!authCookie) return null;

  try {
    return JSON.parse(authCookie as string);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  const authCookie = getCookie('auth');
  if (!authCookie) return false;

  try {
    const authData = JSON.parse(authCookie as string);
    return authData.isAuthenticated === true;
  } catch {
    return false;
  }
};

export const logout = async () => {
  try {
    // Gọi API logout nếu cần
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
  } finally {
    deleteCookie('auth', { path: '/' });
  }
};

// Helper function để check role
export const hasRole = (allowedRoles: UserRole[]) => {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role as UserRole);
};