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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, FilterX } from "lucide-react";

interface Trainer {
  index: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  updateAt: string;
}

export default function TrainerListPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [phoneSearch, setPhoneSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trainers, phoneSearch]);

  const fetchTrainers = async () => {
    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      const response = await axios.get('http://localhost:3001/admin/getPTList');
      if (response.data && response.data.data) {
        const trainerData = response.data.data;
        setTrainers(trainerData);
        setFilteredTrainers(trainerData);
      } else {
        setTrainers([]);
        setFilteredTrainers([]);
        setNoResults(true);
      }
    } catch (err) {
      setError("Không thể lấy danh sách trainer. Vui lòng thử lại sau.");
      console.error("Error fetching trainers:", err);
      setTrainers([]);
      setFilteredTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let newFilteredTrainers = [...trainers];
    const newActiveFilters: string[] = [];
    
    if (phoneSearch) {
      newFilteredTrainers = newFilteredTrainers.filter(trainer => 
        trainer.phone.includes(phoneSearch)
      );
      newActiveFilters.push(`SĐT: ${phoneSearch}`);
    }
    
    setFilteredTrainers(newFilteredTrainers);
    setActiveFilters(newActiveFilters);
    
    setNoResults(newFilteredTrainers.length === 0);
  };

  const resetFilters = () => {
    setPhoneSearch("");
    setNoResults(false);
    setActiveFilters([]);
    fetchTrainers();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Tìm theo số điện thoại</label>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập số điện thoại"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="flex-1"
            />
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
          <p>Không tìm thấy trainer nào phù hợp với tiêu chí tìm kiếm</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>Danh sách trainer của trung tâm</TableCaption>
          <TableHeader>
            <TableRow className="bg-blue-500 text-white">
              <TableHead className="text-white">ID</TableHead>
              <TableHead className="text-white">Họ tên</TableHead>
              <TableHead className="text-white">Tuổi</TableHead>
              <TableHead className="text-white">Giới tính</TableHead>
              <TableHead className="text-white">Số điện thoại</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Cập nhật lần cuối</TableHead>
              <TableHead className="text-center text-white">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrainers.length > 0 ? (
              filteredTrainers.map((trainer) => (
                <TableRow key={trainer.index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{trainer.index+1}</TableCell>
                  <TableCell>{trainer.name}</TableCell>
                  <TableCell>{trainer.age}</TableCell>
                  <TableCell>{trainer.gender === 'M' ? 'Nam' : 'Nữ'}</TableCell>
                  <TableCell>{trainer.phone}</TableCell>
                  <TableCell>{trainer.email}</TableCell>
                  <TableCell>{formatDate(trainer.updateAt)}</TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-blue-100 hover:text-blue-500"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  {noResults ? "Không tìm thấy trainer nào phù hợp" : "Không có dữ liệu trainer"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}