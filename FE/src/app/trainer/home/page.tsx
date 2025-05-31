'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getCurrentUser, getTrainerId } from '@/utils/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Terminal, Calendar, Users, Clock, BarChart, Phone, Mail, User } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import axios from 'axios';

interface ExerciseSession {
  id: number;
  exerciseType: string;
  beginAt: string;
  endAt: string;
  customer: {
    id: number;
    firstname: string;
    lastname: string;
  };
  status?: 'completed' | 'pending' | 'cancelled';
}

interface Customer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface TrainerInfo {
  userId: number;
  staffId: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  role: string;
  specialty?: string;
  experience?: string;
  bio?: string;
}

const HomePage: React.FC = () => {
  const router = useRouter();
  const user = getCurrentUser();
  const { toast } = useToast();
  
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [todaySessions, setTodaySessions] = useState<ExerciseSession[]>([]);
  const [upcomingSession, setUpcomingSession] = useState<ExerciseSession | null>(null);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [allSessions, setAllSessions] = useState<ExerciseSession[]>([]);
  const [trainerInfo, setTrainerInfo] = useState<TrainerInfo | null>(null);

  useEffect(() => {
    const fetchTrainerId = async () => {
      try {
        const id = await getTrainerId();
        if (id) {
          console.log("Đã lấy được trainerId:", id);
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
      fetchScheduleData();
      fetchCustomerData();
      fetchTrainerInfo();
    }
  }, [trainerId]);
  
  const fetchTrainerInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/getUserInfo`);
      
      if (response.data && response.data.status === 'success' && response.data.list) {
        const userId = user?.id ? parseInt(user.id as string) : null;
        
        const trainerData = response.data.list.find((item: any) => {
          return (item.staffId === trainerId || item.userId === userId) && item.role === 'PT';
        });
        
        if (trainerData) {
          const formattedTrainerInfo: TrainerInfo = {
            userId: trainerData.userId,
            staffId: trainerData.staffId,
            firstname: trainerData.firstname || '',
            lastname: trainerData.lastname || '',
            email: trainerData.email || '',
            phone: trainerData.phone || '',
            gender: trainerData.gender || '',
            age: trainerData.age || 0,
            role: trainerData.role || 'PT',
            specialty: trainerData.specialty || 'Huấn luyện thể hình',
            experience: trainerData.experience || '2+ năm kinh nghiệm',
            bio: trainerData.bio || 'Huấn luyện viên chuyên nghiệp'
          };
          
          setTrainerInfo(formattedTrainerInfo);
          console.log("Thông tin PT:", formattedTrainerInfo);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin PT:', error);
    }
  };

  const fetchScheduleData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/pt/schedule/${trainerId}`);
      
      if (response.data) {
        setAllSessions(response.data);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaySessionsData = response.data.filter((session: ExerciseSession) => {
          const sessionDate = new Date(session.beginAt);
          return sessionDate >= today && sessionDate < tomorrow;
        });
        
        setTodaySessions(todaySessionsData);
        
        const now = new Date();
        const upcomingSessions = response.data.filter((session: ExerciseSession) => {
          return new Date(session.beginAt) > now;
        });
        
        if (upcomingSessions.length > 0) {
          upcomingSessions.sort((a: ExerciseSession, b: ExerciseSession) => 
            new Date(a.beginAt).getTime() - new Date(b.beginAt).getTime()
          );
          setUpcomingSession(upcomingSessions[0]);
        }
        
        const completedSessions = response.data.filter((session: ExerciseSession) => {
          return new Date(session.endAt) < now;
        });
        
        const totalSessions = response.data.length;
        const completionPercentage = totalSessions > 0 
          ? Math.round((completedSessions.length / totalSessions) * 100) 
          : 0;
        
        setCompletionRate(completionPercentage);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu lịch tập:', error);
      setError('Không thể lấy dữ liệu lịch tập');
    }
  };

  const fetchCustomerData = async () => {
    try {
      const response = await axios.post('http://localhost:3001/pt/customer-list', { trainerId });
      
      if (response.data) {
        setCustomers(response.data);
        setCustomerCount(response.data.length);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu khách hàng:', error);
      setError('Không thể lấy dữ liệu khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getInitials = () => {
    if (trainerInfo) {
      return (trainerInfo.firstname.charAt(0) + trainerInfo.lastname.charAt(0)).toUpperCase();
    }
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (trainerInfo) {
      return `${trainerInfo.firstname} ${trainerInfo.lastname}`;
    }
    return user?.name || 'Huấn luyện viên';
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="bg-white w-full shadow-md">
        <div className="max-w-full mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`/avatars/${user?.email || 'default'}.jpg`} alt={getFullName()} />
                <AvatarFallback className="bg-blue-500 text-white">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium text-lg">{getFullName()}</h2>
                <p className="text-gray-500 text-sm">{trainerInfo?.role || user?.role || 'Trainer'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-4">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center p-10">Đang tải dữ liệu...</div>
        ) : (
          <>
            {trainerInfo && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-500">Họ tên:</span>
                      <span className="font-medium">{trainerInfo.firstname} {trainerInfo.lastname}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="font-medium">{trainerInfo.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-500">Điện thoại:</span>
                      <span className="font-medium">{trainerInfo.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-500">Chuyên môn:</span>
                      <span className="font-medium">{trainerInfo.specialty}</span>
                    </div>
                  </div>
                  {trainerInfo.bio && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">{trainerInfo.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">BUỔI TẬP HÔM NAY</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{todaySessions.length}</div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">HỘI VIÊN CỦA BẠN</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{customerCount}</div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">TỶ LỆ HOÀN THÀNH</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{completionRate}%</div>
                      <BarChart className="h-8 w-8 text-purple-500" />
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {allSessions.length > 0 
                        ? `${allSessions.filter(s => new Date(s.endAt) < new Date()).length} buổi hoàn thành / ${allSessions.length} buổi đã lên lịch`
                        : 'Chưa có buổi tập nào'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="mb-6 h-full">
                  <CardHeader>
                    <CardTitle>Buổi tập sắp tới</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingSession ? (
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold">{upcomingSession.exerciseType}</h3>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{formatTime(upcomingSession.beginAt)} - {formatTime(upcomingSession.endAt)}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">
                          Ngày: {formatDate(upcomingSession.beginAt)}
                        </p>
                        <p className="text-gray-600">
                          Hội viên: {upcomingSession.customer.firstname} {upcomingSession.customer.lastname}
                        </p>
                        <button
                          onClick={() => router.push('/trainer/time-table')}
                          className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                          Xem lịch tập
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg">
                        <p className="text-gray-500">Không có buổi tập nào sắp tới</p>
                        <button
                          onClick={() => router.push('/trainer/time-table')}
                          className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                          Quản lý lịch tập
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Buổi tập hôm nay ({todaySessions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaySessions.length > 0 ? (
                      <div className="space-y-4">
                        {todaySessions.map((session) => (
                          <div key={session.id} className="p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-bold">{session.exerciseType}</h3>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>{formatTime(session.beginAt)} - {formatTime(session.endAt)}</span>
                              </div>
                            </div>
                            <p className="text-gray-600">
                              Hội viên: {session.customer.firstname} {session.customer.lastname}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Không có buổi tập nào hôm nay</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Hội viên của bạn</CardTitle>
                    {customers.length > 5 && (
                      <button
                        onClick={() => router.push('/trainer/user-manage')}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Xem tất cả
                      </button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {customers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium">Tên</th>
                              <th className="text-left py-2 font-medium">Email</th>
                              <th className="text-right py-2 font-medium">Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customers.slice(0, 5).map((customer) => (
                              <tr key={customer.id} className="border-b">
                                <td className="py-3">{customer.firstname} {customer.lastname}</td>
                                <td className="py-3">{customer.email}</td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => router.push('/trainer/time-table')}
                                    className="text-blue-500 hover:underline"
                                  >
                                    Xem lịch tập
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Không có hội viên nào</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;