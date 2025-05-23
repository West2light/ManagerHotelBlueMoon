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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle2, XCircle, Loader2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { getPayments, updatePaymentStatus, addPayment, Payment } from '@/services/paymentService';
import { Toaster } from "@/components/ui/toaster";

// Mock data cho khách hàng - sẽ được thay thế bằng API khi có
const mockCustomers = [
  { id: "C001", name: "Nguyễn Văn A" },
  { id: "C002", name: "Trần Thị B" },
  { id: "C003", name: "Lê Văn C" },
  { id: "C004", name: "Phạm Thị D" },
  { id: "C005", name: "Hoàng Văn E" },
];

const PaymentManagePage: React.FC = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(mockCustomers);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  // State cho form thêm thanh toán mới
  const [newPayment, setNewPayment] = useState({
    phone: '',
    amount: '',
    paymentMethod: 'Tiền mặt',
    customPaymentMethod: '',
    paid: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomMethod, setIsCustomMethod] = useState(false);

  // Load data khi component được mount
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem danh sách thanh toán",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Tải danh sách thanh toán từ API
      const paymentsData = await getPayments(token);
      setPayments(paymentsData);

      // TODO: Tải danh sách khách hàng từ API khi endpoint được triển khai
      // Hiện tại vẫn tạm thời sử dụng danh sách khách hàng mẫu

    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu thanh toán:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải dữ liệu thanh toán",
        variant: "destructive",
      });
      // Set empty array to avoid undefined errors
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePaymentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại để cập nhật trạng thái",
          variant: "destructive",
        });
        return;
      }

      // Cập nhật UI ngay lập tức
      setPayments(prevPayments => prevPayments.map(payment => {
        if (payment.id === id) {
          return {
            ...payment,
            paid: !currentStatus
          };
        }
        return payment;
      }));

      // Gọi API cập nhật trạng thái thanh toán
      await updatePaymentStatus(token, id, !currentStatus);

      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? 'xác nhận' : 'hủy'} thanh toán`,
      });

    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái:", error);

      // Khôi phục lại UI về trạng thái ban đầu
      setPayments(prevPayments => prevPayments.map(payment => {
        if (payment.id === id) {
          return {
            ...payment,
            paid: currentStatus // Khôi phục trạng thái cũ
          };
        }
        return payment;
      }));

      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái thanh toán",
        variant: "destructive",
      });
    }
  };

  const handleSubmitNewPayment = async () => {
    // Kiểm tra form đầy đủ
    if (!newPayment.phone || !newPayment.amount) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin thanh toán",
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra phương thức thanh toán tùy chỉnh
    if (newPayment.paymentMethod === 'custom' && !newPayment.customPaymentMethod.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập phương thức thanh toán",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại để tiếp tục",
          variant: "destructive",
        });
        return;
      }

      // Parse số tiền thành số
      const amount = parseFloat(newPayment.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Lỗi",
          description: "Số tiền không hợp lệ",
          variant: "destructive",
        });
        return;
      }

      // Xác định phương thức thanh toán thực tế để gửi lên server
      const actualPaymentMethod = newPayment.paymentMethod === 'custom'
        ? newPayment.customPaymentMethod.trim()
        : newPayment.paymentMethod;

      console.log('Đang gửi thông tin thanh toán:', {
        phone: newPayment.phone,
        paymentMethod: actualPaymentMethod,
        amount: amount,
        paid: newPayment.paid
      });

      // Gọi API thêm thanh toán mới
      const result = await addPayment(
        token,
        newPayment.phone.trim(),
        actualPaymentMethod,
        amount,
        newPayment.paid
      );

      console.log('Kết quả thêm thanh toán:', result);

      // Thông báo thành công
      toast({
        title: "Thành công",
        description: "Đã thêm thanh toán mới",
      });

      // Đóng dialog và reset form
      setIsAddDialogOpen(false);
      resetPaymentForm();

      // Tải lại danh sách
      await fetchData();

    } catch (error: any) {
      console.error("Lỗi khi thêm thanh toán:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm thanh toán mới",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đảm bảo customPaymentMethod luôn là string khi reset form
  const resetPaymentForm = () => {
    setNewPayment({
      phone: '',
      amount: '',
      paymentMethod: 'Tiền mặt',
      customPaymentMethod: '',
      paid: false
    });
    setIsCustomMethod(false);
  };

  const getMethodText = (method: string) => {
    return method;
  };

  // Lọc thanh toán theo trạng thái và từ khóa tìm kiếm
  const filteredPayments = payments.filter(payment => {
    // Lọc theo trạng thái
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'paid') return payment.paid;
    if (selectedStatus === 'unpaid') return !payment.paid;
    return true;
  }).filter(payment => {
    // Tìm kiếm theo tên khách hàng hoặc ID
    if (!searchTerm || searchTerm.trim() === '') return true;

    // Chuyển chuỗi tìm kiếm thành chữ thường và bỏ dấu
    const normalizedSearchTerm = searchTerm.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    // Tách các từ trong chuỗi tìm kiếm
    const searchTerms = normalizedSearchTerm.split(/\s+/);

    // Chuyển tên khách hàng thành chữ thường và bỏ dấu để so sánh
    const normalizedCustomerName = payment.customerName
      ? payment.customerName.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      : '';

    // Kiểm tra ID
    const idMatch = payment.id && payment.id.toLowerCase().includes(normalizedSearchTerm);

    // Kiểm tra từng từ trong chuỗi tìm kiếm
    const nameMatch = searchTerms.every(term => normalizedCustomerName.includes(term));

    return idMatch || nameMatch;
  });

  // Thêm hàm mở dialog riêng để debug
  const openAddDialog = () => {
    console.log("Mở dialog thêm mới");
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Quản lý thanh toán</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="relative w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm theo tên khách hàng, ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchTerm('')}
              >
                <XCircle size={16} className="text-gray-500" />
              </Button>
            )}
          </div>

          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={openAddDialog}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm thanh toán
        </Button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có dữ liệu thanh toán
        </div>
      ) : (
        <Table>
          <TableCaption>Danh sách các khoản thanh toán</TableCaption>
          <TableHeader>
            <TableRow className="bg-blue-500 text-white">
              <TableHead>STT</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment, index) => (
              <TableRow key={payment.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{payment.customerName}</TableCell>
                <TableCell>{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{getMethodText(payment.paymentMethod)}</TableCell>
                <TableCell>
                  <Badge className={payment.paid ? "bg-green-500" : "bg-red-500"}>
                    {payment.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.createdAt ? format(new Date(payment.createdAt), 'dd/MM/yyyy') : 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  {!payment.paid ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePaymentStatus(payment.id!, payment.paid)}
                      title="Xác nhận đã thanh toán"
                    >
                      <CheckCircle2 size={18} className="text-green-600" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePaymentStatus(payment.id!, payment.paid)}
                      title="Đánh dấu chưa thanh toán"
                    >
                      <XCircle size={18} className="text-red-600" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog thêm thanh toán mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm thanh toán mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                className="col-span-3"
                placeholder="Nhập số điện thoại khách hàng"
                value={newPayment.phone}
                onChange={(e) => setNewPayment({ ...newPayment, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Số tiền
              </Label>
              <Input
                id="amount"
                className="col-span-3"
                placeholder="Nhập số tiền"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Phương thức
              </Label>
              <Select
                value={newPayment.paymentMethod}
                onValueChange={(value) => {
                  setNewPayment({ ...newPayment, paymentMethod: value });
                  setIsCustomMethod(value === 'custom');
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn phương thức thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                  <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                  <SelectItem value="Thẻ">Thẻ</SelectItem>
                  <SelectItem value="Ví Momo">Ví Momo</SelectItem>
                  <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                  <SelectItem value="custom">Khác (tự nhập)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCustomMethod && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customPaymentMethod" className="text-right">
                  Phương thức khác
                </Label>
                <Input
                  id="customPaymentMethod"
                  className="col-span-3"
                  placeholder="Nhập phương thức thanh toán"
                  value={newPayment.customPaymentMethod}
                  onChange={(e) => setNewPayment({ ...newPayment, customPaymentMethod: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentStatus" className="text-right">
                Trạng thái
              </Label>
              <Select
                value={newPayment.paid ? 'paid' : 'unpaid'}
                onValueChange={(value) => setNewPayment({ ...newPayment, paid: value === 'paid' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitNewPayment}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                </>
              ) : (
                'Thêm mới'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thêm Toaster component vào cuối component để hiển thị toast messages */}
      <Toaster />
    </div>
  );
};

export default PaymentManagePage; 