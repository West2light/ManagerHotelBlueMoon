"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { Calendar, Clock, Package, CheckCircle, Loader2, AlertTriangle, RotateCw } from "lucide-react";
import { getCurrentUser } from "@/utils/auth";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

interface Membership {
  id: number;
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  status: number; // 1: Hoạt động, 2: Hết hạn, 3: Gia hạn
  price: number;
  features: string[];
  ptName?: string;
}

interface ExercisePackage {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  maxClients: number;
}

export default function MembershipPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false);
  const [activeMembership, setActiveMembership] = useState<Membership | null>(null);
  const [expiredMemberships, setExpiredMemberships] = useState<Membership[]>([]);
  const [exercisePackages, setExercisePackages] = useState<ExercisePackage[]>([]);
  
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id ? parseInt(currentUser.id) : 0;

  useEffect(() => {
    fetchMembershipData();
    fetchExercisePackages();
  }, []);

  const fetchMembershipData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/customer/getMemberRegistration`, {
        userId: currentUserId
      });
      
      
      if (response.status === 200 && response.data.data) {
        const allUserMemberships = processApiData(response.data.data);
        
        const sortedMemberships = [...allUserMemberships].sort((a, b) => {
          return new Date(b.endAt).getTime() - new Date(a.endAt).getTime();
        });

        if (sortedMemberships.length > 0) {
          setActiveMembership(sortedMemberships[0]);
          setExpiredMemberships(sortedMemberships.slice(1));
        } else {
          setActiveMembership(null);
          setExpiredMemberships([]);
        }
      } else {
        setActiveMembership(null);
        setExpiredMemberships([]);
        console.log('No membership data found or API error:', response.data.status);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin gói tập:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy thông tin gói tập. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExercisePackages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/getExercisePackages`);
      console.log('Exercise Packages Response:', response.data);
      
      if (response.status === 200 && response.data.data) {
        setExercisePackages(response.data.data);
      } else {
        console.log('No exercise packages found or API error');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin các gói tập:', error);
    }
  };

  const processApiData = (apiData: any[]): Membership[] => {
    return apiData.map(item => {
      const features = item.description?.split(';') || 
        ["Sử dụng tất cả thiết bị", "Tham gia các lớp tập theo nhóm"];
      
      let statusCode = 2; 
      if (item.status === "Đang hoạt động" || item.status === "Đã đăng ký") {
        statusCode = 1;
      } else if (item.status === "Gia hạn") {
        statusCode = 3;
      }
      
      return {
        id: item.registrationId || item.id,
        name: item.membershipName || "Gói tập",
        description: item.description || "",
        startAt: item.startAt || item.startDate || item.createAt,
        endAt: item.endAt || item.endDate || item.expireAt,
        status: statusCode,
        price: item.price || 0,
        features: features,
        ptName: item.trainerName
      };
    });
  };

  const handleRenewal = async (membershipId: number) => {
    setIsRenewing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/customer/extendMembership`, {
        userId: currentUserId,
        registrationId: membershipId
      });
      
      console.log("response from extendMembership:", response.data);
      
      if (response.status === 200) {
        if (activeMembership && activeMembership.id === membershipId) {
          setActiveMembership({
            ...activeMembership,
            status: 3 
          });
        } else {
          setExpiredMemberships(prev => 
            prev.map(m => 
              m.id === membershipId ? {...m, status: 3} : m
            )
          );
        }
        
        toast({
          title: "Yêu cầu gia hạn thành công",
          description: "Yêu cầu gia hạn gói tập của bạn đã được gửi đi và đang chờ xét duyệt",
          variant: "default",
        });
        
        setTimeout(() => {
          fetchMembershipData();
        }, 2000);
      } else {
        throw new Error(response.data.status || 'Yêu cầu gia hạn không thành công');
      }
    } catch (error: any) {
      console.error('Lỗi khi gia hạn gói tập:', error);
      let errorMessage = "Không thể gia hạn gói tập. Vui lòng thử lại sau.";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Gói tập không tồn tại hoặc đã hết hạn.";
        } else if (error.response.data && error.response.data.status) {
          errorMessage = error.response.data.status;
        }
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRenewing(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: 
        return <Badge className="bg-green-500">Đã đăng ký</Badge>;
      case 2: 
        return <Badge className="bg-red-500">Hết hạn</Badge>;
      case 3: 
        return <Badge className="bg-yellow-500">Gia hạn</Badge>;
      default:
        return <Badge className="bg-gray-500">Không xác định</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const MembershipCard = ({ membership }: { membership: Membership }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{membership.name}</CardTitle>
            <CardDescription>{membership.description}</CardDescription>
          </div>
          <div>{getStatusBadge(membership.status)}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Ngày bắt đầu</p>
              <p>{formatDate(membership.startAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Ngày kết thúc</p>
              <p>{formatDate(membership.endAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Thời gian còn lại</p>
              <p>{calculateDaysLeft(membership.endAt)} ngày</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Dịch vụ bao gồm:</h3>
          <ul className="list-disc list-inside space-y-1">
            {membership.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {membership.ptName && (
          <div>
            <h3 className="text-lg font-medium mb-2">Huấn luyện viên:</h3>
            <p>{membership.ptName}</p>
          </div>
        )}
        
        {membership.status === 2 && (
          <div className="flex items-center p-4 bg-yellow-50 rounded-md border border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-yellow-800">
              Gói tập của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {membership.status === 1 && (
          <div className="text-sm text-muted-foreground">
            Gói tập của bạn vẫn còn {calculateDaysLeft(membership.endAt)} ngày sử dụng
          </div>
        )}
        
        {membership.status === 2 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="gap-2">
                <RotateCw className="h-4 w-4" />
                Gia hạn gói tập
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận gia hạn gói tập?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn gia hạn gói tập "{membership.name}" không? 
                  Yêu cầu gia hạn sẽ được gửi tới quản lý để xét duyệt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleRenewal(membership.id)} disabled={isRenewing}>
                  {isRenewing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        {membership.status === 3 && (
          <div className="text-sm text-yellow-600 flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Yêu cầu gia hạn đang được xử lý
          </div>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {activeMembership ? (
            <MembershipCard membership={activeMembership} />
          ) : null}
          
          {expiredMemberships.length > 0 ? (
            <>
              {expiredMemberships.length > 0 && activeMembership && (
                <h2 className="text-xl font-medium mt-6 mb-4">Các gói tập khác</h2>
              )}
              
              {expiredMemberships.map((membership) => (
                <MembershipCard key={membership.id} membership={membership} />
              ))}
            </>
          ) : !activeMembership ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Bạn chưa đăng ký gói tập nào</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vui lòng liên hệ với quản lý để đăng ký gói tập phù hợp với nhu cầu của bạn
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
          
          {exercisePackages.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Các gói tập hiện có</CardTitle>
                <CardDescription>Liên hệ quản lý để đăng ký gói tập phù hợp với bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Tên gói tập</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell className="text-right">Giá (VNĐ)</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercisePackages.map(pkg => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{pkg.name}</TableCell>
                        <TableCell>{pkg.description}</TableCell>
                        <TableCell className="text-right">
                          {pkg.price.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}