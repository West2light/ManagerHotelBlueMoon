'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { logout, getCurrentUser } from '@/utils/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Terminal } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const HomePage: React.FC = () => {
  const router = useRouter();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Lấy chữ cái đầu tiên của tên người dùng cho avatar fallback
  const getInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar>
            <AvatarImage src={`/avatars/${user?.email || 'default'}.jpg`} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-blue-500 text-white">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium text-lg">{user?.name || 'Người dùng'}</h2>
            <p className="text-gray-500 text-sm">{user?.role || 'Trainer'}</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4">Trang Chính</h1>

        <Alert className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Chào mừng!</AlertTitle>
          <AlertDescription>
            Chào mừng bạn đến với ứng dụng Pickelball. Đây là trang dành cho Trainer.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Thông tin tài khoản</h3>
            <p className="text-gray-600">{user?.email || 'trainer@gmail.com'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;