'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import axios from 'axios';

interface Membership {
  id: string;
  name: string;
  description: string;
  exerciseType: string;
  price: number;
}

const MembershipManagePage: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
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
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/manager/getMembership`, {
        headers: {
          'token': token
        }
      });

      if (response.data.status && response.data.list) {
        const formattedMemberships = response.data.list.map((membership: any) => ({
          id: membership.id || '',
          name: membership.namepackage || '',
          description: membership.description || '',
          exerciseType: membership.exercise_type || '',
          price: membership.price || 0
        }));

        setMemberships(formattedMemberships);
        toast({
          title: "Thành công",
          description: response.data.status,
          variant: "default",
        });
      } else {
        setError('Không có dữ liệu gói tập');
        toast({
          title: "Thông báo",
          description: response.data.status || 'Không có dữ liệu gói tập',
          variant: "default",
        });
      }
    } catch (err: any) {
      console.error('Error fetching memberships:', err);
      setError(err.message || 'Đã xảy ra lỗi khi lấy dữ liệu');
      toast({
        title: "Lỗi",
        description: `Không thể tải dữ liệu gói tập: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Danh sách gói tập</h1>
      </div>

      <Table>
        <TableCaption>Danh sách các gói tập</TableCaption>
        <TableHeader>
          <TableRow className="bg-blue-500 text-white">
            <TableHead className="text-center">STT</TableHead>
            <TableHead className="text-left">Tên gói</TableHead>
            <TableHead className="text-left">Mô tả</TableHead>
            <TableHead className="text-center">Loại tập</TableHead>
            <TableHead className="text-center">Giá (VNĐ)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships.length > 0 ? (
            memberships.map((membership, index) => (
              <TableRow key={membership.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell className="text-left">{membership.name}</TableCell>
                <TableCell className="text-left">{membership.description}</TableCell>
                <TableCell className="text-center">{membership.exerciseType}</TableCell>
                <TableCell className="text-center">{membership.price.toLocaleString('vi-VN')}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                Không có dữ liệu gói tập
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MembershipManagePage; 