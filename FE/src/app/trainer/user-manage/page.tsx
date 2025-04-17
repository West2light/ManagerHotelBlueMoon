'use client';
import React from 'react';
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
// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: "U001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    role: "Member",
    status: "active",
    joinDate: "2024-02-15",
  },
  {
    id: "U002",
    name: "Trần Thị B",
    email: "tranthib@gmail.com",
    role: "Admin",
    status: "active",
    joinDate: "2024-01-20",
  },
  {
    id: "U003",
    name: "Lê Văn C",
    email: "levanc@gmail.com",
    role: "Member",
    status: "inactive",
    joinDate: "2024-02-10",
  },
  {
    id: "U004",
    name: "Phạm Thị D",
    email: "phamthid@gmail.com",
    role: "Member",
    status: "active",
    joinDate: "2024-02-18",
  },
];

const UserManagePage: React.FC = () => {
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
      
      <Table>
        <TableCaption>Danh sách người dùng trong hệ thống 20/02/2025</TableCaption>
        <TableHeader>
          <TableRow className="bg-blue-500">
            <TableHead>ID</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tham gia</TableHead>
            <TableHead className="text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockUsers.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
              </TableCell>
              <TableCell>{new Date(user.joinDate).toLocaleDateString('vi-VN')}</TableCell>
              <TableCell className="text-center">
                <Link 
                  href={`/user-manage/${user.id}`} 
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Eye size={18} className="text-gray-600 hover:text-blue-600" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagePage;