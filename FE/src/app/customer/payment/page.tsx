"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, Receipt, FileText } from "lucide-react";

interface Payment {
  paymentId: number;
  customer: string;
  amount: number;
  method: string;
  paid: boolean;
  date: string;
  description?: string;
  membershipName?: string;
  invoiceNumber?: string;
}

export default function PaymentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId') || "1"; 
      
      const response = await fetch('http://localhost:3001/customer/getPayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || "1"
        },
        body: JSON.stringify({
          userId: userId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const formattedPayments = data.data.map((payment: any) => ({
          paymentId: payment.paymentId,
          customer: payment.customer,
          amount: payment.amount,
          method: payment.method,
          paid: payment.paid,
          date: payment.date,
          description: `Thanh toán ${payment.method}`,
          membershipName: "Gói tập",
          invoiceNumber: `INV-${payment.paymentId}`
        }));
        
        setPayments(formattedPayments);
      } else {
        console.error('Lỗi khi lấy thông tin thanh toán:', data.status);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin thanh toán:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  const getStatusBadge = (paid: boolean) => {
    return paid ? 
      <Badge className="bg-green-500">Đã thanh toán</Badge> : 
      <Badge className="bg-yellow-500">Đang xử lý</Badge>;
  };

  const pendingPayments = payments.filter(payment => !payment.paid);
  const paidPayments = payments.filter(payment => payment.paid);

  return (
    <div className="space-y-6">

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="paid">Đã thanh toán</TabsTrigger>
          <TabsTrigger value="pending">Đang xử lý</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thanh toán</CardTitle>
              <CardDescription>
                Tất cả các giao dịch thanh toán của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã hóa đơn</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map(payment => (
                      <TableRow key={payment.paymentId}>
                        <TableCell className="font-medium">
                          {payment.invoiceNumber}
                        </TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{getStatusBadge(payment.paid)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-muted-foreground">
                    Chưa có lịch sử thanh toán nào
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Đã thanh toán</CardTitle>
              <CardDescription>
                Các giao dịch đã hoàn thành thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : paidPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã hóa đơn</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidPayments.map(payment => (
                      <TableRow key={payment.paymentId}>
                        <TableCell className="font-medium">
                          {payment.invoiceNumber}
                        </TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Không có giao dịch nào đã thanh toán
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Đang xử lý</CardTitle>
              <CardDescription>
                Các giao dịch đang trong quá trình xử lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã hóa đơn</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map(payment => (
                      <TableRow key={payment.paymentId}>
                        <TableCell className="font-medium">
                          {payment.invoiceNumber}
                        </TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-muted-foreground">
                    Không có giao dịch nào đang xử lý
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Thông tin thanh toán</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Trong quy trình thanh toán, sau khi bạn đăng ký gói tập, bạn sẽ đến trực tiếp ký hợp đồng tập luyện cùng với Quản lý và thanh toán tại đó. 
            Quản lý sẽ lưu thông tin thanh toán cho bạn và bạn có thể xem trạng thái thanh toán gói tập và lịch sử thanh toán các gói tập của mình tại đây.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-medium mb-2">Phương thức thanh toán</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Tiền mặt</span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Chuyển khoản ngân hàng</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-medium mb-2">Thông tin liên hệ</h3>
              <p className="text-sm">
                Nếu bạn có bất kỳ câu hỏi nào về thanh toán, vui lòng liên hệ với quản lý tại quầy lễ tân hoặc gọi điện đến số:
              </p>
              <p className="font-medium mt-2">0123 456 789</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}