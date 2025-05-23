"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, ThumbsUp } from "lucide-react";
import axios from "axios";
import { getCurrentUser } from "@/utils/auth";

const API_BASE_URL = "http://localhost:3001";

interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  text: string;
  date: string;
  isOwn: boolean;
}

export default function ReviewPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState("write");
  const [newReview, setNewReview] = useState({
    text: ""
  });
  
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id ? parseInt(currentUser.id) : 0;
  const currentUserName = currentUser?.name || "Bạn";

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/getReviews`);
      
      if (response.status === 200 && response.data.status.includes("thành công")) {
        const apiReviews = response.data.data || [];
        console.log('API Reviews:', apiReviews);
        const formattedReviews: Review[] = apiReviews.map((review: any) => {
          const isCurrentUserReview = review.customerId === currentUserId;
          return {
            id: review.reviewId,
            userId: review.customerId || 0,
            userName: isCurrentUserReview ? currentUserName : (review.customer || "Unknown User"),
            text: review.text || "",
            date: review.date || new Date().toISOString(),
            isOwn: isCurrentUserReview
          };
        });
        
        const sortedReviews = [...formattedReviews].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setReviews(sortedReviews);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải đánh giá. " + (response.data.status || ""),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy đánh giá:', error);
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (newReview.text.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung đánh giá",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUserId) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để gửi đánh giá",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        console.log('Current User ID:', currentUserId);
        console.log('Đánh giá mới:', newReview);
      const response = await axios.post(`${API_BASE_URL}/customer/addReview`, {
        "userId": currentUserId,
        "text": newReview.text
      });
      
      if (response.status === 200 && response.data.status?.includes("thành công")) {
        const newReviewObj: Review = {
          id: response.data.reviewId,
          userId: currentUserId,
          userName: currentUserName,
          text: newReview.text,
          date: response.data.date || new Date().toISOString(),
          isOwn: true
        };
        
        setReviews([newReviewObj, ...reviews.filter(r => !r.isOwn)]);
        
        setNewReview({
          text: ""
        });
        
        toast({
          title: "Thành công",
          description: "Đánh giá của bạn đã được gửi thành công",
        });
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
      setIsSubmitting(false);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const userReviews = reviews.filter(review => review.isOwn);

  const switchToWriteTab = () => {
    setActiveTab("write");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="write">Viết đánh giá</TabsTrigger>
          <TabsTrigger value="all">Tất cả đánh giá</TabsTrigger>
          <TabsTrigger value="my">Đánh giá của tôi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write">
          <Card>
            <CardHeader>
              <CardTitle>Viết đánh giá mới</CardTitle>
              <CardDescription>
                Chia sẻ trải nghiệm của bạn với phòng tập
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Chia sẻ cảm nhận của bạn về phòng tập, dịch vụ, huấn luyện viên..."
                value={newReview.text}
                onChange={(e) => setNewReview({ text: e.target.value })}
                className="min-h-32"
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Gửi đánh giá
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả đánh giá</CardTitle>
              <CardDescription>
                Đánh giá từ các hội viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {review.userAvatar ? (
                              <AvatarImage src={review.userAvatar} />
                            ) : null}
                            <AvatarFallback>
                              {review.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm">
                              {review.userName}
                              {review.isOwn && (
                                <span className="ml-2 text-xs text-primary-foreground bg-primary px-2 py-0.5 rounded">Bạn</span>
                              )}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                      </div>
                      
                      <p className="mt-3 text-sm">
                        {review.text}
                      </p>
                      
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Chưa có đánh giá nào
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="my">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá của tôi</CardTitle>
              <CardDescription>
                Xem và quản lý đánh giá của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userReviews.length > 0 ? (
                <div className="space-y-6">
                  {userReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {review.userAvatar ? (
                              <AvatarImage src={review.userAvatar} />
                            ) : null}
                            <AvatarFallback>
                              {review.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm">{review.userName}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="mt-3 text-sm">
                        {review.text}
                      </p>
                      
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Bạn chưa có đánh giá nào. Hãy chia sẻ trải nghiệm của bạn!
                  </p>
                  <Button 
                    onClick={switchToWriteTab}
                    className="mt-4"
                  >
                    Viết đánh giá
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}