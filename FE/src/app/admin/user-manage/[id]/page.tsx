'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserCircle, Calendar, Mail, Phone, Award, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

interface User {
  userId: number;
  username: string;
  password: string;
  role: string;
  roleId: number;
  createAt: string;
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  customerId?: number;
  staffId?: number;
  rank?: string;
}

interface Payment {
  paymentId: number;
  customer: string;
  amount: number;
  method: string;
  paid: boolean;
  date: string;
}

interface Membership {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

const UserDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [trainingClients, setTrainingClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3001/getUserInfo', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token') || '1',
          },
        });
        const data = await response.json();
        
        if (data.status === 'success') {
          const userId = parseInt(params.id as string);
          const foundUser = data.list.find((u: any) => u.userId === userId);
          
          if (foundUser) {
            setUser(foundUser);
            
            if (foundUser.userType === 'customer' && foundUser.customerId) {
              fetchMembershipData(foundUser.customerId);
              fetchPaymentData(foundUser.customerId);
            }
            
            if (foundUser.role === 'PT' && foundUser.staffId) {
              fetchTrainerClients(foundUser.staffId);
            }
          } else {
            toast.error('Không tìm thấy thông tin người dùng');
            setTimeout(() => router.push('/admin/user-manage'), 2000);
          }
        } else {
          toast.error('Không thể tải thông tin người dùng');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [params.id, router]);

  const fetchMembershipData = async (customerId: number) => {
    try {
      const response = await fetch('http://localhost:3001/customer/getMemberRegistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || '1',
        },
        body: JSON.stringify({ userId: customerId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status.includes("thành công") && data.data && data.data.length > 0) {
          const membershipData = data.data[0]; // Lấy gói tập mới nhất
          setMembership({
            id: membershipData.id,
            name: membershipData.membershipName,
            status: membershipData.status,
            startDate: membershipData.startDate,
            endDate: membershipData.endDate
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu gói tập:', error);
    }
  };

  const fetchPaymentData = async (customerId: number) => {
    try {
      const response = await fetch('http://localhost:3001/customer/getPayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || '1',
        },
        body: JSON.stringify({ userId: customerId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status.includes("thành công") && data.data) {
          setPayments(data.data);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thanh toán:', error);
    }
  };

  const fetchTrainerClients = async (staffId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/trainer/getClients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || '1',
        },
        body: JSON.stringify({ staffId: staffId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.clients) {
          setTrainingClients(data.clients);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng PT:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy thông tin người dùng</h2>
          <p className="mt-2 text-gray-500">Đang chuyển hướng về trang quản lý người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-3 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center pb-4">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <UserCircle className="h-16 w-16 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold">{`${user.firstName} ${user.lastName}`}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.role}</p>
              <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {user.userType === 'customer' ? 'Hội viên' : 'Nhân viên'}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Ngày tham gia</p>
                  <p className="font-medium">{new Date(user.createAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              
              {user.userType === 'staff' && user.rank && (
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Cấp bậc</p>
                    <p className="font-medium">{user.rank || 'Chưa phân loại'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-3 md:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              {user.userType === 'customer' && (
                <TabsTrigger value="membership">Gói tập</TabsTrigger>
              )}
              {user.role === 'PT' && trainingClients.length > 0 && (
                <TabsTrigger value="clients">Danh sách khách hàng</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">ID Người dùng</p>
                      <p className="font-medium">{user.userId}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Tên tài khoản</p>
                      <p className="font-medium">{user.username}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Họ</p>
                      <p className="font-medium">{user.firstName}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Tên</p>
                      <p className="font-medium">{user.lastName}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Giới tính</p>
                      <p className="font-medium">{user.gender}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Tuổi</p>
                      <p className="font-medium">{user.age}</p>
                    </div>
                    
                    {user.userType === 'customer' && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">ID Khách hàng</p>
                        <p className="font-medium">{user.customerId}</p>
                      </div>
                    )}
                    
                    {user.userType === 'staff' && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">ID Nhân viên</p>
                        <p className="font-medium">{user.staffId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {user.userType === 'customer' && (
              <TabsContent value="membership">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin gói tập</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {membership ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{membership.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">Gói tập hiện tại</p>
                            </div>
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {membership.status}
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                              <p className="text-sm font-medium">{new Date(membership.startDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Ngày kết thúc</p>
                              <p className="text-sm font-medium">{new Date(membership.endDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Người dùng chưa đăng ký gói tập nào</p>
                        </div>
                      )}
                      
                      {payments && payments.length > 0 && (
                        <>
                          <h3 className="font-medium text-gray-700 mt-6">Lịch sử thanh toán</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mã hóa đơn</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ngày</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Số tiền</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Phương thức</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody>
                                {payments.map((payment) => (
                                  <tr key={payment.paymentId} className="border-t">
                                    <td className="px-4 py-3 text-sm">INV-{payment.paymentId}</td>
                                    <td className="px-4 py-3 text-sm">{new Date(payment.date).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-4 py-3 text-sm">{payment.amount.toLocaleString('vi-VN')} VNĐ</td>
                                    <td className="px-4 py-3 text-sm">{payment.method}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`px-2 py-1 ${payment.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} rounded-full text-xs`}>
                                        {payment.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {user.role === 'PT' && trainingClients.length > 0 && (
              <TabsContent value="clients">
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách khách hàng được huấn luyện</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Họ và tên</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Điện thoại</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Gói tập</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainingClients.map((client) => (
                            <tr key={client.id} className="border-t">
                              <td className="px-4 py-3 text-sm">{client.firstName} {client.lastName}</td>
                              <td className="px-4 py-3 text-sm">{client.email}</td>
                              <td className="px-4 py-3 text-sm">{client.phone}</td>
                              <td className="px-4 py-3 text-sm">{client.packageName}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                  {client.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage; 