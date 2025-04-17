// pages/login.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authenticate, setAuthenticated, isAuthenticated } from '@/utils/auth';
import Image from 'next/image';

// Định nghĩa schema Zod cho form login
const loginFormSchema = z.object({
  email: z.string().email({
    message: 'Email không hợp lệ',
  }),
  password: z.string({
    message: 'Mật khẩu không hợp lệ',
  }),
});

type LoginFormType = z.infer<typeof loginFormSchema>;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/home');
    }
  }, [router]);

  const isDev = process.env.NODE_ENV === 'development';

  // Sử dụng React Hook Form với Zod Resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
  });

  // Nếu đang ở môi trường dev, tự động điền email và password
  React.useEffect(() => {
    if (isDev) {
      setValue('email', 'admin@gmail.com');
      setValue('password', '1');
    }
  }, [isDev, setValue]);

  const onSubmit = async (data: LoginFormType) => {
    setIsLoading(true);
    setError('');

    try {
      const user = await authenticate(data.email, data.password);
      if (user) {
        setAuthenticated(user);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 100);
      } else {
        setError('Email hoặc mật khẩu không chính xác');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 relative">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Chào mừng trở lại!</h2>
        <p className="text-center text-gray-600 mb-8">Đăng nhập để tiếp tục</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                {...register('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Nhập email của bạn"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                {...register('password')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Nhập mật khẩu của bạn"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-200 ${isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-800">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;