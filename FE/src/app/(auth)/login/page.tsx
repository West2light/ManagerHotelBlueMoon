'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authenticate, setAuthenticated, isAuthenticated } from '@/utils/auth';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, User, Lock } from 'lucide-react';

const loginFormSchema = z.object({
  username: z.string().min(1, {
    message: 'Tên đăng nhập không được để trống',
  }),
  password: z.string().min(1, {
    message: 'Mật khẩu không được để trống',
  }),
});

type LoginFormType = z.infer<typeof loginFormSchema>;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push(returnUrl);
    }
  }, [router, returnUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormType) => {
    try {
      setIsLoading(true);
      const user = await authenticate(data.username, data.password);

      if (user) {
        setAuthenticated(user);
        toast({
          title: "Đăng nhập thành công",
          description: "Bạn đang được chuyển hướng...",
          variant: "default",
        });

        setTimeout(() => {
          if (returnUrl !== '/') {
            router.push(returnUrl);
          } else {
            console.log("user.role: ", user.role);
            switch (user.role) {
              case 'manager':
                router.push('/manager/home');
                break;
              case 'PT':
                router.push('/trainer/home');
                break;
              case 'admin':
                router.push('/admin/user-manage');
                break;
              case 'customer':
                router.push('/customer/home');
                break;
            }
          }
          router.refresh();
        }, 100);
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: "Tên đăng nhập hoặc mật khẩu không đúng",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="fixed top-0 left-0 p-6 z-10">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft className="mr-2" size={20} />
          <span className="font-medium">Quay lại trang chủ</span>
        </Link>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Đăng nhập</h1>
            <p className="text-gray-600 mb-2">Chào mừng đến với GYM VN Fitness & Yoga</p>
            <p className="text-gray-500 text-sm">Vui lòng đăng nhập để truy cập vào hệ thống</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  id="username"
                  {...register('username')}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Nhập tên đăng nhập"
                />
                {errors.username && (
                  <p className="text-red-600 text-sm">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="mr-2 h-4 w-4 text-gray-500" />
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Nhập mật khẩu"
                />
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop")'
        }}
      ></div>
    </div>
  );
};

export default LoginPage;
