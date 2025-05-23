'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  age?: number;
  gender?: string;
  phone?: string;
}

const UserManagePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // Fix hydration error by identifying client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Không tìm thấy token xác thực');
          toast({
            title: "Lỗi xác thực",
            description: "Vui lòng đăng nhập lại để tiếp tục",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/manager/getInfoCustomer`, {
          headers: {
            'token': token
          }
        });

        console.log('API Response:', response.data);

        if (response.data.status && response.data.list) {
          const formattedUsers = response.data.list.map((customer: any) => {
            return {
              id: customer.customerId || '',
              name: customer.customerName || 'Không có tên',
              email: customer.customerEmail || '',
              role: 'Member',
              status: 'active', // Mặc định là active vì API không trả về status
              joinDate: customer.infoUpdateAt || new Date().toISOString().split('T')[0],
              age: customer.customerAge,
              gender: customer.customerGender,
              phone: customer.customerPhone
            };
          });

          console.log('Formatted users:', formattedUsers);
          setUsers(formattedUsers);
          toast({
            title: "Thành công",
            description: response.data.status,
            variant: "default",
          });
        } else {
          console.log('No data in response or different structure:', response.data);
          setError('Không có dữ liệu khách hàng');
          toast({
            title: "Thông báo",
            description: response.data.status || 'Không có dữ liệu khách hàng',
            variant: "default",
          });
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Đã xảy ra lỗi khi lấy dữ liệu');
        toast({
          title: "Lỗi",
          description: `Không thể tải dữ liệu khách hàng: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      fetchUsers();
    }
  }, [isClient, toast]);

  // Tránh lỗi hydration bằng cách chỉ render content khi đã xác định chắc chắn đang ở client
  if (!isClient) {
    return (
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <Table>
          <TableCaption>Danh sách người dùng trong hệ thống</TableCaption>
          <TableHeader>
            <TableRow className="bg-blue-500">
              <TableHead className="text-white w-[80px] text-center">STT</TableHead>
              <TableHead className="text-white text-left">Tên</TableHead>
              <TableHead className="text-white text-left">Email</TableHead>
              <TableHead className="text-white text-center">Vai trò</TableHead>
              <TableHead className="text-white text-center">Trạng thái</TableHead>
              <TableHead className="text-white text-center">Ngày tham gia</TableHead>
              <TableHead className="text-center text-white">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={`user-${user.id}-${index}`} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-center">{index + 1}</TableCell>
                  <TableCell className="text-left">{user.name}</TableCell>
                  <TableCell className="text-left">{user.email}</TableCell>
                  <TableCell className="text-center">{user.role}</TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {user.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{new Date(user.joinDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Eye size={18} className="text-gray-600 hover:text-blue-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Thông tin chi tiết khách hàng</DialogTitle>
                        </DialogHeader>
                        <Separator className="my-4" />
                        {selectedUser && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">STT</p>
                                <p className="mt-1">{users.findIndex(u => u.id === selectedUser.id) + 1}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Tên</p>
                                <p className="mt-1">{selectedUser.name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="mt-1">{selectedUser.email}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                                <p className="mt-1">{selectedUser.phone || 'Chưa cập nhật'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Tuổi</p>
                                <p className="mt-1">{selectedUser.age || 'Chưa cập nhật'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Giới tính</p>
                                <p className="mt-1">{selectedUser.gender || 'Chưa cập nhật'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Ngày tham gia</p>
                                <p className="mt-1">{new Date(selectedUser.joinDate).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                                <p className="mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs ${selectedUser.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {selectedUser.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="no-data">
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Không có dữ liệu người dùng
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default UserManagePage;