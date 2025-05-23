import axios from 'axios';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

export type UserRole = 'admin' | 'manager' | 'PT' | 'customer';

export interface User {
  id?: string;
  username?: string;
  role: UserRole;
  token?: string;
  name?: string;
}

export interface Customer {
  customerId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
}

const API_URL = 'http://localhost:3001';

export const authenticate = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password
    });
    if (response.status === 200 && response.data.token) {
      localStorage.setItem('token', response.data.token);

      return {
        id: response.data.userid,
        username,
        role: response.data.role,
        token: response.data.token,
        name: response.data.name || username
      };
    }
    return null;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return null;
  }
};

export const getCustomersList = async (): Promise<Customer[]> => {
  try {
    const response = await axios.get(`${API_URL}/getUserInfo`);
    
    if (response.status === 200 && response.data.status === 'success') {
      const userList = response.data.list;
      
      const customers = userList.filter((user: any) => user.customerId)
        .map((user: any) => ({
          customerId: user.customerId,
          userId: user.userId,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          phone: user.phone,
          age: user.age,
          gender: user.gender
        }));
      
      return customers;
    }
    
    console.error('Không thể lấy danh sách khách hàng từ API');
    return [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error);
    return [];
  }
};

export const getTrainerId = async (): Promise<number | null> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('Không tìm thấy thông tin người dùng đăng nhập');
      return null;
    }

    const response = await axios.get(`${API_URL}/getUserInfo`);
    if (response.status === 200 && response.data.status === 'success') {
      const userList = response.data.list;
      
      const foundUser = userList.find((user: any) => 
        user.userId.toString() === currentUser.id.toString()
      );
      
      if (foundUser) {
        if (foundUser.role === 'PT' && foundUser.staffId) {
          return foundUser.staffId;
        }
        return foundUser.userId;
      }
      
      console.error('Không tìm thấy thông tin người dùng trong danh sách');
      return null;
    }
    
    console.error('Không thể lấy thông tin từ API');
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin trainer:', error);
    return null;
  }
};

export const setAuthenticated = (user: User) => {
  setCookie('auth', JSON.stringify({
    isAuthenticated: true,
    role: user.role,
    username: user.username,
    id: user.id,
    token: user.token,
    name: user.name
  }), {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 
  });
};

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const authCookie = getCookie('auth');
    if (!authCookie) return null;

    try {
      return JSON.parse(authCookie as string);
    } catch {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    const authCookie = getCookie('auth');
    if (!authCookie) return false;

    try {
      const authData = JSON.parse(authCookie as string);
      return authData.isAuthenticated === true;
    } catch {
      return false;
    }
  }
  return false;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    deleteCookie('auth', { path: '/' });
  }
};

export const hasRole = (allowedRoles: UserRole[]) => {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role as UserRole);
};