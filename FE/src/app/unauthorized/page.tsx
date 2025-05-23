'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/utils/auth';
import { XCircle } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();
  const user = getCurrentUser();

  const handleBackToHome = () => {
    if (user && user.role) {
      const route = `/${user.role.toLowerCase()}/home`;
      router.push(route);
    } else {
      router.push('/');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Không có quyền truy cập
        </h1>
        
        <p className="text-gray-600 mb-6">
          Bạn không có quyền để xem trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToHome}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Quay lại trang chủ
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 