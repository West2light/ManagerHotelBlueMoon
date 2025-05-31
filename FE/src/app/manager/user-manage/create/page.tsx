'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { z } from 'zod';
import axios from 'axios';

// Định nghĩa schema cho form
const userFormSchema = z.object({
  phone: z.string().min(1, "Số điện thoại không được để trống").regex(/^\d+$/, "Số điện thoại phải gồm các chữ số"),
  namepackage: z.string().min(1, "Gói tập không được để trống"),
  status: z.string().min(1, "Trạng thái không được để trống"),
  beginAt: z.string().min(1, "Ngày bắt đầu không được để trống"),
  endAt: z.string().min(1, "Ngày kết thúc không được để trống"),
}).refine((data) => {
  if (data.beginAt && data.endAt) {
    const beginDate = new Date(data.beginAt);
    const endDate = new Date(data.endAt);
    return endDate >= beginDate;
  }
  return true;
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endAt"]
});

type UserFormData = z.infer<typeof userFormSchema>;

const API_URL = 'http://localhost:3001/manager';

const CreateUserPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<UserFormData>>({
    phone: '',
    namepackage: '',
    status: 'Đang chờ',
    beginAt: '',
    endAt: '',
  });

  // Thêm state để lưu giá trị ngày tháng gốc
  const [dateValues, setDateValues] = useState({
    beginAt: '',
    endAt: ''
  });

  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Thêm state để kiểm soát việc submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = React.useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
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

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/manager/getMembership`, {
        headers: {
          'token': token
        }
      });

      if (response.data.status && response.data.list) {
        setMemberships(response.data.list);
      }
    } catch (err: any) {
      console.error('Error fetching memberships:', err);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách gói tập",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Xóa lỗi khi người dùng nhập
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleDateChange = (name: string, value: string) => {
    // Cập nhật cả dateValues và formData
    setDateValues(prev => ({
      ...prev,
      [name]: value
    }));

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Xóa lỗi nếu có
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      userFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn sự kiện lan truyền

    // Kiểm tra kỹ lưỡng nếu đang trong quá trình submit thì không cho phép submit tiếp
    if (isSubmitting) {
      console.log('Đang trong quá trình submit, bỏ qua yêu cầu mới');
      return;
    }

    // Disable form elements để ngăn người dùng submit nhiều lần
    if (formRef.current) {
      const formElements = formRef.current.elements;
      for (let i = 0; i < formElements.length; i++) {
        (formElements[i] as HTMLElement).setAttribute('disabled', 'true');
      }
    }

    try {
      setIsSubmitting(true); // Bắt đầu quá trình submit
      console.log('Bắt đầu submit, isSubmitting =', true);

      // Kiểm tra validation trước khi submit
      if (!validateForm()) {
        setIsSubmitting(false);
        // Re-enable form elements
        if (formRef.current) {
          const formElements = formRef.current.elements;
          for (let i = 0; i < formElements.length; i++) {
            (formElements[i] as HTMLElement).removeAttribute('disabled');
          }
        }
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi xác thực",
          description: "Không tìm thấy token, vui lòng đăng nhập lại",
          variant: "destructive",
          duration: 3000,
        });
        setIsSubmitting(false);
        // Re-enable form elements
        if (formRef.current) {
          const formElements = formRef.current.elements;
          for (let i = 0; i < formElements.length; i++) {
            (formElements[i] as HTMLElement).removeAttribute('disabled');
          }
        }
        return;
      }

      // Kiểm tra ngày tháng
      if (!dateValues.beginAt || !dateValues.endAt) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc",
          variant: "destructive",
          duration: 3000,
        });
        setIsSubmitting(false);
        // Re-enable form elements
        if (formRef.current) {
          const formElements = formRef.current.elements;
          for (let i = 0; i < formElements.length; i++) {
            (formElements[i] as HTMLElement).removeAttribute('disabled');
          }
        }
        return;
      }

      // Format dữ liệu trước khi gửi
      const requestData = {
        phone: formData.phone?.trim(),
        namepackage: formData.namepackage?.trim(),
        status: formData.status,
        beginAt: formatDate(dateValues.beginAt),
        endAt: formatDate(dateValues.endAt)
      };

      console.log('Đang gửi request với data:', requestData);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/addMemberRegister`,
        requestData,
        {
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Nhận response:', response.data);

      if (response.data.status) {
        toast({
          title: "Thành công",
          description: response.data.status,
          variant: "default",
          duration: 3000
        });

        // Chuyển hướng ngay lập tức sau khi thành công
        router.push('/manager/user-manage');
      } else {
        toast({
          title: "Lỗi",
          description: response.data.message || "Đăng ký không thành công",
          variant: "destructive",
          duration: 3000
        });

        // Re-enable form elements
        if (formRef.current) {
          const formElements = formRef.current.elements;
          for (let i = 0; i < formElements.length; i++) {
            (formElements[i] as HTMLElement).removeAttribute('disabled');
          }
        }
      }
    } catch (error: any) {
      console.error('Lỗi khi đăng ký:', error);
      toast({
        title: "Lỗi",
        description: `Đã xảy ra lỗi khi đăng ký: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
        duration: 3000,
      });

      // Re-enable form elements
      if (formRef.current) {
        const formElements = formRef.current.elements;
        for (let i = 0; i < formElements.length; i++) {
          (formElements[i] as HTMLElement).removeAttribute('disabled');
        }
      }
    } finally {
      console.log('Kết thúc submit, isSubmitting =', false);
      setIsSubmitting(false);
    }
  };

  // Sửa lại hàm formatDate để xử lý chuỗi ngày tháng
  const formatDate = (dateString: string): string => {
    try {
      // Parse chuỗi ngày tháng từ input type="date" (format: YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(Number);

      // Kiểm tra tính hợp lệ của ngày tháng
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error('Invalid date format');
      }

      // Format lại theo yêu cầu của backend (DD-MM-YYYY)
      const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;

      console.log('Input date string:', dateString);
      console.log('Formatted date:', formattedDate);

      return formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error);
      throw new Error('Invalid date format');
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <Card className="w-full h-full overflow-auto border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-500 text-white">
          <CardTitle className="text-2xl font-bold">Đăng ký gói tập cho khách hàng</CardTitle>
          <CardDescription className="text-blue-100">
            Điền thông tin để đăng ký gói tập mới cho khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="phone" className="font-medium text-blue-700">Số điện thoại <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Nhập số điện thoại khách hàng"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className={`h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="namepackage" className="font-medium text-blue-700">Gói tập <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.namepackage}
                  onValueChange={(value) => handleSelectChange('namepackage', value)}
                >
                  <SelectTrigger className={`h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${errors.namepackage ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Chọn gói tập" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200">
                    {loading ? (
                      <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                    ) : memberships.length > 0 ? (
                      memberships.map((membership) => (
                        <SelectItem key={membership.id} value={membership.namepackage}>
                          {membership.namepackage} - {membership.price.toLocaleString('vi-VN')} VNĐ
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>Không có gói tập</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.namepackage && (
                  <p className="text-red-500 text-sm">{errors.namepackage}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="status" className="font-medium text-blue-700">Trạng thái <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className={`h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${errors.status ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200">
                    <SelectItem value="Đang chờ">Đang chờ</SelectItem>
                    <SelectItem value="Đã đăng ký">Đã đăng ký</SelectItem>
                    <SelectItem value="Hết hạn">Hết hạn</SelectItem>
                    <SelectItem value="Gia hạn">Gia hạn</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="beginAt" className="font-medium text-blue-700">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="beginAt"
                  name="beginAt"
                  type="date"
                  min={new Date().toISOString().split('T')[0]} // Không cho phép chọn ngày trong quá khứ
                  value={dateValues.beginAt}
                  onChange={(e) => handleDateChange('beginAt', e.target.value)}
                  className={`h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${errors.beginAt ? "border-red-500" : ""
                    }`}
                />
                {errors.beginAt && (
                  <p className="text-red-500 text-sm">{errors.beginAt}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="endAt" className="font-medium text-blue-700">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endAt"
                  name="endAt"
                  type="date"
                  min={dateValues.beginAt || new Date().toISOString().split('T')[0]} // Ngày kết thúc phải sau ngày bắt đầu
                  value={dateValues.endAt}
                  onChange={(e) => handleDateChange('endAt', e.target.value)}
                  className={`h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${errors.endAt ? "border-red-500" : ""
                    }`}
                />
                {errors.endAt && (
                  <p className="text-red-500 text-sm">{errors.endAt}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6 mt-8 border-t border-blue-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/manager/user-manage')}
                className="h-10 px-6 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="h-10 px-8 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đăng ký gói tập'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default CreateUserPage; 