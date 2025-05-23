"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Room {
  roomId: number;
  roomName: string;
  status: string;
}

interface Equipment {
  room_name: string;
  equipment_name: string;
  quantity: number;
  status: string;
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomName = decodeURIComponent(params.id as string);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchRoomDetail();
    fetchRoomEquipments();
  }, []);
  
  const fetchRoomDetail = async () => {
    try {
      const response = await axios.get('http://localhost:3001/admin/getRoomList');
      if (response.data && response.data.data) {
        const roomData = response.data.data.find((r: any) => 
          (r.roomName || r.name) === roomName
        );
        
        if (roomData) {
          setRoom({
            roomId: roomData.roomId || roomData.id || 0,
            roomName: roomData.roomName || roomData.name || roomName,
            status: roomData.status || "Không xác định"
          });
        } else {
          setError(`Không tìm thấy thông tin phòng ${roomName}`);
          toast({
            title: "Lỗi",
            description: `Không tìm thấy thông tin phòng ${roomName}`,
            variant: "destructive",
            duration: 5000
          });
        }
      }
    } catch (err) {
      setError("Không thể tải thông tin phòng. Vui lòng thử lại sau.");
      console.error("Error fetching room detail:", err);
    }
  };
  
  const fetchRoomEquipments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/admin/getRoomEquipmentList');
      if (response.data && response.data.data) {
        const roomEquipments = response.data.data.filter((eq: Equipment) => 
          eq.room_name === roomName
        );
        
        setEquipments(roomEquipments);
      }
    } catch (err) {
      console.error("Error fetching room equipments:", err);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thiết bị trong phòng",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    router.back();
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sẵn sàng':
      case 'hoạt động':
        return 'bg-green-100 text-green-800';
      case 'đang sử dụng':
        return 'bg-blue-100 text-blue-800';
      case 'bảo trì':
        return 'bg-yellow-100 text-yellow-800';
      case 'hỏng':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold">Chi tiết phòng: {roomName}</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phòng</CardTitle>
              <CardDescription>Chi tiết về phòng tập {roomName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID Phòng</p>
                  <p className="font-medium">{room?.roomId || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tên phòng</p>
                  <p className="font-medium">{room?.roomName || roomName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${
                    getStatusColor(room?.status || '')
                  }`}>
                    {room?.status || 'Không xác định'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Thiết bị trong phòng</CardTitle>
              <CardDescription>Danh sách các thiết bị hiện có trong phòng {roomName}</CardDescription>
            </CardHeader>
            <CardContent>
              {equipments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-500 text-white">
                      <TableHead>Tên thiết bị</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipments.map((equipment, index) => (
                      <TableRow key={`equipment-${index}`} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{equipment.equipment_name}</TableCell>
                        <TableCell>{equipment.quantity}</TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${
                            getStatusColor(equipment.status)
                          }`}>
                            {equipment.status}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  <p>Không có thiết bị nào trong phòng này</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
