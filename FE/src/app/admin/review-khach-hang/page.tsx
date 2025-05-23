"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Flag } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

interface Review {
  reviewId: number;
  customer: string;
  text: string;
  date: string;
  userAvatar?: string;
}

export default function ReviewManagementPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [flaggedReviews, setFlaggedReviews] = useState<number[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/getReviews`);
      
      if (response.status === 200 && response.data.status.includes("thành công")) {
        const apiReviews = response.data.data || [];
        
        const formattedReviews: Review[] = apiReviews.map((review: any) => {
          return {
            reviewId: review.reviewId,
            customer: review.customer || "Unknown User",
            text: review.text || "",
            date: review.date || new Date().toISOString(),
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

  const handleFlagReview = (reviewId: number) => {
    if (flaggedReviews.includes(reviewId)) {
      setFlaggedReviews(flaggedReviews.filter(id => id !== reviewId));
      toast({
        title: "Thành công",
        description: "Đã bỏ đánh dấu đánh giá",
      });
    } else {
      setFlaggedReviews([...flaggedReviews, reviewId]);
      toast({
        title: "Thành công",
        description: "Đã đánh dấu đánh giá để xem xét",
      });
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

  const filteredReviews = activeTab === 'all' 
    ? reviews 
    : reviews.filter(review => flaggedReviews.includes(review.reviewId));

  return (
    <div className="space-y-6">
      
      <div className="grid gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted">
            <CardTitle>Tổng quan đánh giá</CardTitle>
            <CardDescription>
              Thống kê đánh giá của khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-lg border">
                <h3 className="font-medium">Tổng số đánh giá</h3>
                <p className="text-3xl font-bold mt-2">{reviews.length}</p>
              </div>
              <div className="bg-background p-4 rounded-lg border">
                <h3 className="font-medium">Đánh giá đánh dấu</h3>
                <p className="text-3xl font-bold mt-2">{flaggedReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tất cả đánh giá</TabsTrigger>
          <TabsTrigger value="flagged">Đánh giá đánh dấu</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'Tất cả đánh giá' : 'Đánh giá đánh dấu'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'all' ? 'Danh sách tất cả đánh giá từ khách hàng' : 'Danh sách đánh giá cần xem xét'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <div key={review.reviewId} className="border-b pb-6 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {review.userAvatar ? (
                              <AvatarImage src={review.userAvatar} />
                            ) : null}
                            <AvatarFallback>
                              {review.customer.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm">
                              {review.customer}
                              {flaggedReviews.includes(review.reviewId) && (
                                <span className="ml-2 text-xs text-warning-foreground bg-warning px-2 py-0.5 rounded">Đánh dấu</span>
                              )}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                ReviewID: {review.reviewId} | {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleFlagReview(review.reviewId)}
                            className={flaggedReviews.includes(review.reviewId) ? "bg-warning text-warning-foreground" : ""}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            {flaggedReviews.includes(review.reviewId) ? "Bỏ đánh dấu" : "Đánh dấu"}
                          </Button>
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
                    {activeTab === 'all' ? 'Chưa có đánh giá nào' : 'Chưa có đánh giá nào được đánh dấu'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}