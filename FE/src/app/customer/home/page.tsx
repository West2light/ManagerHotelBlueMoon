"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, Receipt, Star, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

const API_BASE_URL = "http://localhost:3001";

interface CustomerInfo {
  customerId: number;
  customerName: string;
  customerAge: number;
  customerGender: string;
  customerPhone: string;
  customerEmail: string;
  infoUpdateAt: string;
}

interface MembershipInfo {
  memRegId: number;
  membershipId: number;
  membershipName: string;
  status: string;
  beginDate: string;
  endDate: string;
  createdAt: string;
  remainingDays: number;
}

interface PaymentInfo {
  paymentId: number;
  customer: string;
  amount: number;
  method: string;
  paid: boolean;
  date: string;
}

interface SessionInfo {
  sessionId: number;
  customer: string;
  trainerId: number;
  trainer: string;
  sessionBeginTime: string;
  sessionEndTime: string;
  description: string;
}

export default function CustomerHomePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth='));

    if (authCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
        setUserId(user.id);
        
        fetchData(user.id);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (userId: number) => {
    try {
      await Promise.all([
        fetchCustomerInfo(userId),
        fetchMembershipInfo(userId),
        fetchPayments(userId),
        fetchSessions(userId)
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setLoading(false);
    }
  };

  const fetchCustomerInfo = async (userId: number) => {
    try {
      console.log(userId);  
      const response = await axios.post(`${API_BASE_URL}/customer/getCustomerInfo`, { 
        userId: userId 
      });
      
      if (response.data && response.data.status === "Lấy thông tin khách hàng thành công") {
        setCustomerInfo(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin khách hàng:', error);
    }
  };

  const fetchMembershipInfo = async (userId: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/customer/getMemberRegistration`, {
        userId: userId
      });
      
      if (response.data && response.data.status === "Lấy thông tin gói tập được đăng ký thành công") {
        const latestMembership = response.data.data[0];
        
        const endDate = new Date(latestMembership.endDate);
        const today = new Date();
        const remainingDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        setMembershipInfo({
          ...latestMembership,
          remainingDays: remainingDays > 0 ? remainingDays : 0
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin gói tập:', error);
    }
  };

  const fetchPayments = async (userId: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/customer/getPayments`, {
        userId: userId
      });
      
      if (response.data && response.data.status === "Lấy danh sách payment thành công") {
        setPayments(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin thanh toán:', error);
    }
  };

  const fetchSessions = async (userId: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/customer/getSessionsWithPT`, {
        userId: userId
      });
      
      if (response.data && response.data.status === "Lấy danh sách session thành công") {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin buổi tập:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Đang tải dữ liệu...</div>;
  }

  const getNextSession = () => {
    if (!sessions || sessions.length === 0) return null;
    
    const now = new Date();
    const futureSessions = sessions
      .map(session => ({
        ...session,
        beginDate: new Date(session.sessionBeginTime)
      }))
      .filter(session => session.beginDate > now)
      .sort((a, b) => a.beginDate.getTime() - b.beginDate.getTime());
      
    return futureSessions.length > 0 ? futureSessions[0] : null;
  };

  const nextSession = getNextSession();
  
  const hasUnpaidPayments = payments.some(payment => !payment.paid);

  const handleSubmitReview = async () => {
    if (reviewText.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung đánh giá",
        variant: "destructive",
      });
      return;
    }
    
    if (!userId) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để gửi đánh giá",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/customer/addReview`, {
        "userId": userId,
        "text": reviewText
      });
      
      if (response.status === 200 && response.data.status?.includes("thành công")) {
        setReviewText("");
        
        toast({
          title: "Thành công",
          description: "Đánh giá của bạn đã được gửi thành công",
        });
        
        router.push("/customer/review");
      } else {
        toast({
          title: "Lỗi",
          description: response.data.message || "Không thể gửi đánh giá",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi đánh giá. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-blue-500">Chào mừng, {customerInfo?.customerName || "Khách hàng"}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gói tập của tôi</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {membershipInfo ? membershipInfo.membershipName : "Chưa đăng ký"}
              </span>
              {membershipInfo && (
                <Badge className={
                  membershipInfo.status === "ACTIVE" ? "bg-green-500" : 
                  membershipInfo.status === "EXPIRED" ? "bg-red-500" : 
                  membershipInfo.status === "PENDING" ? "bg-yellow-500" : "bg-gray-500"
                }>
                  {membershipInfo.status === "ACTIVE" ? "Hoạt động" : 
                   membershipInfo.status === "EXPIRED" ? "Hết hạn" : 
                   membershipInfo.status === "PENDING" ? "Chờ duyệt" : "Không xác định"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {membershipInfo 
                ? (membershipInfo.remainingDays > 0 
                  ? `Còn ${membershipInfo.remainingDays} ngày sử dụng` 
                  : "Gói tập đã hết hạn")
                : "Bạn chưa đăng ký gói tập nào"}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => router.push("/customer/membership")}>
              <p className="text-blue-600"> Xem chi tiết </p>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buổi tập sắp tới</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {nextSession 
                  ? new Date(nextSession.sessionBeginTime).toLocaleDateString('vi-VN') 
                  : "Không có lịch"}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextSession 
                  ? `${new Date(nextSession.sessionBeginTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} với PT ${nextSession.trainer}`
                  : "Bạn chưa có buổi tập nào với PT"}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => router.push("/customer/training-history")}>
              <p className="text-blue-600"> Xem lịch sử tập </p>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thanh toán</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {hasUnpaidPayments ? "Có khoản chưa thanh toán" : "Đã thanh toán đủ"}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasUnpaidPayments 
                  ? "Bạn có khoản phí chưa thanh toán" 
                  : "Tất cả các khoản phí đã được thanh toán"}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => router.push("/customer/payment")}>
              <p className="text-blue-600"> Chi tiết thanh toán </p>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Các hoạt động và thay đổi gần đây</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.length > 0 ? (
              sessions.slice(0, 3).map((session, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Buổi tập {new Date(session.sessionEndTime) < new Date() ? "đã hoàn thành" : "đã đặt lịch"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.sessionEndTime) < new Date() 
                        ? `Bạn đã hoàn thành buổi tập với PT ${session.trainer} vào ngày ${new Date(session.sessionBeginTime).toLocaleDateString('vi-VN')}`
                        : `Bạn có lịch tập với PT ${session.trainer} vào ngày ${new Date(session.sessionBeginTime).toLocaleDateString('vi-VN')}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có hoạt động nào gần đây</p>
            )}
            
            {payments.length > 0 && (
              <div className="flex items-start space-x-4">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{payments[0].paid ? "Thanh toán thành công" : "Chờ thanh toán"}</p>
                  <p className="text-sm text-muted-foreground">
                    {payments[0].paid 
                      ? `Bạn đã thanh toán ${payments[0].amount.toLocaleString('vi-VN')} VND vào ngày ${new Date(payments[0].date).toLocaleDateString('vi-VN')}`
                      : `Bạn có khoản thanh toán ${payments[0].amount.toLocaleString('vi-VN')} VND đang chờ thanh toán`}
                  </p>
                </div>
              </div>
            )}
            
            {membershipInfo && (
              <div className="flex items-start space-x-4">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Đăng ký gói tập</p>
                  <p className="text-sm text-muted-foreground">
                    Gói tập {membershipInfo.membershipName} của bạn đã được kích hoạt từ ngày {new Date(membershipInfo.beginDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="flex items-center" onClick={() => router.push("/customer/training-history")}>
              <span className="text-blue-600">Xem tất cả</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Đánh giá</CardTitle>
            <CardDescription>Chia sẻ trải nghiệm tập luyện của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ và trải nghiệm tập luyện cho tất cả hội viên.
            </p>
            
            <Textarea
              placeholder="Chia sẻ cảm nhận của bạn về phòng tập, dịch vụ, huấn luyện viên..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-24"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button className="text-yellow-700" variant="outline" onClick={() => router.push("/customer/review")} >
              <p className="text-yellow-700"> Xem tất cả đánh giá </p>
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmittingReview} className="bg-blue-600 hover:bg-blue-700">
              {isSubmittingReview ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Gửi đánh giá
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}