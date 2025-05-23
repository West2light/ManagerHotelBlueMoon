"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Edit, FilterX, Plus, Trash2, X, Save, Check, Loader2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface Room {
  roomId: number;
  roomName: string;
  status: string;
  id?: number; 
  name?: string; 
}

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>("");
  const [newRoomStatus, setNewRoomStatus] = useState<string>("Sẵn sàng");
  const [isAddingRoom, setIsAddingRoom] = useState<boolean>(false);
  const [addRoomError, setAddRoomError] = useState<string | null>(null);
  
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState<string>("");
  const [isUpdatingRoom, setIsUpdatingRoom] = useState<boolean>(false);
  const [updateRoomError, setUpdateRoomError] = useState<string | null>(null);
  
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeletingRoom, setIsDeletingRoom] = useState<boolean>(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, selectedStatus, searchQuery]);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      const response = await axios.get('http://localhost:3001/admin/getRoomList');
      if (response.data && response.data.data) {
        
        const roomData = response.data.data.map((room: any, index: number) => ({
          roomId: room.roomId || room.id || index + 1, 
          roomName: room.roomName || room.name || `Phòng ${index + 1}`, 
          status: room.status || "Sẵn sàng" 
        }));
        
        setRooms(roomData);
        setFilteredRooms(roomData);
      } else {
        setRooms([]);
        setFilteredRooms([]);
        setNoResults(true);
      }
    } catch (err) {
      setError("Không thể lấy danh sách phòng tập. Vui lòng thử lại sau.");
      console.error("Error fetching rooms:", err);
      setRooms([]);
      setFilteredRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let newFilteredRooms = [...rooms];
    const newActiveFilters: string[] = [];
    
    if (selectedStatus && selectedStatus !== "all") {
      newFilteredRooms = newFilteredRooms.filter(room => 
        room.status === selectedStatus
      );
      newActiveFilters.push(`Trạng thái: ${selectedStatus}`);
    }
    
    if (searchQuery.trim() !== "") {
      newFilteredRooms = newFilteredRooms.filter(room => 
        room.roomName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      newActiveFilters.push(`Tên phòng: ${searchQuery}`);
    }
    
    setFilteredRooms(newFilteredRooms);
    setActiveFilters(newActiveFilters);
    
    setNoResults(newFilteredRooms.length === 0);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
  };

  const resetFilters = () => {
    setSelectedStatus("all");
    setSearchQuery("");
    setNoResults(false);
    setActiveFilters([]);
    setFilteredRooms(rooms);
  };

  const handleAddRoom = async () => {
    if (!newRoomName) {
      setAddRoomError("Vui lòng nhập tên phòng");
      return;
    }
    
    setIsAddingRoom(true);
    setAddRoomError(null);
    
    try {
      const response = await axios.post('http://localhost:3001/admin/addRoom', {
        roomName: newRoomName,
        status: newRoomStatus
      });
      
      if (response.data && response.data.status) {
        console.log("Thêm phòng tập thành công");
        toast({
          title: "Thành công",
          description: "Thêm phòng tập thành công",
          variant: "default",
          duration: 3000
        });
        setNewRoomName("");
        setNewRoomStatus("Sẵn sàng");
        setIsAddDialogOpen(false);
        fetchRooms();
      }
    } catch (err: any) {
      setAddRoomError(err.response?.data?.status || "Không thể thêm phòng tập");
      toast({
        title: "Lỗi",
        description: err.response?.data?.status || "Không thể thêm phòng tập",
        variant: "destructive",
        duration: 5000
      });
      console.error("Error adding room:", err);
    } finally {
      setIsAddingRoom(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom) return;
    
    setIsUpdatingRoom(true);
    setUpdateRoomError(null);
    
    try {
      const response = await axios.post('http://localhost:3001/admin/updateRoom', {
        roomName: editingRoom.roomName,
        status: updatedStatus
      });
      
      if (response.data && response.data.status) {
        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái phòng thành công",
          variant: "default",
          duration: 3000
        });
        setEditingRoom(null);
        fetchRooms();
      }
    } catch (err: any) {
      setUpdateRoomError(err.response?.data?.status || "Không thể cập nhật phòng tập");
      toast({
        title: "Lỗi",
        description: err.response?.data?.status || "Không thể cập nhật phòng tập",
        variant: "destructive",
        duration: 5000
      });
      console.error("Error updating room:", err);
    } finally {
      setIsUpdatingRoom(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    
    setIsDeletingRoom(true);
    
    try {
      const response = await axios.post('http://localhost:3001/admin/deleteRoom', {
        roomName: roomToDelete.roomName
      });
      
      if (response.data && response.data.status) {
        toast({
          title: "Thành công",
          description: "Xóa phòng tập thành công",
          variant: "default",
          duration: 3000
        });
        setRoomToDelete(null);
        fetchRooms();
      }
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.response?.data?.status || "Không thể xóa phòng tập",
        variant: "destructive",
        duration: 5000
      });
      console.error("Error deleting room:", err);
    } finally {
      setIsDeletingRoom(false);
    }
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setUpdatedStatus(room.status);
    setUpdateRoomError(null);
  };

  const openDeleteModal = (room: Room) => {
    setRoomToDelete(room);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm phòng mới
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Lọc theo trạng thái</label>
          <Select value={selectedStatus} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Sẵn sàng">Sẵn sàng</SelectItem>
              <SelectItem value="Đang sử dụng">Đang sử dụng</SelectItem>
              <SelectItem value="Bảo trì">Bảo trì</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Tìm kiếm theo tên phòng</label>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tên phòng cần tìm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline"
              size="icon"
              onClick={() => setSearchQuery('')}
              className={`${!searchQuery && 'invisible'}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-end">
          <Button onClick={resetFilters} variant="outline" className="mt-auto flex gap-2 items-center">
            <FilterX className="h-4 w-4" />
            Đặt lại bộ lọc
          </Button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter, index) => (
            <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
              {filter}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {noResults && (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Không tìm thấy phòng tập nào phù hợp với tiêu chí tìm kiếm</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>Danh sách phòng tập của trung tâm</TableCaption>
          <TableHeader>
            <TableRow className="bg-blue-500 text-white">
              <TableHead className="text-white">ID</TableHead>
              <TableHead className="text-white">Tên phòng</TableHead>
              <TableHead className="text-white">Trạng thái</TableHead>
              <TableHead className="text-center text-white">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room, index) => (
                <TableRow key={`room-${room.roomId || index}`} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{room.roomId}</TableCell>
                  <TableCell>{room.roomName}</TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${
                      room.status === 'Sẵn sàng' ? 'bg-green-100 text-green-800' : 
                      room.status === 'Đang sử dụng' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {room.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => window.location.href = `/admin/ql-phong-tap/${room.roomName}`}
                        className="hover:bg-blue-100 hover:text-blue-500"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditModal(room)}
                        className="hover:bg-blue-100 hover:text-blue-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteModal(room)}
                        className="hover:bg-red-100 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  {noResults ? "Không tìm thấy phòng tập nào phù hợp" : "Không có dữ liệu phòng tập"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm phòng tập mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về phòng tập mới dưới đây.
            </DialogDescription>
          </DialogHeader>
          
          {addRoomError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {addRoomError}
            </div>
          )}
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="roomName">Tên phòng</Label>
              <Input
                id="roomName"
                placeholder="Nhập tên phòng"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={newRoomStatus} onValueChange={setNewRoomStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sẵn sàng">Sẵn sàng</SelectItem>
                  <SelectItem value="Đang sử dụng">Đang sử dụng</SelectItem>
                  <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleAddRoom} 
              disabled={isAddingRoom}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isAddingRoom ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Thêm phòng
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingRoom && (
        <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật trạng thái phòng</DialogTitle>
              <DialogDescription>
                Cập nhật trạng thái cho phòng {editingRoom.roomName}.
              </DialogDescription>
            </DialogHeader>
            
            {updateRoomError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {updateRoomError}
              </div>
            )}
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={updatedStatus} onValueChange={setUpdatedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sẵn sàng">Sẵn sàng</SelectItem>
                    <SelectItem value="Đang sử dụng">Đang sử dụng</SelectItem>
                    <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRoom(null)}>Hủy</Button>
              <Button 
                onClick={handleUpdateRoom} 
                disabled={isUpdatingRoom}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isUpdatingRoom ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa phòng này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn phòng {roomToDelete?.roomName} khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              disabled={isDeletingRoom}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeletingRoom ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xóa phòng"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
