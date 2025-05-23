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
import { Eye, Pencil, Trash, Plus, X, CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from 'date-fns/locale';

interface User {
  userId: number;
  username: string;
  password: string;
  role: string;
  roleId: number;
  createAt: string;
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  customerId?: number;
  staffId?: number;
  rank?: string;
}

interface UserFormData {
  username: string;
  password: string;
  roleid: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender: string;
  age: string;
}

interface SearchFilters {
  name: string;
  email: string;
  role: string;
  gender: string;
  age: string;
  phone: string;
  createDate: Date | undefined;
}

const UserManagePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    name: '',
    email: '',
    role: 'all',
    gender: 'all',
    age: '',
    phone: '',
    createDate: undefined,
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showViewDialog, setShowViewDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    roleid: '4', // ID của customer , DB đổi => đổi
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    gender: 'M',
    age: '18',
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/getUserInfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || '1',
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.list);
      } else {
        toast.error('Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      toast.error('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSelectChange = (name: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setSearchFilters(prev => ({ ...prev, createDate: date }));
    if (date) {
      setCurrentMonth(date);
    }
  };

  const clearSearchFilters = () => {
    setSearchFilters({
      name: '',
      email: '',
      role: 'all',
      gender: 'all',
      age: '',
      phone: '',
      createDate: undefined,
    });
  };

  const filteredUsers = users.filter(user => {
    if (searchFilters.name) {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      if (!fullName.includes(searchFilters.name.toLowerCase())) {
        return false;
      }
    }
    
    if (searchFilters.email && user.email) {
      if (!user.email.toLowerCase().includes(searchFilters.email.toLowerCase())) {
        return false;
      }
    } else if (searchFilters.email && !user.email) {
      return false; 
    }
    
    if (searchFilters.role && searchFilters.role !== "all" && user.role && user.role.toLowerCase() !== searchFilters.role.toLowerCase()) {
      return false;
    }
    
    if (searchFilters.gender && searchFilters.gender !== "all" && user.gender !== searchFilters.gender) {
      return false;
    }
    
    if (searchFilters.age && user.age !== undefined && user.age !== null) {
      if (!user.age.toString().includes(searchFilters.age)) {
        return false;
      }
    } else if (searchFilters.age && (user.age === undefined || user.age === null)) {
      return false; 
    }
    
    if (searchFilters.phone && user.phone) {
      if (!user.phone.toLowerCase().includes(searchFilters.phone.toLowerCase())) {
        return false;
      }
    } else if (searchFilters.phone && !user.phone) {
      return false; 
    }
    
    if (searchFilters.createDate) {
      const userCreateDate = new Date(user.createAt);
      const filterDate = searchFilters.createDate;
      
      if (
        userCreateDate.getDate() !== filterDate.getDate() ||
        userCreateDate.getMonth() !== filterDate.getMonth() ||
        userCreateDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }
    
    return true;
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || '1',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status === 'Thêm người dùng thành công') {
        toast.success('Thêm người dùng thành công');
        setShowAddDialog(false);
        setFormData({
          username: '',
          password: '',
          roleid: '4',
          firstname: '',
          lastname: '',
          email: '',
          phone: '',
          gender: 'M',
          age: '18',
        });
        fetchUsers(); 
      } else {
        toast.error(data.status || 'Lỗi khi thêm người dùng');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Đã xảy ra lỗi khi thêm người dùng');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const accountResponse = await fetch('http://localhost:3001/updateAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      
      const accountData = await accountResponse.json();
      
      let infoResponse;
      if (selectedUser.userType === 'customer') {
        infoResponse = await fetch('http://localhost:3001/updateInfoCustomer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token') || '',
          },
          body: JSON.stringify({
            id: selectedUser.customerId,
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            phone: formData.phone,
            age: parseInt(formData.age),
          }),
        });
      } else {
        infoResponse = await fetch('http://localhost:3001/updateInfostaff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token') || '',
          },
          body: JSON.stringify({
            id: selectedUser.staffId,
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            phone: formData.phone,
            age: parseInt(formData.age),
            rank: selectedUser.rank || 'Junior',
          }),
        });
      }
      
      const infoData = await infoResponse.json();
      
      if (accountData.status.includes('thành công') && infoData.status.includes('thành công')) {
        toast.success('Cập nhật người dùng thành công');
        setShowEditDialog(false);
        fetchUsers(); 
      } else {
        toast.error('Lỗi khi cập nhật người dùng');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật người dùng');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch('http://localhost:3001/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify({
          username: selectedUser.username,
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'Xóa người dùng thành công') {
        toast.success('Xóa người dùng thành công');
        setShowDeleteDialog(false);
        fetchUsers(); 
      } else {
        toast.error(data.status || 'Lỗi khi xóa người dùng');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Đã xảy ra lỗi khi xóa người dùng');
    }
  };

  const getGenderDisplay = (genderCode: string): string => {
    switch(genderCode) {
      case 'M': return 'Nam';
      case 'F': return 'Nữ';
      case 'O': return 'Khác';
      default: return genderCode;
    }
  };

  const getRoleDisplay = (role: string): string => {
    switch(role.toLowerCase()) {
      case 'pt': return 'Người dạy';
      case 'customer': return 'Khách hàng';
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý phòng tập';
      default: return role;
    }
  };

  const showEditForm = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: user.password, 
      roleid: user.roleId.toString(),
      firstname: user.firstName,
      lastname: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      age: user.age.toString(),
    });
    setShowEditDialog(true);
  };

  const showDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  return (
    <div className="w-full p-4">      
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tìm kiếm</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearSearchFilters} size="sm">
              <X className="h-4 w-4 mr-2" /> Xóa bộ lọc
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" /> Thêm người dùng
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Thêm người dùng mới</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Tài khoản
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Mật khẩu
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roleid" className="text-right">
                      Vai trò
                    </Label>
                    <Select 
                      value={formData.roleid} 
                      onValueChange={(value) => handleSelectChange('roleid', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">Hội viên</SelectItem>
                        <SelectItem value="3">Huấn luyện viên</SelectItem>
                        <SelectItem value="2">Quản lý</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstname" className="text-right">
                      Họ
                    </Label>
                    <Input
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastname" className="text-right">
                      Tên
                    </Label>
                    <Input
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gender" className="text-right">
                      Giới tính
                    </Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Nam</SelectItem>
                        <SelectItem value="F">Nữ</SelectItem>
                        <SelectItem value="O">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right">
                      Tuổi
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" onClick={handleAddUser}>
                    Thêm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              name="name"
              placeholder="Tìm theo họ tên"
              value={searchFilters.name}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="Tìm theo email"
              value={searchFilters.email}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select 
              value={searchFilters.role}
              onValueChange={(value) => handleSearchSelectChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pt">Người dạy</SelectItem>
                <SelectItem value="customer">Khách hàng</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="manager">Quản lý phòng tập</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="gender">Giới tính</Label>
            <Select 
              value={searchFilters.gender}
              onValueChange={(value) => handleSearchSelectChange('gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="M">Nam</SelectItem>
                <SelectItem value="F">Nữ</SelectItem>
                <SelectItem value="O">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="age">Tuổi</Label>
            <Input
              id="age"
              name="age"
              placeholder="Tìm theo tuổi"
              value={searchFilters.age}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Tìm theo SĐT"
              value={searchFilters.phone}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="createDate">Ngày tạo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {searchFilters.createDate ? (
                    format(searchFilters.createDate, 'dd/MM/yyyy', { locale: vi })
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        const newDate = new Date(currentMonth);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCurrentMonth(newDate);
                      }}
                    >
                      <span className="sr-only">Tháng trước</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Button>
                    <div className="flex gap-1 items-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          const newDate = new Date(currentMonth);
                          newDate.setFullYear(newDate.getFullYear() - 1);
                          setCurrentMonth(newDate);
                        }}
                      >
                        <span className="sr-only">Năm trước</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/></svg>
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        <Select
                          value={(currentMonth.getMonth() + 1).toString()}
                          onValueChange={(value) => {
                            const month = parseInt(value) - 1;
                            const newDate = new Date(currentMonth);
                            newDate.setMonth(month);
                            setCurrentMonth(newDate);
                          }}
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue>
                              {format(currentMonth, 'MMMM', { locale: vi })}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Tháng 1</SelectItem>
                            <SelectItem value="2">Tháng 2</SelectItem>
                            <SelectItem value="3">Tháng 3</SelectItem>
                            <SelectItem value="4">Tháng 4</SelectItem>
                            <SelectItem value="5">Tháng 5</SelectItem>
                            <SelectItem value="6">Tháng 6</SelectItem>
                            <SelectItem value="7">Tháng 7</SelectItem>
                            <SelectItem value="8">Tháng 8</SelectItem>
                            <SelectItem value="9">Tháng 9</SelectItem>
                            <SelectItem value="10">Tháng 10</SelectItem>
                            <SelectItem value="11">Tháng 11</SelectItem>
                            <SelectItem value="12">Tháng 12</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={currentMonth.getFullYear().toString()}
                          onValueChange={(value) => {
                            const year = parseInt(value);
                            const newDate = new Date(currentMonth);
                            newDate.setFullYear(year);
                            setCurrentMonth(newDate);
                          }}
                        >
                          <SelectTrigger className="h-8 w-[80px] text-xs">
                            <SelectValue>
                              {currentMonth.getFullYear().toString()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          const newDate = new Date(currentMonth);
                          newDate.setFullYear(newDate.getFullYear() + 1);
                          setCurrentMonth(newDate);
                        }}
                      >
                        <span className="sr-only">Năm sau</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5M6 17l5-5-5-5"/></svg>
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        const newDate = new Date(currentMonth);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrentMonth(newDate);
                      }}
                    >
                      <span className="sr-only">Tháng sau</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={searchFilters.createDate}
                    onSelect={handleDateChange}
                    initialFocus
                    month={currentMonth}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <Table>
        <TableCaption>Danh sách người dùng trong hệ thống</TableCaption>
        <TableHeader>
          <TableRow className="bg-blue-500">
            <TableHead className="text-white">ID</TableHead>
            <TableHead className="text-white">Họ và tên</TableHead>
            <TableHead className="text-white">Tài khoản</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Vai trò</TableHead>
            <TableHead className="text-white">Giới tính</TableHead>
            <TableHead className="text-white">Ngày tạo</TableHead>
            <TableHead className="text-white text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">Đang tải dữ liệu...</TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">Không tìm thấy người dùng nào</TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.userId} className="hover:bg-gray-50">
                <TableCell className="font-medium">{user.userId}</TableCell>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleDisplay(user.role)}</TableCell>
                <TableCell>{getGenderDisplay(user.gender)}</TableCell>
                <TableCell>{new Date(user.createAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-green-600 hover:text-green-800 hover:bg-green-100"
                    >
                      <Link href={`/admin/user-manage/${user.userId}`}>
                        <Eye size={18} />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      onClick={() => showEditForm(user)}
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      onClick={() => showDeleteConfirm(user)}
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Tài khoản
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mật khẩu mới
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                className="col-span-3"
                placeholder="Để trống nếu không đổi"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstname" className="text-right">
                Họ
              </Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastname" className="text-right">
                Tên
              </Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Tuổi
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Giới tính
              </Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleSelectChange('gender', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Nam</SelectItem>
                  <SelectItem value="F">Nữ</SelectItem>
                  <SelectItem value="O">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <Button type="submit" onClick={handleUpdateUser}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.username}</strong>?</p>
            <p className="text-red-500 text-sm mt-2">Lưu ý: Hành động này không thể hoàn tác.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-500">Thông tin tài khoản</h3>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">ID:</span>
                    <span className="col-span-2 font-medium">{selectedUser.userId}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">Tài khoản:</span>
                    <span className="col-span-2 font-medium">{selectedUser.username}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">Vai trò:</span>
                    <span className="col-span-2 font-medium">{getRoleDisplay(selectedUser.role)}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">Ngày tạo:</span>
                    <span className="col-span-2 font-medium">
                      {new Date(selectedUser.createAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-500">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">Họ và tên:</span>
                    <span className="col-span-2 font-medium">{`${selectedUser.firstName} ${selectedUser.lastName}`}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">Email:</span>
                    <span className="col-span-2 font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">Điện thoại:</span>
                    <span className="col-span-2 font-medium">{selectedUser.phone}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">Giới tính:</span>
                    <span className="col-span-2 font-medium">{getGenderDisplay(selectedUser.gender)}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-gray-700">Tuổi:</span>
                    <span className="col-span-2 font-medium">{selectedUser.age}</span>
                  </div>
                </div>
              </div>

              {selectedUser.userType === 'staff' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-500 mb-2">Thông tin nhân viên</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-3 items-center gap-2">
                      <span className="text-gray-700">ID nhân viên:</span>
                      <span className="col-span-2 font-medium">{selectedUser.staffId}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <span className="text-gray-700">Cấp bậc:</span>
                      <span className="col-span-2 font-medium">{selectedUser.rank || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.userType === 'customer' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-500 mb-2">Thông tin khách hàng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-3 items-center gap-2">
                      <span className="text-gray-700">ID khách hàng:</span>
                      <span className="col-span-2 font-medium">{selectedUser.customerId}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagePage;