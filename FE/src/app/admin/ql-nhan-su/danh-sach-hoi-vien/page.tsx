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
import { Eye, FilterX } from "lucide-react";
import { useRouter } from 'next/navigation';

interface Customer {
  customerId: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  updateAt: string;
  membership: {
    membershipId: number;
    membershipName: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface Membership {
  id: number;
  namepackage: string;
  price: number;
  description: string;
  exercise_type: string;
}

interface MembershipRegistration {
  registrationId: number;
  customerId: number;
  membershipId?: number;
  endAt: string;
  createAt: string;
  startAt: string;
  status: string;
}

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [customerRegistrations, setCustomerRegistrations] = useState<Record<number, MembershipRegistration[]>>({});
  const [selectedMembership, setSelectedMembership] = useState<string>("all");
  const [phoneSearch, setPhoneSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    console.log("Danh sách gói tập đã được cập nhật:", memberships);
  }, [memberships]);

  useEffect(() => {
    fetchCustomers();
    fetchMemberships();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, selectedMembership, phoneSearch]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      const response = await axios.get('http://localhost:3001/admin/getCustomerList');
      if (response.data && response.data.data) {
        const customerData = response.data.data;
        setCustomers(customerData);
        setFilteredCustomers(customerData);
        await fetchCustomerMemberships(customerData);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
        setNoResults(true);
      }
    } catch (err) {
      setError("Không thể lấy danh sách khách hàng. Vui lòng thử lại sau.");
      console.error("Error fetching customers:", err);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCustomerMemberships = async (customers: Customer[]) => {
    const registrationsMap: Record<number, MembershipRegistration[]> = {};
    
    for (const customer of customers) {
      try {
        const response = await axios.post('http://localhost:3001/customer/getMemberRegistration', {
          userId: customer.customerId
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          registrationsMap[customer.customerId] = response.data.data;
        }
      } catch (err) {
        console.error(`Error fetching membership for customer ${customer.customerId}:`, err);
      }
    }
    
    setCustomerRegistrations(registrationsMap);
  };

  const fetchMemberships = async () => {
    try {
      const response = await axios.get('http://localhost:3001/manager/getMembership', {
        headers: {
          'Content-Type': 'application/json',
          'Token': '1'
        }
      });
      if (response.data && response.data.list) {
        setMemberships(response.data.list);
      }
    } catch (err) {
      console.error("Error fetching memberships:", err);
    }
  };

  const getMembershipNameById = (membershipId: number | undefined) => {
    if (!membershipId) return "Không xác định";
    const membership = memberships.find(m => m.id === membershipId);
    return membership ? membership.namepackage : "Không xác định";
  };

  const getCurrentMembershipInfo = (customerId: number) => {
    if (customerRegistrations[customerId] && customerRegistrations[customerId].length > 0) {
      const sortedRegistrations = [...customerRegistrations[customerId]].sort(
        (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
      );
      
      const latestRegistration = sortedRegistrations[0];
      
      return {
        name: getMembershipNameById(latestRegistration.registrationId),
        status: latestRegistration.status
      };
    }
    
    if (customers.find(c => c.customerId === customerId)?.membership) {
      const customerMembership = customers.find(c => c.customerId === customerId)!.membership;
      return {
        name: customerMembership.membershipName || getMembershipNameById(customerMembership.membershipId),
        status: customerMembership.status
      };
    }
    
    return {
      name: 'Chưa đăng ký',
      status: ''
    };
  };

  const applyFilters = () => {
    let newFilteredCustomers = [...customers];
    const newActiveFilters: string[] = [];
    
    if (selectedMembership && selectedMembership !== "all") {
      newFilteredCustomers = newFilteredCustomers.filter(customer => {
        const membershipInfo = getCurrentMembershipInfo(customer.customerId);
        return membershipInfo.name === selectedMembership;
      });
      newActiveFilters.push(`Gói tập: ${selectedMembership}`);
    }
    
    if (phoneSearch) {
      newFilteredCustomers = newFilteredCustomers.filter(customer => 
        customer.phone.includes(phoneSearch)
      );
      newActiveFilters.push(`SĐT: ${phoneSearch}`);
    }
    
    setFilteredCustomers(newFilteredCustomers);
    setActiveFilters(newActiveFilters);
    
    setNoResults(newFilteredCustomers.length === 0);
  };

  const handleMembershipFilter = async (membershipName: string) => {
    setSelectedMembership(membershipName);
  };

  const resetFilters = () => {
    setSelectedMembership("all");
    setPhoneSearch("");
    setNoResults(false);
    setActiveFilters([]);
    setFilteredCustomers(customers);
  };

  const handleViewDetail = (customerId: number) => {
    router.push(`/admin/ql-nhan-su/danh-sach-hoi-vien/${customerId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Lọc theo gói tập</label>
          <Select value={selectedMembership} onValueChange={handleMembershipFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn gói tập" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả gói tập</SelectItem>
              {memberships.map((membership) => (
                <SelectItem key={membership.id} value={membership.namepackage}>
                  {membership.namepackage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
          <p>Không tìm thấy khách hàng nào phù hợp với tiêu chí tìm kiếm</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>Danh sách hội viên của trung tâm</TableCaption>
          <TableHeader>
            <TableRow className="bg-blue-500 text-white">
              <TableHead className="text-white">ID</TableHead>
              <TableHead className="text-white">Họ tên</TableHead>
              <TableHead className="text-white">Số điện thoại</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Gói tập</TableHead>
              <TableHead className="text-center text-white">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => {
                const membershipInfo = getCurrentMembershipInfo(customer.customerId);
                
                return (
                  <TableRow key={customer.customerId} className="hover:bg-gray-50">
                    <TableCell className="font-medium ">{customer.customerId}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{membershipInfo.name}</TableCell>
                   
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewDetail(customer.customerId)}
                        className="hover:bg-blue-100 hover:text-blue-500"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  {noResults ? "Không tìm thấy khách hàng nào phù hợp" : "Không có dữ liệu hội viên"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}