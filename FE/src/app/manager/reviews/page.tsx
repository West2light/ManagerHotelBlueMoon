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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Search, Star, MessageSquare, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReviews, Review } from '@/services/reviewService';
import { useToast } from "@/components/ui/use-toast";

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (!token) {
          toast({
            title: "Lỗi",
            description: "Vui lòng đăng nhập để xem đánh giá",
            variant: "destructive",
          });
          return;
        }

        const data = await getReviews(token);
        setReviews(data);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đánh giá",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [toast]);

  const handleViewDetail = (review: Review) => {
    setCurrentReview(review);
    setIsDetailOpen(true);
  };

  // Lọc reviews theo từ khóa tìm kiếm
  const filteredReviews = reviews.filter(review => {
    const searchMatch =
      review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.text.toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Đánh giá của khách hàng</h1>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Lọc đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm theo tên, nội dung..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList>
          <TabsTrigger value="cards">Dạng thẻ</TabsTrigger>
          <TabsTrigger value="table">Dạng bảng</TabsTrigger>
        </TabsList>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReviews.map(review => (
              <Card key={review.reviewId} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{review.customer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.customer}</div>
                        <div className="text-sm text-gray-500">{format(new Date(review.date), 'dd/MM/yyyy')}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 line-clamp-3">{review.text}</p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-blue-600"
                    onClick={() => handleViewDetail(review)}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Table>
            <TableCaption>Danh sách đánh giá từ khách hàng</TableCaption>
            <TableHeader>
              <TableRow className="bg-blue-500 text-white">
                <TableHead>ID</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map(review => (
                <TableRow key={review.reviewId} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{review.reviewId}</TableCell>
                  <TableCell>{review.customer}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{review.text}</TableCell>
                  <TableCell>{format(new Date(review.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(review)}
                    >
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Dialog xem chi tiết */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
          </DialogHeader>

          {currentReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarFallback>{currentReview.customer.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-lg">{currentReview.customer}</div>
                    <div className="text-sm text-gray-500">ID: {currentReview.reviewId}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-gray-500 mt-1">
                    {format(new Date(currentReview.date), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{currentReview.text}</p>
              </div>

              <div className="flex space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Đánh giá: {format(new Date(currentReview.date), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>ID: {currentReview.reviewId}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ReviewsPage; 