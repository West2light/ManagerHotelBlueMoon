"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Info, Edit, Search, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { getExerciseSessions, addExerciseSession, updateExerciseSession, ExerciseSession } from '@/services/exerciseService';
import axios from 'axios';

// Thiết lập ngôn ngữ cho localizer
moment.locale('vi');
const localizer = momentLocalizer(moment);

// Định nghĩa kiểu dữ liệu
interface Trainer {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TimeTablePage: React.FC = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<ExerciseSession | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>("");
  console.log('Initial currentSessionId state:', currentSessionId);

  const [formData, setFormData] = useState({
    exerciseType: '',
    start: new Date(),
    end: new Date(moment().add(1, 'hour').toDate()),
    description: ''
  });

  // Fetch trainers và customers khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: "Lỗi",
            description: "Vui lòng đăng nhập để xem lịch tập",
            variant: "destructive",
          });
          return;
        }

        console.log('Fetching data with token:', token);
        console.log('API URL:', API_URL);

        // Sửa lại để xử lý theo thứ tự:
        // 1. Tải danh sách khách hàng
        // 2. Tải danh sách huấn luyện viên
        // 3. Tải danh sách phiên tập và cập nhật ID

        // 1. Fetch customers trước
        let customersList: Trainer[] = [];
        try {
          const customersResponse = await axios.get(`${API_URL}/admin/getCustomerList`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Customers response:', customersResponse.data);

          if (customersResponse.data.data && Array.isArray(customersResponse.data.data)) {
            customersList = customersResponse.data.data.map((customer: any) => ({
              id: customer.customerId?.toString() || '',
              name: customer.name || ''
            }));
            setCustomers(customersList);
          } else {
            console.warn('No customers list found in response or invalid format');
            setCustomers([]);
          }
        } catch (error: any) {
          console.error('Error fetching customers:', error);
          toast({
            title: "Lỗi",
            description: "Không thể tải danh sách khách hàng",
            variant: "destructive",
          });
          setCustomers([]);
        }

        // 2. Fetch trainers
        let trainersList: Trainer[] = [];
        try {
          const trainersResponse = await axios.get(`${API_URL}/admin/getPTList`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Trainers response:', trainersResponse.data);

          if (trainersResponse.data.data && Array.isArray(trainersResponse.data.data)) {
            trainersList = trainersResponse.data.data.map((trainer: any) => ({
              id: trainer.managerId?.toString() || '',
              name: trainer.name || ''
            }));
            setTrainers(trainersList);
          } else {
            console.warn('No trainers list found in response or invalid format');
            setTrainers([]);
          }
        } catch (error: any) {
          console.error('Error fetching trainers:', error);
          toast({
            title: "Lỗi",
            description: "Không thể tải danh sách huấn luyện viên",
            variant: "destructive",
          });
          setTrainers([]);
        }

        // 3. Fetch sessions sau khi đã có danh sách khách hàng và huấn luyện viên
        try {
          const sessionsData = await getExerciseSessions(token);
          console.log('Original sessions data:', sessionsData);

          if (sessionsData && Array.isArray(sessionsData)) {
            // Duyệt qua từng phiên tập để cập nhật ID
            const processedSessions = sessionsData.map((session: ExerciseSession) => {
              // So sánh tên đơn giản hơn, bỏ qua khoảng trắng và chữ hoa/thường
              let customerName = session.customerName || '';
              let trainerName = session.trainerName || '';

              console.log(`Session ${session.id} original names - Customer: "${customerName}", Trainer: "${trainerName}"`);

              // Tìm khách hàng tương ứng bằng tên - kiểm tra có chứa tên hay không thay vì so khớp hoàn toàn
              const matchingCustomer = customersList.find(c => {
                const customerInList = c.name.toLowerCase().replace(/\s+/g, '');
                const sessionCustomer = customerName.toLowerCase().replace(/\s+/g, '');
                return customerInList.includes(sessionCustomer) || sessionCustomer.includes(customerInList);
              });

              // Tìm huấn luyện viên tương ứng bằng tên - kiểm tra có chứa tên hay không
              const matchingTrainer = trainersList.find(t => {
                const trainerInList = t.name.toLowerCase().replace(/\s+/g, '');
                const sessionTrainer = trainerName.toLowerCase().replace(/\s+/g, '');
                return trainerInList.includes(sessionTrainer) || sessionTrainer.includes(trainerInList);
              });

              console.log(`Session ${session.id} matching:`);
              console.log(`- Customer "${customerName}" -> matched: ${matchingCustomer ? `"${matchingCustomer.name}" (ID: ${matchingCustomer.id})` : 'Not found'}`);
              console.log(`- Trainer "${trainerName}" -> matched: ${matchingTrainer ? `"${matchingTrainer.name}" (ID: ${matchingTrainer.id})` : 'Not found'}`);

              // Cập nhật ID nếu tìm thấy
              return {
                ...session,
                customerId: matchingCustomer?.id || session.customerId,
                trainerId: matchingTrainer?.id || session.trainerId
              };
            });

            console.log('Processed sessions:', processedSessions);
            setSessions(processedSessions);
          } else {
            setSessions(sessionsData);
          }
        } catch (error: any) {
          console.error('Error fetching sessions:', error);
          toast({
            title: "Lỗi",
            description: "Không thể tải lịch tập",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error in fetchData:', error);
        toast({
          title: "Lỗi",
          description: error.response?.data?.message || error.message || "Không thể tải dữ liệu",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Cập nhật lại sessions mỗi khi danh sách khách hàng hoặc huấn luyện viên thay đổi
  useEffect(() => {
    // Nếu cả sessions, customers và trainers đều đã được tải
    if (sessions.length > 0 && customers.length > 0 && trainers.length > 0) {
      console.log("Updating sessions with new customer/trainer IDs");

      // Cập nhật lại ID cho sessions dựa trên danh sách mới
      const updatedSessions = sessions.map(session => {
        let customerName = session.customerName || '';
        let trainerName = session.trainerName || '';

        // Tìm khách hàng tương ứng
        const matchingCustomer = customers.find(c => {
          const customerInList = c.name.toLowerCase().replace(/\s+/g, '');
          const sessionCustomer = customerName.toLowerCase().replace(/\s+/g, '');
          return customerInList.includes(sessionCustomer) || sessionCustomer.includes(customerInList);
        });

        // Tìm huấn luyện viên tương ứng
        const matchingTrainer = trainers.find(t => {
          const trainerInList = t.name.toLowerCase().replace(/\s+/g, '');
          const sessionTrainer = trainerName.toLowerCase().replace(/\s+/g, '');
          return trainerInList.includes(sessionTrainer) || sessionTrainer.includes(trainerInList);
        });

        if (matchingCustomer || matchingTrainer) {
          console.log(`Updating session "${session.title || session.id}":`);
          if (matchingCustomer) {
            console.log(`- Customer: "${customerName}" -> matched with "${matchingCustomer.name}" (ID: ${matchingCustomer.id})`);
          }
          if (matchingTrainer) {
            console.log(`- Trainer: "${trainerName}" -> matched with "${matchingTrainer.name}" (ID: ${matchingTrainer.id})`);
          }
        }

        // Cập nhật ID nếu tìm thấy
        return {
          ...session,
          customerId: matchingCustomer?.id || session.customerId,
          trainerId: matchingTrainer?.id || session.trainerId
        };
      });

      // Cập nhật state
      setSessions(updatedSessions);
    }
  }, [customers, trainers]); // Chỉ chạy khi customers hoặc trainers thay đổi

  const handleSelectEvent = (event: ExerciseSession) => {
    console.log("Selected event:", event);
    console.log("Event ID original value:", event.id, "Type:", typeof event.id);

    // Đảm bảo lưu ID dưới dạng số nguyên, không phải string
    // Nếu event.id là string, chuyển về số
    let sessionId;
    if (typeof event.id === 'string') {
      sessionId = parseInt(event.id);
    } else {
      sessionId = event.id;
    }

    console.log("Processed session ID:", sessionId, "Type:", typeof sessionId);

    // Lưu session và ID (dưới dạng chuỗi cho state)
    setCurrentSession(event);
    setCurrentSessionId(event.id ? String(event.id) : '');
    setIsDetailOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Không làm gì cả khi chọn slot - đã loại bỏ thao tác thêm buổi tập mới
  };

  const handleEditClick = () => {
    if (!currentSession) {
      console.error("Không có currentSession");
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin buổi tập",
        variant: "destructive",
      });
      return;
    }

    // Log thông tin để debug
    console.log("Đang chỉnh sửa buổi tập:", currentSession);
    console.log("ID buổi tập:", currentSession.id);

    // Cập nhật currentSessionId từ currentSession
    const sessionId = currentSession.id ? String(currentSession.id) : '';
    setCurrentSessionId(sessionId);

    // Tìm huấn luyện viên có tên trùng với session nếu có
    let foundTrainerId = 'none';
    if (currentSession.trainerName && typeof currentSession.trainerName === 'string' && currentSession.trainerName.trim() !== '') {
      const trainerName = currentSession.trainerName;
      const matchingTrainer = trainers.find(t =>
        t.name === trainerName ||
        trainerName.includes(t.name) ||
        t.name.includes(trainerName)
      );

      if (matchingTrainer) {
        foundTrainerId = matchingTrainer.id;
        console.log("Found matching trainer:", matchingTrainer);
      } else {
        console.log("No matching trainer found for:", trainerName);
      }
    }

    setFormData({
      exerciseType: currentSession.exerciseType || '',
      start: currentSession.start || new Date(),
      end: currentSession.end || new Date(moment().add(1, 'hour').toDate()),
      description: currentSession.description || ''
    });

    setIsDetailOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleEdit = async () => {
    console.log("=== Bắt đầu xử lý cập nhật buổi tập ===");

    if (!currentSession) {
      console.error("Không có currentSession");
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin buổi tập",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Không có token");
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để sửa buổi tập",
          variant: "destructive",
        });
        return;
      }

      // Lấy sessionId từ currentSession
      const sessionId = currentSession.id ? String(currentSession.id) : '';

      console.log("ID buổi tập (sessionId):", sessionId);
      console.log("Kiểu dữ liệu của sessionId:", typeof sessionId);

      if (!sessionId) {
        console.error("Không có ID buổi tập");
        toast({
          title: "Lỗi",
          description: "ID buổi tập không hợp lệ",
          variant: "destructive",
        });
        return;
      }

      if (!formData.exerciseType) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn loại tập luyện",
          variant: "destructive",
        });
        return;
      }

      // Kiểm tra thời gian
      if (formData.start >= formData.end) {
        toast({
          title: "Lỗi",
          description: "Thời gian kết thúc phải sau thời gian bắt đầu",
          variant: "destructive",
        });
        return;
      }

      // Trích xuất thông tin khách hàng từ customerName
      const customerFullName = currentSession.customerName || '';
      let cufirstname = '';
      let culastname = '';

      if (customerFullName) {
        const nameParts = customerFullName.trim().split(' ');
        if (nameParts.length > 1) {
          cufirstname = nameParts[0];
          culastname = nameParts.slice(1).join(' ');
        } else {
          cufirstname = customerFullName;
        }
      }

      // Trích xuất thông tin huấn luyện viên từ trainerName
      const trainerFullName = currentSession.trainerName || '';
      let ptfirstname = '';
      let ptlastname = '';

      if (trainerFullName) {
        const nameParts = trainerFullName.trim().split(' ');
        if (nameParts.length > 1) {
          ptfirstname = nameParts[0];
          ptlastname = nameParts.slice(1).join(' ');
        } else {
          ptfirstname = trainerFullName;
        }
      }

      // Chi tiết thông tin gửi đi - đúng theo yêu cầu của backend
      const updatePayload = {
        sessionid: parseInt(sessionId),
        cufirstname,
        culastname,
        ptfirstname,
        ptlastname,
        exerciseType: formData.exerciseType,
        beginAt: formData.start ? moment(formData.start).format('YYYY-MM-DD HH:mm:ss') : undefined,
        endAt: formData.end ? moment(formData.end).format('YYYY-MM-DD HH:mm:ss') : undefined,
        description: formData.description || ''
      };

      console.log("Chi tiết payload gửi đi:", updatePayload);

      // Gọi API cập nhật buổi tập
      await updateExerciseSession(token, sessionId, updatePayload);
      console.log("Cập nhật buổi tập thành công");

      // Refresh danh sách buổi tập
      const updatedSessions = await getExerciseSessions(token);
      setSessions(updatedSessions);

      toast({
        title: "Thành công",
        description: "Đã cập nhật buổi tập",
      });

      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật buổi tập:", error);
      console.error("Chi tiết lỗi:", error.response?.data || error.message);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || error.message || "Không thể cập nhật buổi tập",
        variant: "destructive",
      });
    }
  };

  const handleTrainerFilter = (trainerId: string) => {
    console.log(`Trainer filter changed to: ${trainerId === 'all' ? 'all' : trainerId}`);
    setSelectedTrainer(trainerId === 'all' ? null : trainerId);

    // Log danh sách trainers để debug
    if (trainerId !== 'all') {
      const selectedTrainer = trainers.find(t => t.id === trainerId);
      console.log(`Selected trainer: ${selectedTrainer ? selectedTrainer.name : 'Not found'} (ID: ${trainerId})`);
    } else {
      console.log(`Showing all trainers`);
    }
  };

  const handleCustomerFilter = (customerId: string) => {
    console.log(`Customer filter changed to: ${customerId === 'all' ? 'all' : customerId}`);
    setSelectedCustomer(customerId === 'all' ? null : customerId);

    // Log danh sách customers để debug
    if (customerId !== 'all') {
      const selectedCustomer = customers.find(c => c.id === customerId);
      console.log(`Selected customer: ${selectedCustomer ? selectedCustomer.name : 'Not found'} (ID: ${customerId})`);

      // Log sessions có khách hàng này
      const matchingSessions = sessions.filter(s => String(s.customerId) === String(customerId));
      console.log(`Found ${matchingSessions.length} sessions with customer ID ${customerId}:`);
      matchingSessions.forEach(s => {
        console.log(`- Session "${s.title || s.id}" - Customer: "${s.customerName}" (ID: ${s.customerId})`);
      });
    } else {
      console.log(`Showing all customers`);
    }
  };

  // Lọc buổi tập theo trainer, customer và từ khóa tìm kiếm
  const filteredSessions = sessions.filter(session => {
    // In ra thông tin chi tiết để debug
    if (selectedTrainer || selectedCustomer || searchTerm) {
      console.log(`Filtering session "${session.title || session.id}":`);
      console.log(`- Customer name: "${session.customerName}", ID: ${session.customerId}, Selected customer: ${selectedCustomer}`);
      console.log(`- Trainer name: "${session.trainerName}", ID: ${session.trainerId}, Selected trainer: ${selectedTrainer}`);
      console.log(`- Search term: "${searchTerm}"`);
    }

    let trainerMatch = true;
    if (selectedTrainer) {
      if (selectedTrainer === 'none') {
        // Nếu chọn "Không có huấn luyện viên", tìm các buổi tập không có huấn luyện viên
        trainerMatch = !session.trainerId || session.trainerId === 'none';
      } else {
        // Ngược lại tìm các buổi tập có huấn luyện viên match
        trainerMatch = String(session.trainerId) === String(selectedTrainer);
      }
    }

    const customerMatch = !selectedCustomer || String(session.customerId) === String(selectedCustomer);

    // Tìm kiếm theo từ khóa
    let searchMatch = true;
    if (searchTerm && searchTerm.trim() !== '') {
      const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const searchTerms = normalizedSearchTerm.split(/\s+/);

      // Tìm kiếm trong tên khách hàng
      const normalizedCustomerName = session.customerName ? session.customerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
      const customerNameMatch = searchTerms.every(term => normalizedCustomerName.includes(term));

      // Tìm kiếm trong tên huấn luyện viên
      const normalizedTrainerName = session.trainerName ? session.trainerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
      const trainerNameMatch = searchTerms.every(term => normalizedTrainerName.includes(term));

      // Tìm kiếm trong loại tập luyện
      const normalizedExerciseType = session.exerciseType ? session.exerciseType.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
      const exerciseTypeMatch = searchTerms.every(term => normalizedExerciseType.includes(term));

      // Tìm kiếm trong mô tả
      const normalizedDescription = session.description ? session.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
      const descriptionMatch = searchTerms.every(term => normalizedDescription.includes(term));

      searchMatch = customerNameMatch || trainerNameMatch || exerciseTypeMatch || descriptionMatch;
    }

    // Log kết quả lọc
    if (selectedTrainer || selectedCustomer || searchTerm) {
      console.log(`- Match result: trainer=${trainerMatch}, customer=${customerMatch}, search=${searchMatch}, final=${trainerMatch && customerMatch && searchMatch}`);
    }

    return trainerMatch && customerMatch && searchMatch;
  });

  // Cấu hình hiển thị sự kiện
  const eventPropGetter = (event: ExerciseSession) => {
    let className = '';

    // Xác định class dựa trên loại tập luyện
    switch (event.exerciseType?.toLowerCase()) {
      case 'cardio':
        className = 'event-cardio';
        break;
      case 'gym':
        className = 'event-gym';
        break;
      case 'yoga':
        className = 'event-yoga';
        break;
      case 'pilates':
        className = 'event-pilates';
        break;
      case 'crossfit':
        className = 'event-crossfit';
        break;
      default:
        className = '';
    }

    return {
      className: className,
      style: {
        color: 'white', // Luôn đảm bảo text màu trắng
      }
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Lịch tập</h1>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-900">Lọc theo huấn luyện viên</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedTrainer || 'all'}
              onValueChange={handleTrainerFilter}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Chọn huấn luyện viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả huấn luyện viên</SelectItem>
                {trainers.map(trainer => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-900">Lọc theo khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedCustomer || 'all'}
              onValueChange={handleCustomerFilter}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Chọn khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khách hàng</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-900">Tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm theo tên, loại tập..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchTerm('')}
                >
                  <XCircle size={16} className="text-gray-500" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Hôm nay
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                const newDate = view === 'month'
                  ? moment(date).subtract(1, 'month').toDate()
                  : moment(date).subtract(1, 'week').toDate();
                setDate(newDate);
              }}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="text-lg font-medium text-gray-900">
              {view === 'month'
                ? moment(date).format('MMMM YYYY')
                : `${moment(date).startOf('week').format('DD/MM')} - ${moment(date).endOf('week').format('DD/MM/YYYY')}`
              }
            </div>

            <Button
              variant="outline"
              size="icon"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                const newDate = view === 'month'
                  ? moment(date).add(1, 'month').toDate()
                  : moment(date).add(1, 'week').toDate();
                setDate(newDate);
              }}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={view === 'month' ? "default" : "outline"}
              className={view === 'month' ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
              onClick={() => setView('month')}
            >
              Tháng
            </Button>
            <Button
              variant={view === 'week' ? "default" : "outline"}
              className={view === 'week' ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
              onClick={() => setView('week')}
            >
              Tuần
            </Button>
            <Button
              variant={view === 'day' ? "default" : "outline"}
              className={view === 'day' ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
              onClick={() => setView('day')}
            >
              Ngày
            </Button>
          </div>
        </div>

        <Calendar
          localizer={localizer}
          events={filteredSessions}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          views={['month', 'week', 'day']}
          view={view as any}
          date={date}
          onView={(newView) => setView(newView)}
          onNavigate={(newDate) => setDate(newDate)}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventPropGetter}
          formats={{
            timeGutterFormat: (date, culture, localizer) => localizer?.format(date, 'HH:mm', culture) || '',
            dayFormat: (date, culture, localizer) => localizer?.format(date, 'ddd DD/MM', culture) || '',
          }}
          messages={{
            today: 'Hôm nay',
            previous: 'Trước',
            next: 'Sau',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày',
            showMore: (total) => `+ ${total} sự kiện khác`,
          }}
        />
      </div>

      {/* Dialog xem chi tiết */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Chi tiết buổi tập</DialogTitle>
          </DialogHeader>

          {currentSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                  <h3 className="text-lg font-semibold text-gray-900">{currentSession.title}</h3>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Thời gian bắt đầu</div>
                  <div className="text-gray-900">{moment(currentSession.start).format('HH:mm - DD/MM/YYYY')}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Thời gian kết thúc</div>
                  <div className="text-gray-900">{moment(currentSession.end).format('HH:mm - DD/MM/YYYY')}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Loại tập luyện</div>
                  <Badge className="bg-blue-100 text-blue-800">{currentSession.exerciseType}</Badge>
                </div>

                <div className="col-span-3">
                  <div className="text-sm font-medium text-gray-500">Khách hàng</div>
                  <div className="text-gray-900">{currentSession.customerName}</div>
                </div>

                {(currentSession.trainerId || currentSession.trainerName) && (
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-500">Huấn luyện viên</div>
                    <div className="text-gray-900">{currentSession.trainerName || 'Không có tên'}</div>
                  </div>
                )}

                {currentSession.description && (
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-500">Mô tả</div>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-900">{currentSession.description}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={handleEditClick}>
                <Edit size={16} className="mr-2" /> Chỉnh sửa
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa buổi tập */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Chỉnh sửa buổi tập</DialogTitle>
            {/* Hiển thị ID buổi tập để debug */}
            <div className="text-xs text-gray-500 mt-1">
              ID buổi tập: {currentSession?.id || 'N/A'}
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-700">
                Khách hàng
              </Label>
              <div className="col-span-3 text-gray-900 font-semibold">
                {currentSession?.customerName || ''}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-trainerId" className="text-right text-gray-700">
                Huấn luyện viên
              </Label>
              <div className="col-span-3">
                <div className="text-gray-900 font-semibold">
                  {currentSession?.trainerName || 'Không có huấn luyện viên'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-exerciseType" className="text-right text-gray-700">
                Loại tập luyện <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.exerciseType}
                  onValueChange={(value) => setFormData({ ...formData, exerciseType: value })}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn loại tập luyện" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                    <SelectItem value="Gym">Gym</SelectItem>
                    <SelectItem value="Yoga">Yoga</SelectItem>
                    <SelectItem value="Pilates">Pilates</SelectItem>
                    <SelectItem value="CrossFit">CrossFit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-start" className="text-right text-gray-700">
                Thời gian bắt đầu
              </Label>
              <Input
                id="edit-start"
                type="datetime-local"
                className="col-span-3 border-gray-300"
                value={moment(formData.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-end" className="text-right text-gray-700">
                Thời gian kết thúc
              </Label>
              <Input
                id="edit-end"
                type="datetime-local"
                className="col-span-3 border-gray-300"
                value={moment(formData.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right text-gray-700">
                Mô tả
              </Label>
              <Input
                id="edit-description"
                className="col-span-3 border-gray-300"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                console.log("Nút Lưu thay đổi được nhấn!");
                alert("Đang lưu thay đổi...");
                handleEdit();
              }}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeTablePage;