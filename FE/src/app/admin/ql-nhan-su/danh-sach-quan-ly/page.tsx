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
import { Search, Eye, FilterX } from "lucide-react";

interface Manager {
  managerId: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  index: number;
}

export default function ManagerListPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<Manager[]>([]);
  const [phoneSearch, setPhoneSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [managers, phoneSearch]);

  const fetchManagers = async () => {
    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      const response = await axios.get('http://localhost:3001/admin/getManagerList');
      if (response.data && response.data.data) {
        const managerData = response.data.data;
        setManagers(managerData);
        setFilteredManagers(managerData);
      } else {
        setManagers([]);
        setFilteredManagers([]);
        setNoResults(true);
      }
    } catch (err) {
      setError("Không thể lấy danh sách quản lý. Vui lòng thử lại sau.");
      console.error("Lỗi khi lấy danh sách quản lý:", err);
      setManagers([]);
      setFilteredManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let newFilteredManagers = [...managers];
    const newActiveFilters: string[] = [];
    
    if (phoneSearch) {
      newFilteredManagers = newFilteredManagers.filter(manager => 
        manager.phone.includes(phoneSearch)
      );
      newActiveFilters.push(`SĐT: ${phoneSearch}`);
    }
    
    setFilteredManagers(newFilteredManagers);
    setActiveFilters(newActiveFilters);
    setNoResults(newFilteredManagers.length === 0);
  };

  const resetFilters = () => {
    setPhoneSearch("");
    setNoResults(false);
    setActiveFilters([]);
    fetchManagers();
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
          <p>Không tìm thấy quản lý nào phù hợp với tiêu chí tìm kiếm</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>Danh sách quản lý của trung tâm</TableCaption>
          <TableHeader>
            <TableRow className="bg-blue-500 text-white">
              <TableHead className="text-white">ID</TableHead>
              <TableHead className="text-white">Họ tên</TableHead>
              <TableHead className="text-white">Tuổi</TableHead>
              <TableHead className="text-white">Giới tính</TableHead>
              <TableHead className="text-white">Số điện thoại</TableHead>
              <TableHead className="text-white">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManagers.length > 0 ? (
              filteredManagers.map((manager) => (
                <TableRow key={manager.managerId} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{manager.managerId}</TableCell>
                  <TableCell>{manager.name}</TableCell>
                  <TableCell>{manager.age}</TableCell>
                  <TableCell>{manager.gender}</TableCell>
                  <TableCell>{manager.phone}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  {noResults ? "Không tìm thấy quản lý nào phù hợp" : "Không có dữ liệu quản lý"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}