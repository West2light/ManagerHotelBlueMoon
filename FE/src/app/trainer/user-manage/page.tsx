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
import { Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/components/ui/toast';
import { getTrainerId } from '@/utils/auth';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface ExerciseSession {
  sessionId: number;
  trainerId: number;
  customerId: number;
  exerciseType: string;
  beginAt: string;
  endAt: string;
  description: string;
}

const UserManagePage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerSessions, setCustomerSessions] = useState<ExerciseSession[]>([]);
  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrainerId = async () => {
      try {
        const id = await getTrainerId();
        if (id) {
          setTrainerId(id);
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể xác định ID huấn luyện viên. Vui lòng đăng nhập lại.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy ID huấn luyện viên:", error);
        toast({
          title: "Lỗi",
          description: "Không thể xác định ID huấn luyện viên. Vui lòng đăng nhập lại.",
          variant: "destructive"
        });
      }
    };

    fetchTrainerId();
  }, [toast]);

  useEffect(() => {
    if (trainerId) {
      fetchCustomers();
    }
  }, [trainerId]);

  const fetchCustomers = async () => {
    if (!trainerId) {
      setError('Không có ID huấn luyện viên');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/pt/customer-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainerId }),
      });

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách khách hàng');
      }
      const data = await response.json();

      const formattedCustomers: Customer[] = data.map((customer: any) => {
        return {
          id: customer.id,
          name: `${customer.firstname || ''} ${customer.lastname || ''}`.trim(),
          email: customer.email || '',
          phone: customer.phone || '',
          joinDate: customer.updateAt || new Date().toISOString(),
        };
      });

      setCustomers(formattedCustomers);
    } catch (err: any) {
      setError(err.message);
      console.error('Lỗi khi lấy danh sách khách hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerSessions = async (customerId: number) => {
    if (!trainerId) {
      toast({
        title: "Lỗi",
        description: "Không thể xác định ID huấn luyện viên",
        variant: "destructive"
      });
      return;
    }

    setSessionLoading(true);
    setSelectedCustomerId(customerId);

    try {
      const response = await fetch(`http://localhost:3001/pt/schedule/${trainerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy lịch tập của khách hàng');
      }

      const data = await response.json();

      const customerSpecificSessions = data.filter(
        (session: any) => {
          const sessionCustomerId = session.customer?.id || session.customerId;
          return sessionCustomerId === customerId;
        }
      ).map((session: any) => {
        return {
          sessionId: session.id || session.sessionId,
          trainerId: session.staff?.id || session.trainerId || trainerId,
          customerId: session.customer?.id || session.customerId,
          exerciseType: session.exerciseType || session.excerciseType || 'Không xác định',
          beginAt: session.beginAt,
          endAt: session.endAt,
          description: session.description || '',
        };
      });

      setCustomerSessions(customerSpecificSessions);

      if (customerSpecificSessions.length === 0) {
        toast({
          title: "Thông báo",
          description: "Khách hàng này chưa có lịch tập nào",
        });
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy lịch tập của khách hàng:', err);
      toast({
        title: "Lỗi",
        description: err.message || "Không thể lấy lịch tập của khách hàng",
        variant: "destructive"
      });
    } finally {
      setSessionLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Lỗi: {error}</div>;
  }

  return (
    <div className="w-full p-4">
      <Table>
        <TableCaption>Danh sách hội viên được quản lý</TableCaption>
        <TableHeader>
          <TableRow className="bg-blue-500">
            <TableHead className="text-white">ID</TableHead>
            <TableHead className="text-white">Tên</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Số điện thoại</TableHead>
            <TableHead className="text-white">Ngày tham gia</TableHead>
            <TableHead className="text-center text-white">Lịch tập</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || 'N/A'}</TableCell>
                <TableCell>{new Date(customer.joinDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchCustomerSessions(customer.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Calendar size={18} className="text-gray-600 hover:text-blue-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" aria-describedby={`description-${customer.id}`}>
                      <div id={`description-${customer.id}`} className="sr-only">
                        Thông tin lịch tập của {customer.name}
                      </div>
                      <DialogHeader>
                        <DialogTitle>Lịch tập của {customer.name}</DialogTitle>
                      </DialogHeader>
                      <Separator className="my-4" />
                      {sessionLoading ? (
                        <div className="py-4 text-center">Đang tải lịch tập...</div>
                      ) : customerSessions.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Loại</TableHead>
                                <TableHead>Thời gian bắt đầu</TableHead>
                                <TableHead>Thời gian kết thúc</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customerSessions.map((session) => (
                                <TableRow key={session.sessionId}>
                                  <TableCell>{session.exerciseType}</TableCell>
                                  <TableCell>{formatDateTime(session.beginAt)}</TableCell>
                                  <TableCell>{formatDateTime(session.endAt)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="py-4 text-center">Không có lịch tập nào</div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Không có hội viên nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagePage;