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
import { Search, PlusCircle, Edit, Trash, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  experience?: string;
  customerCount: number;
  status: 'available' | 'busy' | 'inactive';
  avatarUrl?: string;
}

// Dữ liệu mẫu về huấn luyện viên
const mockTrainers: Trainer[] = [
  {
    id: "T001",
    name: "Nguyễn Văn A",
    specialty: "Gym",
    email: "nguyenhlva@gym.com",
    phone: "0987654321",
    experience: "3 năm",
    customerCount: 3,
    status: 'available',
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: "T002",
    name: "Trần Thị B",
    specialty: "Yoga",
    email: "trantb@gym.com",
    phone: "0987654322",
    experience: "5 năm",
    customerCount: 5,
    status: 'busy',
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: "T003",
    name: "Lê Minh C",
    specialty: "Cardio",
    email: "leminhc@gym.com",
    phone: "0987654323",
    experience: "2 năm",
    customerCount: 2,
    status: 'available',
    avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    id: "T004",
    name: "Phạm Hương D",
    specialty: "CrossFit",
    email: "phamhuongd@gym.com",
    phone: "0987654324",
    experience: "4 năm",
    customerCount: 4,
    status: 'available',
    avatarUrl: "https://randomuser.me/api/portraits/women/24.jpg"
  },
  {
    id: "T005",
    name: "Hoàng Minh E",
    specialty: "Pilates",
    email: "hoangme@gym.com",
    phone: "0987654325",
    experience: "3 năm",
    customerCount: 0,
    status: 'inactive',
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg"
  },
];

const TrainerListPage: React.FC = () => {
  const { toast } = useToast();
  const [trainers, setTrainers] = useState<Trainer[]>(mockTrainers);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>(mockTrainers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    experience: "",
    status: "available",
  });

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrainers = filteredTrainers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);

  // Cập nhật danh sách đã lọc khi có thay đổi
  useEffect(() => {
    let results = trainers;

    // Lọc theo tìm kiếm
    if (searchTerm) {
      results = results.filter(
        trainer =>
          trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trainer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trainer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trainer.phone?.includes(searchTerm)
      );
    }

    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      results = results.filter(trainer => trainer.status === statusFilter);
    }

    // Lọc theo chuyên môn
    if (specialtyFilter !== 'all') {
      results = results.filter(trainer => trainer.specialty === specialtyFilter);
    }

    setFilteredTrainers(results);
    // Reset về trang đầu tiên khi thay đổi bộ lọc
    setCurrentPage(1);
  }, [searchTerm, statusFilter, specialtyFilter, trainers]);

  // Danh sách chuyên môn duy nhất từ dữ liệu huấn luyện viên
  const specialties = Array.from(new Set(trainers.map(trainer => trainer.specialty)));

  // Xử lý sự kiện xem chi tiết
  const handleViewClick = (trainer: Trainer) => {
    setCurrentTrainer(trainer);
    setIsViewDialogOpen(true);
  };

  // Xử lý sự kiện chỉnh sửa
  const handleEditClick = (trainer: Trainer) => {
    setCurrentTrainer(trainer);
    setFormData({
      name: trainer.name,
      specialty: trainer.specialty,
      email: trainer.email || "",
      phone: trainer.phone || "",
      experience: trainer.experience || "",
      status: trainer.status,
    });
    setIsEditDialogOpen(true);
  };

  // Xử lý sự kiện thêm mới
  const handleAddClick = () => {
    setFormData({
      name: "",
      specialty: "",
      email: "",
      phone: "",
      experience: "",
      status: "available",
    });
    setIsAddDialogOpen(true);
  };

  // Xử lý sự kiện xóa
  const handleDelete = (trainerId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa huấn luyện viên này?")) {
      setTrainers(trainers.filter(t => t.id !== trainerId));
      toast({
        title: "Đã xóa huấn luyện viên",
        description: "Huấn luyện viên đã được xóa khỏi hệ thống",
      });
    }
  };

  // Xử lý sự kiện lưu khi chỉnh sửa
  const handleEditSave = () => {
    if (!currentTrainer) return;

    const updatedTrainers = trainers.map(t => {
      if (t.id === currentTrainer.id) {
        return {
          ...t,
          name: formData.name,
          specialty: formData.specialty,
          email: formData.email,
          phone: formData.phone,
          experience: formData.experience,
          status: formData.status as 'available' | 'busy' | 'inactive',
        };
      }
      return t;
    });

    setTrainers(updatedTrainers);
    setIsEditDialogOpen(false);
    toast({
      title: "Thành công",
      description: "Đã cập nhật thông tin huấn luyện viên",
    });
  };

  // Xử lý sự kiện lưu khi thêm mới
  const handleAddSave = () => {
    // Kiểm tra dữ liệu nhập
    if (!formData.name || !formData.specialty) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tên và chuyên môn",
        variant: "destructive",
      });
      return;
    }

    // Tạo ID mới
    const newId = `T${(trainers.length + 1).toString().padStart(3, '0')}`;

    // Thêm huấn luyện viên mới
    const newTrainer: Trainer = {
      id: newId,
      name: formData.name,
      specialty: formData.specialty,
      email: formData.email,
      phone: formData.phone,
      experience: formData.experience,
      customerCount: 0,
      status: formData.status as 'available' | 'busy' | 'inactive',
      avatarUrl: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
    };

    setTrainers([...trainers, newTrainer]);
    setIsAddDialogOpen(false);
    toast({
      title: "Thành công",
      description: "Đã thêm huấn luyện viên mới",
    });
  };

  // Chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Quản lý huấn luyện viên</h1>

      {/* Thanh công cụ */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2 md:w-1/3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm tên, ID, email, SĐT..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 md:w-2/3 justify-end">
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc chuyên môn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuyên môn</SelectItem>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="available">Sẵn sàng</SelectItem>
              <SelectItem value="busy">Bận</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" /> Thêm mới
          </Button>
        </div>
      </div>

      {/* Bảng danh sách */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Tên huấn luyện viên</TableHead>
                <TableHead>Chuyên môn</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Số KH hiện tại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTrainers.length > 0 ? (
                currentTrainers.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell className="font-medium">{trainer.id}</TableCell>
                    <TableCell>{trainer.name}</TableCell>
                    <TableCell>{trainer.specialty}</TableCell>
                    <TableCell>{trainer.phone || "—"}</TableCell>
                    <TableCell>{trainer.customerCount}/5</TableCell>
                    <TableCell>
                      <Badge className={
                        trainer.status === 'available' ? "bg-green-500" :
                          trainer.status === 'busy' ? "bg-yellow-500" :
                            "bg-gray-500"
                      }>
                        {trainer.status === 'available' ? "Sẵn sàng" :
                          trainer.status === 'busy' ? "Bận" :
                            "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewClick(trainer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(trainer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(trainer.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Không tìm thấy huấn luyện viên nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Phân trang */}
      {filteredTrainers.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTrainers.length)} trên tổng số {filteredTrainers.length} huấn luyện viên
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <Button
                key={number}
                variant={currentPage === number ? "default" : "outline"}
                size="sm"
                onClick={() => paginate(number)}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog xem chi tiết */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Chi tiết huấn luyện viên</DialogTitle>
          </DialogHeader>

          {currentTrainer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {currentTrainer.avatarUrl && (
                  <img
                    src={currentTrainer.avatarUrl}
                    alt={currentTrainer.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{currentTrainer.name}</h3>
                  <Badge className={
                    currentTrainer.status === 'available' ? "bg-green-500" :
                      currentTrainer.status === 'busy' ? "bg-yellow-500" :
                        "bg-gray-500"
                  }>
                    {currentTrainer.status === 'available' ? "Sẵn sàng" :
                      currentTrainer.status === 'busy' ? "Bận" :
                        "Không hoạt động"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p>{currentTrainer.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Chuyên môn</p>
                  <p>{currentTrainer.specialty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{currentTrainer.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                  <p>{currentTrainer.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Kinh nghiệm</p>
                  <p>{currentTrainer.experience || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Số khách hàng hiện tại</p>
                  <p>{currentTrainer.customerCount}/5</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
            {currentTrainer && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEditClick(currentTrainer);
              }}>
                Chỉnh sửa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Chỉnh sửa huấn luyện viên</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Tên</Label>
              <Input
                id="edit-name"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên huấn luyện viên"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-specialty" className="text-right">Chuyên môn</Label>
              <Input
                id="edit-specialty"
                className="col-span-3"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Gym, Yoga, Cardio,..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">Số điện thoại</Label>
              <Input
                id="edit-phone"
                className="col-span-3"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0xxxxxxxxx"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-experience" className="text-right">Kinh nghiệm</Label>
              <Input
                id="edit-experience"
                className="col-span-3"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Ví dụ: 3 năm"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Sẵn sàng</SelectItem>
                  <SelectItem value="busy">Bận</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditSave}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Thêm huấn luyện viên mới</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-name" className="text-right">Tên <span className="text-red-500">*</span></Label>
              <Input
                id="add-name"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên huấn luyện viên"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-specialty" className="text-right">Chuyên môn <span className="text-red-500">*</span></Label>
              <Input
                id="add-specialty"
                className="col-span-3"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Gym, Yoga, Cardio,..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-email" className="text-right">Email</Label>
              <Input
                id="add-email"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-phone" className="text-right">Số điện thoại</Label>
              <Input
                id="add-phone"
                className="col-span-3"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0xxxxxxxxx"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-experience" className="text-right">Kinh nghiệm</Label>
              <Input
                id="add-experience"
                className="col-span-3"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Ví dụ: 3 năm"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-status" className="text-right">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Sẵn sàng</SelectItem>
                  <SelectItem value="busy">Bận</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddSave}>
              Thêm huấn luyện viên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainerListPage; 