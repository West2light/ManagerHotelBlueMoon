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
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

interface Equipment {
  room_name: string;
  equipment_name: string;
  quantity: number;
  status: string;
}

export default function EquipmentListPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchEquipments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [equipments, selectedRoom, selectedStatus]);

  const fetchEquipments = async () => {
    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      const response = await axios.get('http://localhost:3001/admin/getRoomEquipmentList');
      if (response.data && response.data.data) {
        const equipmentData = response.data.data;
        setEquipments(equipmentData);
        setFilteredEquipments(equipmentData);
        
        const uniqueRooms = Array.from(new Set(equipmentData.map((eq: Equipment) => eq.room_name)));
        setRooms(uniqueRooms as string[]);
      } else {
        setEquipments([]);
        setFilteredEquipments([]);
        setNoResults(true);
      }
    } catch (err) {
      setError("Không thể lấy danh sách thiết bị. Vui lòng thử lại sau.");
      console.error("Error fetching equipments:", err);
      setEquipments([]);
      setFilteredEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByRoom = async (roomName: string) => {
    if (roomName === "all") {
      fetchEquipments();
      return;
    }
    
    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      const response = await axios.post('http://localhost:3001/admin/getRoomEquipmentListByRoomName', {
        roomName: roomName
      });
      
      if (response.data && response.data.data) {
        const equipmentData = response.data.data;
        setEquipments(equipmentData);
        setFilteredEquipments(equipmentData);
        setNoResults(equipmentData.length === 0);
      } else {
        setEquipments([]);
        setFilteredEquipments([]);
        setNoResults(true);
      }
    } catch (err) {
      setError("Không thể lọc thiết bị theo phòng. Vui lòng thử lại sau.");
      console.error("Error filtering by room:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = async (status: string) => {
    if (status === "all") {
      fetchEquipments();
      return;
    }
    
    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      const response = await axios.post('http://localhost:3001/admin/getRoomEquipmentListByStatus', {
        status: status
      });
      
      if (response.data && response.data.data) {
        const equipmentData = response.data.data;
        setEquipments(equipmentData);
        setFilteredEquipments(equipmentData);
        setNoResults(equipmentData.length === 0);
      } else {
        setEquipments([]);
        setFilteredEquipments([]);
        setNoResults(true);
      }
    } catch (err) {
      setError("Không thể lọc thiết bị theo trạng thái. Vui lòng thử lại sau.");
      console.error("Error filtering by status:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let newFilteredEquipments = [...equipments];
    const newActiveFilters: string[] = [];
    
    if (selectedRoom !== "all" && selectedStatus !== "all") {
      newFilteredEquipments = newFilteredEquipments.filter(equipment => 
        equipment.room_name === selectedRoom && equipment.status === selectedStatus
      );
      newActiveFilters.push(`Phòng: ${selectedRoom}`);
      newActiveFilters.push(`Trạng thái: ${selectedStatus}`);
    } else if (selectedRoom !== "all") {
      newActiveFilters.push(`Phòng: ${selectedRoom}`);
    } else if (selectedStatus !== "all") {
      newActiveFilters.push(`Trạng thái: ${selectedStatus}`);
    }
    
    setFilteredEquipments(newFilteredEquipments);
    setActiveFilters(newActiveFilters);
    setNoResults(newFilteredEquipments.length === 0);
  };

  const handleRoomFilter = (roomName: string) => {
    setSelectedRoom(roomName);
    if (selectedStatus === "all") {
      filterByRoom(roomName);
    }
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    if (selectedRoom === "all") {
      filterByStatus(status);
    }
  };

  const resetFilters = () => {
    setSelectedRoom("all");
    setSelectedStatus("all");
    setNoResults(false);
    setActiveFilters([]);
    fetchEquipments();
  };

  return (
    <div className="flex flex-col gap-6">      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Lọc theo phòng</label>
          <Select value={selectedRoom} onValueChange={handleRoomFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room} value={room}>
                  {room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Lọc theo trạng thái</label>
          <Select value={selectedStatus} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Hoạt động">Hoạt động</SelectItem>
              <SelectItem value="Hỏng">Hỏng</SelectItem>
              <SelectItem value="Bảo trì">Bảo trì</SelectItem>
            </SelectContent>
          </Select>
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
          <p>Không tìm thấy thiết bị nào phù hợp với tiêu chí tìm kiếm</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>Danh sách thiết bị của trung tâm</TableCaption>
          <TableHeader>
            <TableRow className="bg-blue-500 text-white">
              <TableHead className="text-white">Tên phòng</TableHead>
              <TableHead className="text-white">Tên thiết bị</TableHead>
              <TableHead className="text-white">Số lượng</TableHead>
              <TableHead className="text-white">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipments.length > 0 ? (
              filteredEquipments.map((equipment, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>{equipment.room_name}</TableCell>
                  <TableCell>{equipment.equipment_name}</TableCell>
                  <TableCell>{equipment.quantity}</TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                      equipment.status === 'Hoạt động' ? 'bg-green-100 text-green-800' :
                      equipment.status === 'Hỏng' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {equipment.status === 'Hoạt động' ? 'Hoạt động' :
                       equipment.status === 'Hỏng' ? 'Hỏng' :
                       'Bảo trì'}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  {noResults ? "Không tìm thấy thiết bị nào phù hợp" : "Không có dữ liệu thiết bị"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}