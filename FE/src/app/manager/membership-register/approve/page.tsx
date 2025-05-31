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
  DialogFooter
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, CheckCircle, XCircle, Info, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/toast";
import axios from 'axios';

interface MemberRegister {
  id: number;
  customerId: number;
  customerName: string;
  membershipId: number;
  membershipName: string;
  price: number;
  status: string;
  createdAt: string;
  beginAt?: string;
  endAt?: string;
}

const MembershipRegisterApprovePage: React.FC = () => {
  const [registers, setRegisters] = useState<MemberRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [currentRegister, setCurrentRegister] = useState<MemberRegister | null>(null);
  const [beginDate, setBeginDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateValues, setDateValues] = useState({
    beginAt: '',
    endAt: ''
  });
  const { toast } = useToast();
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extendCustomerId, setExtendCustomerId] = useState<number | null>(null);

  useEffect(() => {
    fetchRegisters();
  }, [statusFilter]);

  const updateExpiredStatus = (registers: MemberRegister[]): MemberRegister[] => {
    const today = new Date();

    return registers.map(register => {
      if (register.status === 'Đã đăng ký' && register.endAt) {
        const endDate = new Date(register.endAt);
        console.log(`Kiểm tra hết hạn cho ${register.id}: EndDate=${register.endAt}, Today=${today.toISOString()}`);

        if (endDate < today) {
          console.log(`Gói tập ${register.id} đã hết hạn`);
          return { ...register, status: 'hết hạn' };
        }
      }
      return register;
    });
  };

  const fetchRegisters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Không tìm thấy token xác thực');
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại để tiếp tục",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/manager/getMemberRegister`, {
        headers: {
          'token': token
        },
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });

      if (response.data.status && response.data.list) {
        const formattedRegisters = response.data.list.map((register: any) => ({
          ...register,
          customerName: register.customerName || 'N/A',
          membershipName: register.membershipName || 'N/A',
          price: register.price || 0,
          status: register.status || 'pending',
          createdAt: register.createdAt || new Date().toISOString()
        }));

        if (originalOrder.length === 0 || statusFilter !== 'all') {
          setOriginalOrder(formattedRegisters.map((register: any) => register.id));
        }

        const updatedRegisters = updateExpiredStatus(formattedRegisters);
        setRegisters(updatedRegisters);
      } else {
        setError('Không có dữ liệu đăng ký');
        toast({
          title: "Thông báo",
          description: response.data.status || 'Không có dữ liệu đăng ký',
          variant: "default",
        });
      }
    } catch (err: any) {
      console.error('Error fetching registers:', err);
      setError(err.message || 'Đã xảy ra lỗi khi lấy dữ liệu');
      toast({
        title: "Lỗi",
        description: `Không thể tải dữ liệu đăng ký: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (register: MemberRegister) => {
    setCurrentRegister(register);
    setIsDetailsOpen(true);
  };

  const handleApproveClick = (register: MemberRegister) => {
    setCurrentRegister(register);
    setBeginDate(new Date());
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setEndDate(nextMonth);
    setIsApproveDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!currentRegister || !beginDate || !endDate) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại để tiếp tục",
          variant: "destructive",
        });
        return;
      }

      const requestData = {
        memberRegId: currentRegister.id.toString(),
        status: 'Đã đăng ký',
        beginAt: format(beginDate, 'dd-MM-yyyy'),
        endAt: format(endDate, 'dd-MM-yyyy')
      };

      console.log('Gửi request phê duyệt:', requestData);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/updateMemberRegister`,
        requestData,
        {
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        toast({
          title: "Thành công",
          description: response.data.status || "Phê duyệt đăng ký thành công",
          variant: "default",
        });
        fetchRegisters();
        setIsApproveDialogOpen(false);
        setCurrentRegister(null);
      }
    } catch (err: any) {
      console.error('Lỗi khi phê duyệt:', err);
      console.error('Response error:', err.response?.data);
      toast({
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể phê duyệt đăng ký",
        variant: "destructive",
      });
    }
  };

  const checkExpired = (register: MemberRegister): boolean => {
    if (!register.endAt || register.status !== 'Đã đăng ký') {
      return false;
    }

    const today = new Date();
    const endDate = new Date(register.endAt);

    return today > endDate;
  };

  const handleExtendClick = (register: MemberRegister) => {
    setCurrentRegister(register);

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setBeginDate(today);
    setEndDate(nextMonth);

    setDateValues({
      beginAt: today.toISOString().split('T')[0],
      endAt: nextMonth.toISOString().split('T')[0]
    });

    setIsExtendDialogOpen(true);
  };

  const handleDateChange = (name: string, value: string) => {
    setDateValues(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'beginAt') {
      setBeginDate(value ? new Date(value) : undefined);
    } else if (name === 'endAt') {
      setEndDate(value ? new Date(value) : undefined);
    }
  };

  const handleExtend = async () => {
    if (!currentRegister || !beginDate || !endDate) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại để tiếp tục",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/updateMemberRegister`,
        {
          memberRegId: currentRegister.id,
          status: 'Đã đăng ký',
          beginAt: format(beginDate, 'dd-MM-yyyy'),
          endAt: format(endDate, 'dd-MM-yyyy')
        },
        {
          headers: {
            'token': token
          }
        }
      );

      if (response.data.status) {
        toast({
          title: "Thành công",
          description: "Gia hạn gói tập thành công",
          variant: "default",
        });
        fetchRegisters();
        setIsExtendDialogOpen(false);
        setCurrentRegister(null);
      }
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể gia hạn gói tập",
        variant: "destructive",
      });
    }
  };

  const syncExpiredStatus = async (registerId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại để tiếp tục",
          variant: "destructive",
        });
        return;
      }

      const requestData = {
        memberRegId: registerId.toString(),
        status: 'hết hạn'
      };

      console.log('Gửi request cập nhật hết hạn:', requestData);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/updateMemberRegister`,
        requestData,
        {
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        toast({
          title: "Thành công",
          description: response.data.status || "Đã cập nhật trạng thái hết hạn",
          variant: "default",
        });
        fetchRegisters();
      }
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      console.error('Response error:', err.response?.data);
      toast({
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể cập nhật trạng thái hết hạn",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'đang chờ':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3">Đang chờ</Badge>;
      case 'đã đăng ký':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white py-1 px-3">Đã đăng ký</Badge>;
      case 'hết hạn':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white py-1 px-3">Hết hạn</Badge>;
      case 'gia hạn':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-3">Gia hạn</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3">{status}</Badge>;
    }
  };

  const sortedRegisters = [...registers].sort((a, b) => {
    const indexA = originalOrder.indexOf(a.id);
    const indexB = originalOrder.indexOf(b.id);

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Xét duyệt đăng ký gói tập</h1>

      <div className="flex justify-between mb-4">
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="Đã đăng ký">Đã đăng ký</SelectItem>
            <SelectItem value="hết hạn">Hết hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableCaption>Danh sách đăng ký gói tập</TableCaption>
        <TableHeader>
          <TableRow className="bg-blue-500 text-white">
            <TableHead className="text-center">STT</TableHead>
            <TableHead className="text-left">Khách hàng</TableHead>
            <TableHead className="text-left">Gói tập</TableHead>
            <TableHead className="text-center">Giá (VNĐ)</TableHead>
            <TableHead className="text-center">Ngày đăng ký</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRegisters.length > 0 ? (
            sortedRegisters.map((register, index) => (
              <TableRow key={register.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell className="text-left">{register.customerName || 'N/A'}</TableCell>
                <TableCell className="text-left">{register.membershipName || 'N/A'}</TableCell>
                <TableCell className="text-center font-medium text-green-600">
                  {register.price ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(register.price) : '0 VNĐ'}
                </TableCell>
                <TableCell className="text-center">{register.createdAt ? format(new Date(register.createdAt), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                <TableCell className="text-center">{getStatusBadge(register.status || 'pending')}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleViewDetails(register)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Info size={18} />
                    </button>

                    {(register.status.toLowerCase() === 'pending' || register.status.toLowerCase() === 'đang chờ') && (
                      <button
                        onClick={() => handleApproveClick(register)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Duyệt đăng ký"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}

                    {(register.status.toLowerCase() === 'đã đăng ký' && checkExpired(register)) && (
                      <button
                        onClick={() => syncExpiredStatus(register.id)}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Cập nhật trạng thái hết hạn"
                      >
                        <AlertCircle size={18} />
                      </button>
                    )}

                    {(register.status.toLowerCase() === 'gia hạn') && (
                      <button
                        onClick={() => handleExtendClick(register)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                        title="Gia hạn gói tập"
                      >
                        <RefreshCw size={18} className="mr-1" />
                        <span>Gia hạn</span>
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                Không có dữ liệu đăng ký
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Dialog xem chi tiết */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết đăng ký</DialogTitle>
          </DialogHeader>
          {currentRegister && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-semibold">ID:</Label>
                <div className="col-span-2">{currentRegister.id || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-semibold">Khách hàng:</Label>
                <div className="col-span-2">{currentRegister.customerName || 'N/A'} (ID: {currentRegister.customerId || 'N/A'})</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-semibold">Gói tập:</Label>
                <div className="col-span-2">{currentRegister.membershipName || 'N/A'} (ID: {currentRegister.membershipId || 'N/A'})</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-semibold">Giá:</Label>
                <div className="col-span-2 font-medium text-green-600">
                  {currentRegister.price ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(currentRegister.price) : '0 VNĐ'}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-semibold">Ngày đăng ký:</Label>
                <div className="col-span-2">{currentRegister.createdAt ? format(new Date(currentRegister.createdAt), 'dd/MM/yyyy') : 'N/A'}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right font-semibold">Trạng thái:</Label>
                <div className="col-span-2">{getStatusBadge(currentRegister.status || 'pending')}</div>
              </div>
              {currentRegister.beginAt && currentRegister.endAt && (
                <>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right font-semibold">Ngày bắt đầu:</Label>
                    <div className="col-span-2">{format(new Date(currentRegister.beginAt), 'dd/MM/yyyy')}</div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right font-semibold">Ngày kết thúc:</Label>
                    <div className="col-span-2">{format(new Date(currentRegister.endAt), 'dd/MM/yyyy')}</div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog duyệt đăng ký */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt đăng ký gói tập</DialogTitle>
          </DialogHeader>
          {currentRegister && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Khách hàng:</Label>
                <div className="col-span-3">{currentRegister.customerName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Gói tập:</Label>
                <div className="col-span-3">{currentRegister.membershipName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beginAt" className="text-right">
                  Ngày bắt đầu
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {beginDate ? (
                          format(beginDate, "dd/MM/yyyy", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={beginDate}
                        onSelect={setBeginDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endAt" className="text-right">
                  Ngày kết thúc
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "dd/MM/yyyy", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleApprove}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận gia hạn */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu gia hạn gói tập</DialogTitle>
          </DialogHeader>
          {currentRegister && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Khách hàng:</Label>
                <div className="col-span-3 font-medium">{currentRegister.customerName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Gói tập:</Label>
                <div className="col-span-3">{currentRegister.membershipName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beginAt" className="text-right font-semibold">
                  Ngày bắt đầu mới
                </Label>
                <div className="col-span-3">
                  <Input
                    id="beginAt"
                    name="beginAt"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={dateValues.beginAt}
                    onChange={(e) => handleDateChange('beginAt', e.target.value)}
                    className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endAt" className="text-right font-semibold">
                  Ngày kết thúc mới
                </Label>
                <div className="col-span-3">
                  <Input
                    id="endAt"
                    name="endAt"
                    type="date"
                    min={dateValues.beginAt || new Date().toISOString().split('T')[0]}
                    value={dateValues.endAt}
                    onChange={(e) => handleDateChange('endAt', e.target.value)}
                    className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleExtend}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Xác nhận gia hạn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipRegisterApprovePage;