"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Phone, Mail, User, Clock, Award } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface Customer {
  customerId: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  updateAt: string;
  membership: {
    membershipId: number;
    membershipName: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface Membership {
  id: number;
  namepackage: string;
  price: number;
  description: string;
  exercise_type: string;
}

interface MembershipRegistration {
  registrationId: number;
  customerId: number;
  membershipId?: number;
  endAt: string;
  createAt: string;
  startAt: string;
  status: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipRegistrations, setMembershipRegistrations] = useState<MembershipRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = async () => {
    try {
      const response = await axios.get('http://localhost:3001/manager/getMembership', {
        headers: {
          'Content-Type': 'application/json',
          'Token': `1`
        }
      });

      if (response.data && response.data.list) {
        const membershipsList = response.data.list;
        setMemberships(membershipsList);
      }
    } catch (err) {
      console.error("Error fetching memberships:", err);
    }
  };

  const getMembershipNameById = (membershipId: number | undefined) => {
    if (!membershipId) return "Không xác định";
    const membership = memberships.find(m => m.id === membershipId);
    return membership ? membership.namepackage : "Không xác định";
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        await fetchMemberships();
        const customerResponse = await axios.get('http://localhost:3001/admin/getCustomerList');

        if (customerResponse.data && customerResponse.data.data) {
          const customerData = customerResponse.data.data.find(
            (c: Customer) => c.customerId === parseInt(customerId)
          );

          if (customerData) {
            setCustomer(customerData);
            try {
              const membershipResponse = await axios.post('http://localhost:3001/customer/getMemberRegistration', {
                userId: customerData.customerId
              });
              if (membershipResponse.data && membershipResponse.data.data) {
                const registrations = membershipResponse.data.data;
                setMembershipRegistrations(registrations);
              }
            } catch (membershipErr) {
              console.error("Error fetching membership details:", membershipErr);
            }
          } else {
            setError("Không tìm thấy thông tin hội viên");
          }
        }
      } catch (err) {
        setError("Không thể lấy thông tin hội viên. Vui lòng thử lại sau.");
        console.error("Error fetching customer details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    if (status === "active" || status === "Đang hoạt động") {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Đang hoạt động</span>;
    } else if (status === "Hết hạn") {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Hết hạn</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Không hoạt động</span>;
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md w-full text-center">
          <p className="font-bold">Lỗi</p>
          <p>{error || "Không tìm thấy thông tin hội viên"}</p>
        </div>
        <Button onClick={goBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    );
  }

  const getCurrentMembership = () => {
    if (membershipRegistrations.length === 0) return null;
    const sortedRegistrations = [...membershipRegistrations].sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
    );

    return sortedRegistrations[0];
  };

  const currentRegistration = getCurrentMembership();
  const currentMembershipName = currentRegistration ?
    getMembershipNameById(currentRegistration.registrationId) :
    (customer.membership ? customer.membership.membershipName : null);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chi tiết hội viên</h1>
        <Button onClick={goBack} variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700 flex items-center text-lg">
              <User className="mr-2 h-5 w-5" /> Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">ID</h3>
                <p className="font-medium">{customer.customerId}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Họ tên</h3>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Tuổi</h3>
                <p className="font-medium">{customer.age}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Giới tính</h3>
                <p className="font-medium">{customer.gender}</p>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-400" />
                <p>{customer.phone}</p>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-400" />
                <p>{customer.email}</p>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-400" />
                <p>Cập nhật: {formatDate(customer.updateAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700 flex items-center text-lg">
              <Award className="mr-2 h-5 w-5" /> Gói tập hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {currentRegistration ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-gray-500">Tên gói tập</h3>
                    <p className="font-medium">{currentMembershipName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Trạng thái</h3>
                    <p>{getStatusBadge(currentRegistration.status)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Ngày bắt đầu</h3>
                    <p className="font-medium">{formatDate(currentRegistration.startAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Ngày kết thúc</h3>
                    <p className="font-medium">{formatDate(currentRegistration.endAt)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Hội viên chưa đăng ký gói tập nào
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-700 flex items-center text-lg">
            <Calendar className="mr-2 h-5 w-5" /> Lịch sử đăng ký gói tập
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {membershipRegistrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Gói tập</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membershipRegistrations.map((registration) => (
                  <TableRow key={registration.registrationId} className="hover:bg-gray-50">
                    <TableCell>{registration.registrationId}</TableCell>
                    <TableCell className="font-medium">
                      {getMembershipNameById(registration.registrationId)}
                    </TableCell>
                    <TableCell>{formatDate(registration.startAt)}</TableCell>
                    <TableCell>{formatDate(registration.endAt)}</TableCell>
                    <TableCell>{getStatusBadge(registration.status)}</TableCell>
                    <TableCell>{formatDate(registration.createAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Không có lịch sử đăng ký gói tập
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 