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
import { Search, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { equipmentService, Equipment, SearchParams } from '@/services/equipmentService';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';
import { getCookie } from 'cookies-next';

interface DeleteDeviceProps {
  equipment: Equipment;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteDevice: React.FC<DeleteDeviceProps> = ({ equipment, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const token = getCookie('auth') ? JSON.parse(getCookie('auth') as string).token : null;

      console.log('Token:', token);
      console.log('Dữ liệu gửi đi:', {
        room_name: equipment.roomName,
        equipment_name: equipment.name
      });

      const response = await axios.post('http://localhost:3001/manager/deleteDevice', {
        room_name: equipment.roomName,
        equipment_name: equipment.name
      }, {
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
      });

      console.log('Response từ server:', response.data);

      if (response.data.status === "Xóa thiết bị thành công") {
        toast({
          title: "Thành công",
          description: "Xóa thiết bị thành công",
          variant: "default",
        });
        onSuccess();
      } else {
        toast({
          title: "Lỗi",
          description: response.data.message || "Không thể xóa thiết bị",
          variant: "destructive",
        });
      }
      onClose();
    } catch (error) {
      console.error('Lỗi khi xóa thiết bị:', error);
      if (axios.isAxiosError(error)) {
        console.error('Chi tiết lỗi:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        toast({
          title: "Lỗi",
          description: error.response?.data?.message || "Không thể xóa thiết bị",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa thiết bị</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Tên thiết bị:</Label>
            <div className="col-span-3">{equipment.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Phòng:</Label>
            <div className="col-span-3">{equipment.roomName}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleSubmit}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditDeviceProps {
  equipment: Equipment;
  onClose: () => void;
  onSuccess: (equipment: Equipment) => void;
}

const mapStatusToBackend = (status: string): string => {
  switch (status) {
    case 'good':
      return 'Hoạt động';
    case 'maintenance':
      return 'Bảo trì';
    case 'broken':
      return 'Hỏng';
    default:
      return status;
  }
};

const EditDevice = ({ equipment, onClose, onSuccess }: EditDeviceProps) => {
  const [editedEquipment, setEditedEquipment] = useState(equipment);
  const { toast } = useToast();

  const handleStatusChange = (value: string) => {
    setEditedEquipment({
      ...editedEquipment,
      status: value as 'good' | 'maintenance' | 'broken'
    });
  };

  const handleSubmit = async () => {
    try {
      const token = getCookie('auth') ? JSON.parse(getCookie('auth') as string).token : null;

      console.log('Token:', token);
      console.log('Dữ liệu gửi đi:', {
        room_name: editedEquipment.roomName,
        equipment_name: editedEquipment.name,
        status: editedEquipment.status
      });

      const response = await equipmentService.updateEquipment(
        editedEquipment.roomName,
        editedEquipment.name,
        editedEquipment.status,
        editedEquipment.quantity
      );

      console.log('Response từ server:', response);

      if (response.status === "Cập nhật thiết bị thành công") {
        toast({
          title: "Thành công",
          description: "Cập nhật thiết bị thành công",
          variant: "default",
        });
        onSuccess(editedEquipment);
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể cập nhật thiết bị",
          variant: "destructive",
        });
      }
      onClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật thiết bị:', error);
      if (axios.isAxiosError(error)) {
        console.error('Chi tiết lỗi:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        toast({
          title: "Lỗi",
          description: error.response?.data?.message || "Không thể cập nhật thiết bị",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thiết bị</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Tên thiết bị:</Label>
            <div className="col-span-3">{editedEquipment.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Phòng:</Label>
            <div className="col-span-3">{editedEquipment.roomName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Trạng thái
            </Label>
            <div className="col-span-3">
              <Select
                value={editedEquipment.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Hoạt động</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="broken">Hỏng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EquipmentListPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    roomName: '',
    quantity: 1,
    status: 'good' as 'good' | 'maintenance' | 'broken'
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const data = await equipmentService.getAllEquipments();
      setEquipments(data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thiết bị:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thiết bị",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEquipments = async () => {
    try {
      setIsLoading(true);

      const searchParams: any = {};

      if (searchTerm) {
        searchParams.roomEquipment = searchTerm.trim();
      }

      if (selectedStatus !== "all") {
        searchParams.status = selectedStatus;
        console.log("Đang tìm kiếm thiết bị với trạng thái:", selectedStatus);
      }

      if (selectedRoom !== "all") {
        searchParams.room_name = selectedRoom;
      }

      console.log("Params tìm kiếm:", searchParams);

      if (Object.keys(searchParams).length === 0) {
        const data = await equipmentService.getAllEquipments();
        console.log("Kết quả tìm kiếm tất cả thiết bị:", data);
        setEquipments(data || []);
      } else {
        const data = await equipmentService.findDevices(
          searchParams.room_name || "",
          searchParams.roomEquipment || "",
          searchParams.status || ""
        );

        let filteredData = [...data];

        if (searchTerm.trim() !== "") {
          const searchTermLower = searchTerm.trim().toLowerCase();
          filteredData = data.filter((item: Equipment) =>
            item.name.toLowerCase().includes(searchTermLower) ||
            item.roomName.toLowerCase().includes(searchTermLower)
          );
        }

        if (selectedStatus !== "all") {
          filteredData = filteredData.filter((item: Equipment) => item.status === selectedStatus);
          console.log("Sau khi lọc thêm ở FE:", filteredData);
        }

        setEquipments(filteredData);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách thiết bị:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thiết bị",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleSearch = () => {
    fetchEquipments();
  };

  const uniqueRooms = Array.from(new Set(equipments.map(eq => eq.roomName)));

  const groupedByRoom = uniqueRooms.map(roomName => {
    const roomEquipments = equipments.filter(eq => eq.roomName === roomName);
    return {
      roomName,
      equipments: roomEquipments
    };
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-500">Hoạt động</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500">Bảo trì</Badge>;
      case 'broken':
        return <Badge className="bg-red-500">Hỏng</Badge>;
      default:
        return <Badge className="bg-gray-500">Không xác định</Badge>;
    }
  };

  const handleEditClick = (equipment: Equipment) => {
    setCurrentEquipment(equipment);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedEquipment: Equipment) => {
    const updatedEquipments = equipments.map(eq =>
      eq.id === updatedEquipment.id ? updatedEquipment : eq
    );
    setEquipments(updatedEquipments);
  };

  const handleDeleteClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    const updatedEquipments = equipments.filter(eq => eq.id !== selectedEquipment?.id);
    setEquipments(updatedEquipments);
  };

  const handleAddEquipment = async () => {
    try {
      if (!newEquipment.name || !newEquipment.roomName || !newEquipment.quantity) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
          variant: "destructive",
        });
        return;
      }

      const response = await equipmentService.addEquipment(
        newEquipment.roomName,
        newEquipment.name,
        newEquipment.quantity,
        newEquipment.status
      );


      if (response.status === "Thêm thiết bị thành công") {
        setIsAddDialogOpen(false);
        setNewEquipment({
          name: '',
          roomName: '',
          quantity: 1,
          status: 'good'
        });

        fetchEquipments();

        toast({
          title: "Thành công",
          description: "Thêm thiết bị mới thành công",
          variant: "default",
        });
      } else {
        console.error('Lỗi từ server:', response);
        toast({
          title: "Lỗi",
          description: response.message || "Không thể thêm thiết bị mới. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Lỗi khi thêm thiết bị mới:", error);
      if (axios.isAxiosError(error)) {
        console.error('Chi tiết lỗi:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      toast({
        title: "Lỗi",
        description: "Không thể thêm thiết bị mới. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Quản lý thiết bị</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm tên thiết bị..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="good">Hoạt động</SelectItem>
              <SelectItem value="maintenance">Bảo trì</SelectItem>
              <SelectItem value="broken">Hỏng</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedRoom}
            onValueChange={(value) => setSelectedRoom(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng</SelectItem>
              {uniqueRooms.map(room => (
                <SelectItem key={room} value={room}>
                  {room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm thiết bị mới
        </Button>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Dạng bảng</TabsTrigger>
          <TabsTrigger value="cards">Dạng thẻ</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Table>
            <TableCaption>Danh sách thiết bị trong phòng tập</TableCaption>
            <TableHeader>
              <TableRow className="bg-blue-500 text-white">
                <TableHead>STT</TableHead>
                <TableHead>Tên thiết bị</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : equipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Không tìm thấy thiết bị nào
                  </TableCell>
                </TableRow>
              ) : (
                equipments.map((equipment, index) => (
                  <TableRow key={equipment.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{equipment.name}</TableCell>
                    <TableCell>{equipment.roomName}</TableCell>
                    <TableCell>{equipment.quantity}</TableCell>
                    <TableCell>{getStatusDisplay(equipment.status)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(equipment)}
                        >
                          <Edit size={18} className="text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(equipment)}
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groupedByRoom.map(({ roomName, equipments: roomEquipments }) => (
              <Card key={roomName} className={roomEquipments.length > 0 ? "" : "opacity-60"}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{roomName}</h3>
                  </div>

                  {roomEquipments.length > 0 ? (
                    <div className="space-y-2">
                      {roomEquipments.map((eq, roomIndex) => (
                        <div key={eq.id} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <p className="font-medium">
                              {roomIndex + 1}. {eq.name}
                            </p>
                            <p className="text-sm text-gray-500">Số lượng: {eq.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusDisplay(eq.status)}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(eq)}
                            >
                              <Edit size={16} className="text-blue-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Không có thiết bị nào</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isEditDialogOpen && currentEquipment && (
        <EditDevice
          equipment={currentEquipment}
          onClose={() => {
            setIsEditDialogOpen(false);
            setCurrentEquipment(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thiết bị mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newName" className="text-right">
                Tên thiết bị
              </Label>
              <Input
                id="newName"
                className="col-span-3"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newRoom" className="text-right">
                Phòng
              </Label>
              <Select
                value={newEquipment.roomName}
                onValueChange={(value) => setNewEquipment({ ...newEquipment, roomName: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueRooms.map(room => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newQuantity" className="text-right">
                Số lượng
              </Label>
              <Input
                id="newQuantity"
                type="number"
                min="1"
                className="col-span-3"
                value={newEquipment.quantity}
                onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value, 10) })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newStatus" className="text-right">
                Trạng thái
              </Label>
              <Select
                value={newEquipment.status}
                onValueChange={(value) => setNewEquipment({ ...newEquipment, status: value as 'good' | 'maintenance' | 'broken' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Hoạt động</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="broken">Hỏng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddEquipment}>
              Thêm mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isDeleteDialogOpen && selectedEquipment && (
        <DeleteDevice
          equipment={selectedEquipment}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedEquipment(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default EquipmentListPage; 