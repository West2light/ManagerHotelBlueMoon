'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, User, Users, Phone, Mail, UserPlus, Edit, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getTrainers, TrainerData, getCustomersByTrainer, getCustomerByPhone, CustomerData, ExerciseSessionData, getExerciseSessions, addExerciseSession, getDetailedExerciseSessions } from '@/services/trainerService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axios from 'axios';

// Đường dẫn ảnh mặc định - không cần tải nhiều ảnh từ API bên ngoài
const DEFAULT_AVATAR = '/assets/default-avatar.png';

const TrainerListPage: React.FC = () => {
    const { toast } = useToast();
    const [trainers, setTrainers] = useState<TrainerData[]>([]);
    const [filteredTrainers, setFilteredTrainers] = useState<TrainerData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [currentTrainer, setCurrentTrainer] = useState<TrainerData | null>(null);
    const [trainerCustomers, setTrainerCustomers] = useState<CustomerData[]>([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [customerPhoneSearch, setCustomerPhoneSearch] = useState("");
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [phoneSearchResult, setPhoneSearchResult] = useState<CustomerData | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [exerciseSessions, setExerciseSessions] = useState<ExerciseSessionData[]>([]);
    const [isLoadingExerciseSessions, setIsLoadingExerciseSessions] = useState(false);
    const [newSessionData, setNewSessionData] = useState({
        cufirstname: '',
        culastname: '',
        exerciseType: ''
    });
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

    // Thêm state mới cho chỉnh sửa buổi tập
    const [isEditSessionDialogOpen, setIsEditSessionDialogOpen] = useState(false);
    const [currentSession, setCurrentSession] = useState<ExerciseSessionData | null>(null);
    const [editSessionData, setEditSessionData] = useState({
        cufirstname: '',
        culastname: '',
        ptfirstname: '',
        ptlastname: '',
        exerciseType: ''
    });

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTrainers = filteredTrainers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);

    // Fetch dữ liệu huấn luyện viên từ API
    const fetchTrainers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    title: "Lỗi xác thực",
                    description: "Vui lòng đăng nhập để xem danh sách huấn luyện viên",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            const trainersData = await getTrainers(token);
            console.log('Trainers data:', trainersData);
            setTrainers(trainersData);
            setFilteredTrainers(trainersData);
        } catch (error: any) {
            console.error('Error fetching trainers:', error);
            toast({
                title: "Lỗi kết nối",
                description: error.response?.data?.message || "Không thể kết nối đến máy chủ",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchTrainers();
    }, [fetchTrainers]);

    // Xử lý tìm kiếm
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        const normalizedSearchTerm = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        if (!normalizedSearchTerm) {
            setFilteredTrainers(trainers);
            return;
        }

        const searchTerms = normalizedSearchTerm.split(/\s+/);
        const results = trainers.filter(trainer => {
            const normalizedName = trainer.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedPhone = trainer.phone.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedEmail = trainer.email.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            return searchTerms.every(term =>
                normalizedName.includes(term) ||
                normalizedPhone.includes(term) ||
                normalizedEmail.includes(term)
            );
        });

        setFilteredTrainers(results);
        setCurrentPage(1);
    };

    // Lấy danh sách khách hàng của PT
    const fetchTrainerCustomers = async (trainerId: string) => {
        setIsLoadingCustomers(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    title: "Lỗi xác thực",
                    description: "Vui lòng đăng nhập để xem danh sách khách hàng",
                    variant: "destructive",
                });
                setTrainerCustomers([]);
                return;
            }

            const customers = await getCustomersByTrainer(token, trainerId);
            console.log('Trainer customers:', customers);
            setTrainerCustomers(customers);
        } catch (error: any) {
            console.error('Error fetching trainer customers:', error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách khách hàng",
                variant: "destructive",
            });
            setTrainerCustomers([]);
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    // Tìm kiếm khách hàng theo số điện thoại
    const handleCustomerPhoneSearch = async () => {
        if (!customerPhoneSearch.trim()) {
            toast({
                title: "Lưu ý",
                description: "Vui lòng nhập số điện thoại khách hàng",
            });
            return;
        }

        setIsSearchingCustomer(true);
        setPhoneSearchResult(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    title: "Lỗi xác thực",
                    description: "Vui lòng đăng nhập để tìm kiếm khách hàng",
                    variant: "destructive",
                });
                return;
            }

            const customer = await getCustomerByPhone(token, customerPhoneSearch.trim());
            setPhoneSearchResult(customer);

            if (!customer) {
                toast({
                    title: "Không tìm thấy",
                    description: "Không tìm thấy khách hàng với số điện thoại này",
                });
            } else {
                toast({
                    title: "Tìm thấy khách hàng",
                    description: `Đã tìm thấy: ${customer.name}`,
                });

                // Tự động điền thông tin khách hàng vào các trường input
                if (customer.name) {
                    const nameParts = customer.name.split(' ');
                    let firstName = '';
                    let lastName = '';

                    if (nameParts.length > 1) {
                        // Tên là phần tử cuối cùng
                        firstName = nameParts[nameParts.length - 1];
                        // Họ và tên đệm là tất cả phần tử còn lại
                        lastName = nameParts.slice(0, nameParts.length - 1).join(' ');
                    } else {
                        firstName = customer.name;
                    }

                    setNewSessionData({
                        ...newSessionData,
                        cufirstname: firstName,
                        culastname: lastName
                    });
                }
            }
        } catch (error: any) {
            console.error('Error searching customer by phone:', error);
            toast({
                title: "Lỗi tìm kiếm",
                description: error.response?.data?.message || "Không thể tìm kiếm khách hàng",
                variant: "destructive",
            });
        } finally {
            setIsSearchingCustomer(false);
        }
    };

    // Xử lý sự kiện xem chi tiết
    const handleViewClick = async (trainer: TrainerData) => {
        setCurrentTrainer(trainer);
        setIsViewDialogOpen(true);

        // Reset và fetch danh sách khách hàng
        setTrainerCustomers([]);
        setCustomerPhoneSearch("");
        setPhoneSearchResult(null);
        fetchTrainerCustomers(trainer.id);
    };

    // Chuyển trang
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Chuyển đổi giới tính
    const formatGender = (gender: string) => {
        if (!gender) return "—";
        return gender.trim().toUpperCase() === "M" ? "Nam" : gender.trim().toUpperCase() === "F" ? "Nữ" : gender;
    };

    // Mở dialog chỉnh sửa
    const handleEditClick = async (trainer: TrainerData) => {
        setCurrentTrainer(trainer);
        setIsEditDialogOpen(true);
        setExerciseSessions([]);

        // Lấy danh sách buổi tập của PT
        fetchExerciseSessions(trainer.id);

        // Reset form thêm buổi tập
        setNewSessionData({
            cufirstname: '',
            culastname: '',
            exerciseType: ''
        });
        setSelectedCustomer(null);
    };

    // Lấy danh sách buổi tập
    const fetchExerciseSessions = async (trainerId: string) => {
        setIsLoadingExerciseSessions(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    title: "Lỗi xác thực",
                    description: "Vui lòng đăng nhập để xem danh sách buổi tập",
                    variant: "destructive",
                });
                return;
            }

            // Sử dụng hàm mới để lấy danh sách buổi tập chi tiết đã bao gồm thông tin khách hàng
            const detailedSessions = await getDetailedExerciseSessions(token, trainerId);
            console.log('Detailed exercise sessions with customer info:', detailedSessions);
            setExerciseSessions(detailedSessions);

        } catch (error: any) {
            console.error('Error fetching exercise sessions:', error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách buổi tập",
                variant: "destructive",
            });
        } finally {
            setIsLoadingExerciseSessions(false);
        }
    };

    // Thêm buổi tập mới
    const handleAddExerciseSession = async () => {
        if (!currentTrainer) {
            toast({
                title: "Lỗi",
                description: "Không tìm thấy thông tin huấn luyện viên",
                variant: "destructive",
            });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: "Lỗi xác thực",
                description: "Vui lòng đăng nhập để thêm buổi tập",
                variant: "destructive",
            });
            return;
        }

        // Kiểm tra dữ liệu
        if (!newSessionData.exerciseType) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn loại tập luyện",
                variant: "destructive",
            });
            return;
        }

        if (!selectedCustomer && (!newSessionData.cufirstname || !newSessionData.culastname)) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn khách hàng hoặc điền đầy đủ thông tin",
                variant: "destructive",
            });
            return;
        }

        try {
            const names = currentTrainer.name.split(' ');
            const ptfirstname = names[0] || '';
            const ptlastname = names.slice(1).join(' ') || '';

            // Lấy thông tin khách hàng từ khách hàng đã chọn hoặc từ form
            let cufirstname, culastname;

            if (selectedCustomer) {
                // Nếu có khách hàng đã chọn
                const customerNames = selectedCustomer.name.split(' ');
                if (customerNames.length > 1) {
                    // Đảm bảo đúng với backend: cufirstname là họ, culastname là tên
                    cufirstname = customerNames.slice(0, customerNames.length - 1).join(' '); // Họ
                    culastname = customerNames[customerNames.length - 1]; // Tên
                } else {
                    cufirstname = '';
                    culastname = selectedCustomer.name;
                }
            } else {
                // Nếu nhập từ form: form đã nhập đúng thứ tự (culastname là họ, cufirstname là tên)
                // Nhưng backend cần: cufirstname là họ, culastname là tên
                // Nên cần đảo ngược giá trị
                cufirstname = newSessionData.culastname; // Form: họ -> BE: cufirstname
                culastname = newSessionData.cufirstname; // Form: tên -> BE: culastname
            }

            const sessionData = {
                cufirstname, // Họ (BE: firstname của customer)
                culastname, // Tên (BE: lastname của customer)
                ptfirstname,
                ptlastname,
                exerciseType: newSessionData.exerciseType
            };

            console.log('Adding new exercise session with payload:', JSON.stringify(sessionData));

            const success = await addExerciseSession(token, sessionData);

            if (success) {
                toast({
                    title: "Thành công",
                    description: "Đã thêm buổi tập mới",
                });

                // Reset form và làm mới danh sách
                setNewSessionData({
                    cufirstname: '',
                    culastname: '',
                    exerciseType: ''
                });
                setSelectedCustomer(null);

                // Tải lại danh sách buổi tập
                fetchExerciseSessions(currentTrainer.id);
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể thêm buổi tập",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error('Error adding exercise session:', error);
            console.error('Error details:', error.response?.data || error.message);

            toast({
                title: "Lỗi",
                description: error.response?.data?.message || error.response?.data?.status || "Không thể thêm buổi tập",
                variant: "destructive",
            });
        }
    };

    // Chọn khách hàng từ danh sách
    const handleSelectCustomer = (customer: CustomerData) => {
        setSelectedCustomer(customer);
        // Reset thông tin tên từ form
        setNewSessionData({
            ...newSessionData,
            cufirstname: '',
            culastname: ''
        });
    };

    // Xử lý khi nhấp vào nút chỉnh sửa buổi tập
    const handleEditSessionClick = (session: ExerciseSessionData) => {
        setCurrentSession(session);

        // Tách họ và tên của khách hàng
        let cufirstname = '';
        let culastname = '';
        if (session.customerName) {
            const nameParts = session.customerName.split(' ');
            if (nameParts.length > 1) {
                // Tên là phần tử cuối cùng, họ và tên đệm là phần còn lại
                cufirstname = nameParts[nameParts.length - 1];
                culastname = nameParts.slice(0, nameParts.length - 1).join(' ');
            } else {
                cufirstname = session.customerName;
            }
        }

        // Tách họ và tên của huấn luyện viên
        let ptfirstname = '';
        let ptlastname = '';
        if (session.trainerName) {
            const nameParts = session.trainerName.split(' ');
            if (nameParts.length > 1) {
                ptfirstname = nameParts[0];
                ptlastname = nameParts.slice(1).join(' ');
            } else {
                ptfirstname = session.trainerName;
            }
        } else if (currentTrainer) {
            // Sử dụng thông tin từ huấn luyện viên hiện tại nếu không có trong buổi tập
            const nameParts = currentTrainer.name.split(' ');
            if (nameParts.length > 1) {
                ptfirstname = nameParts[0];
                ptlastname = nameParts.slice(1).join(' ');
            } else {
                ptfirstname = currentTrainer.name;
            }
        }

        // Thiết lập dữ liệu để chỉnh sửa
        setEditSessionData({
            cufirstname,
            culastname,
            ptfirstname,
            ptlastname,
            exerciseType: session.exerciseType || ''
        });

        // Mở dialog chỉnh sửa
        setIsEditSessionDialogOpen(true);
    };

    // Xử lý khi lưu thay đổi buổi tập
    const handleUpdateSession = async () => {
        if (!currentSession || !currentSession.id) {
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
                toast({
                    title: "Lỗi xác thực",
                    description: "Vui lòng đăng nhập để cập nhật buổi tập",
                    variant: "destructive",
                });
                return;
            }

            // Chuẩn bị dữ liệu để gửi đi
            const updateData = {
                sessionid: currentSession.id,
                cufirstname: editSessionData.culastname, // Lưu ý đảo ngược họ và tên để phù hợp với backend
                culastname: editSessionData.cufirstname,
                ptfirstname: editSessionData.ptfirstname,
                ptlastname: editSessionData.ptlastname,
                exerciseType: editSessionData.exerciseType
            };

            console.log('Updating exercise session with payload:', JSON.stringify(updateData));

            // Gọi API để cập nhật buổi tập
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/manager/updateExercise`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'token': token
                    }
                }
            );

            console.log('Update exercise session response:', response.data);

            if (response.data && response.data.status === "Sửa buổi tập thành công") {
                toast({
                    title: "Thành công",
                    description: "Đã cập nhật buổi tập",
                });

                // Đóng dialog và tải lại danh sách buổi tập
                setIsEditSessionDialogOpen(false);
                if (currentTrainer) {
                    fetchExerciseSessions(currentTrainer.id);
                }
            } else {
                toast({
                    title: "Lỗi",
                    description: response.data?.status || "Không thể cập nhật buổi tập",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error('Error updating exercise session:', error);
            console.error('Error details:', error.response?.data || error.message);

            toast({
                title: "Lỗi",
                description: error.response?.data?.message || error.response?.data?.status || "Không thể cập nhật buổi tập",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="w-full p-4">
                <h1 className="text-2xl font-bold mb-6">Danh sách huấn luyện viên</h1>
                <div className="flex justify-center items-center h-[400px]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu huấn luyện viên...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Danh sách huấn luyện viên</h1>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex gap-2 md:w-1/2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Tìm kiếm theo tên, email, SĐT..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Bảng danh sách */}
            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-blue-600 to-blue-500 hover:bg-blue-600">
                                <TableHead className="w-[50px] text-white font-semibold">STT</TableHead>
                                <TableHead className="text-white font-semibold">Tên huấn luyện viên</TableHead>
                                <TableHead className="text-white font-semibold">Email</TableHead>
                                <TableHead className="text-white font-semibold">Số điện thoại</TableHead>
                                <TableHead className="text-white font-semibold">Giới tính</TableHead>
                                <TableHead className="text-white font-semibold">Tuổi</TableHead>
                                <TableHead className="text-center text-white font-semibold w-[80px]">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentTrainers.length > 0 ? (
                                currentTrainers.map((trainer, index) => (
                                    <TableRow
                                        key={trainer.id}
                                        className="hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <TableCell className="font-medium text-gray-700">
                                            {indexOfFirstItem + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                                                    <User size={20} />
                                                </div>
                                                <span className="font-medium text-gray-800">{trainer.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{trainer.email || "—"}</TableCell>
                                        <TableCell className="text-gray-600">{trainer.phone || "—"}</TableCell>
                                        <TableCell className="text-gray-600">{formatGender(trainer.gender)}</TableCell>
                                        <TableCell className="text-gray-600">{trainer.age || "—"}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewClick(trainer)}
                                                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(trainer)}
                                                    className="hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                                                    title="Quản lý buổi tập"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <User className="h-12 w-12 mb-4 text-gray-400" />
                                            <p className="text-lg font-medium">Không tìm thấy huấn luyện viên nào</p>
                                            <p className="text-sm mt-1">Vui lòng thử lại với từ khóa khác</p>
                                        </div>
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
                <DialogContent className="bg-white md:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Thông tin huấn luyện viên</DialogTitle>
                    </DialogHeader>

                    {currentTrainer && (
                        <Tabs defaultValue="info" className="mt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
                                <TabsTrigger value="customers">Danh sách khách hàng</TabsTrigger>
                            </TabsList>

                            <TabsContent value="info" className="mt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                            <User size={40} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{currentTrainer.name}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                                <Mail className="h-4 w-4" />
                                                <span>{currentTrainer.email || "Chưa có email"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                                <Phone className="h-4 w-4" />
                                                <span>{currentTrainer.phone || "Chưa có số điện thoại"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">ID</p>
                                            <p>{currentTrainer.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Giới tính</p>
                                            <p>{formatGender(currentTrainer.gender)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Tuổi</p>
                                            <p>{currentTrainer.age || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Số khách hàng</p>
                                            <p>{trainerCustomers.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="customers" className="mt-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Danh sách khách hàng
                                        </CardTitle>
                                        <CardDescription>
                                            Tổng số: {trainerCustomers.length} khách hàng
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Form tìm kiếm khách hàng */}
                                        <div className="mb-4">
                                            <div className="text-sm font-medium mb-2">Tìm khách hàng theo số điện thoại</div>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input
                                                        placeholder="Nhập số điện thoại khách hàng..."
                                                        className="pl-8"
                                                        value={customerPhoneSearch}
                                                        onChange={(e) => setCustomerPhoneSearch(e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleCustomerPhoneSearch}
                                                    disabled={isSearchingCustomer}
                                                >
                                                    {isSearchingCustomer ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        <Search className="h-4 w-4 mr-2" />
                                                    )}
                                                    Tìm kiếm
                                                </Button>
                                            </div>

                                            {/* Kết quả tìm kiếm */}
                                            {phoneSearchResult && (
                                                <div className="mt-4 p-3 border rounded bg-blue-50">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-blue-800">{phoneSearchResult.name}</div>
                                                            <div className="text-sm text-gray-600">
                                                                <span className="inline-block mr-4">
                                                                    <Phone className="h-3 w-3 inline-block mr-1" />
                                                                    {phoneSearchResult.phone}
                                                                </span>
                                                                {phoneSearchResult.email && (
                                                                    <span>
                                                                        <Mail className="h-3 w-3 inline-block mr-1" />
                                                                        {phoneSearchResult.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Danh sách khách hàng */}
                                        {isLoadingCustomers ? (
                                            <div className="flex justify-center items-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                                <p className="ml-2 text-gray-600">Đang tải danh sách khách hàng...</p>
                                            </div>
                                        ) : trainerCustomers.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                                <p>Huấn luyện viên này chưa có khách hàng nào</p>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50">
                                                        <TableHead className="w-[50px]">STT</TableHead>
                                                        <TableHead>Tên khách hàng</TableHead>
                                                        <TableHead>Số điện thoại</TableHead>
                                                        <TableHead>Email</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {trainerCustomers.map((customer, index) => (
                                                        <TableRow key={customer.id}>
                                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                                            <TableCell className="font-medium text-gray-800">{customer.name || "Khách hàng không có tên"}</TableCell>
                                                            <TableCell>{customer.phone || "Chưa có số điện thoại"}</TableCell>
                                                            <TableCell>{customer.email || "Chưa có email"}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog quản lý buổi tập */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-white md:max-w-[800px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            Quản lý buổi tập - {currentTrainer?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {currentTrainer && (
                        <Tabs defaultValue="sessions" className="mt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="sessions">Danh sách buổi tập</TabsTrigger>
                                <TabsTrigger value="add-session">Thêm khách hàng</TabsTrigger>
                            </TabsList>

                            <TabsContent value="sessions" className="mt-4 space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Danh sách buổi tập
                                        </CardTitle>
                                        <CardDescription>
                                            {exerciseSessions.length > 0
                                                ? `Có ${exerciseSessions.length} buổi tập`
                                                : "Chưa có buổi tập nào"
                                            }
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingExerciseSessions ? (
                                            <div className="flex justify-center items-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                                <p className="ml-2 text-gray-600">Đang tải danh sách buổi tập...</p>
                                            </div>
                                        ) : exerciseSessions.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                                <p>Huấn luyện viên này chưa có buổi tập nào</p>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50">
                                                        <TableHead className="w-[50px]">STT</TableHead>
                                                        <TableHead>Khách hàng</TableHead>
                                                        <TableHead>Loại tập luyện</TableHead>
                                                        <TableHead className="text-center w-[80px]">Thao tác</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {exerciseSessions.map((session, index) => (
                                                        <TableRow key={session.id || index}>
                                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                                            <TableCell>
                                                                {session.customerName ? (
                                                                    session.customerName !== "Khách hàng không xác định" ? (
                                                                        session.customerName
                                                                    ) : (
                                                                        <div className="flex items-center">
                                                                            <span className="text-red-500">Khách hàng không xác định</span>
                                                                            <div className="relative ml-2 group">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                <div className="absolute z-10 invisible group-hover:visible bg-black text-white p-2 rounded text-xs w-64 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                                                                                    Dữ liệu về khách hàng không có sẵn. Có thể khách hàng đã bị xóa hoặc dữ liệu chưa được đồng bộ. Bạn có thể cập nhật thông tin này sau.
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ) : (
                                                                    <div className="flex items-center">
                                                                        <span className="text-red-500">Khách hàng không xác định</span>
                                                                        <div className="relative ml-2 group">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <div className="absolute z-10 invisible group-hover:visible bg-black text-white p-2 rounded text-xs w-64 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                                                                                Dữ liệu về khách hàng không có sẵn. Có thể khách hàng đã bị xóa hoặc dữ liệu chưa được đồng bộ. Bạn có thể cập nhật thông tin này sau.
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{session.exerciseType}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditSessionClick(session)}
                                                                    className="hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                                                                    title="Chỉnh sửa buổi tập"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="add-session" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Plus className="h-5 w-5" />
                                            Thêm khách hàng
                                        </CardTitle>
                                        <CardDescription>
                                            Tạo buổi tập mới cho huấn luyện viên {currentTrainer.name}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Form thêm buổi tập */}
                                            <div className="space-y-4">
                                                {/* Phần tìm kiếm khách hàng */}
                                                <div className="mb-4">
                                                    <div className="text-sm font-medium mb-2">Tìm khách hàng theo số điện thoại</div>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                                            <Input
                                                                placeholder="Nhập số điện thoại khách hàng..."
                                                                className="pl-8"
                                                                value={customerPhoneSearch}
                                                                onChange={(e) => setCustomerPhoneSearch(e.target.value)}
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleCustomerPhoneSearch}
                                                            disabled={isSearchingCustomer}
                                                        >
                                                            {isSearchingCustomer ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            ) : (
                                                                <Search className="h-4 w-4 mr-2" />
                                                            )}
                                                            Tìm kiếm
                                                        </Button>
                                                    </div>

                                                    {phoneSearchResult && (
                                                        <div className="mt-4 p-3 border rounded bg-blue-50">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                    <User className="h-5 w-5 text-blue-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-blue-800">{phoneSearchResult.name}</div>
                                                                    <div className="text-sm text-gray-600">
                                                                        <span className="inline-block mr-4">
                                                                            <Phone className="h-3 w-3 inline-block mr-1" />
                                                                            {phoneSearchResult.phone}
                                                                        </span>
                                                                        {phoneSearchResult.email && (
                                                                            <span>
                                                                                <Mail className="h-3 w-3 inline-block mr-1" />
                                                                                {phoneSearchResult.email}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Hiển thị khách hàng đã chọn */}
                                                    {selectedCustomer && (
                                                        <div className="mt-4 p-3 border rounded bg-green-50">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-5 w-5 text-green-600" />
                                                                    <div>
                                                                        <div className="font-medium">Khách hàng đã chọn:</div>
                                                                        <div className="text-green-700 font-semibold">{selectedCustomer.name}</div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setSelectedCustomer(null)}
                                                                >
                                                                    Bỏ chọn
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Hoặc nhập thông tin khách hàng mới */}
                                                {!selectedCustomer && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="culastname">Họ khách hàng</Label>
                                                                <Input
                                                                    id="culastname"
                                                                    placeholder="Ví dụ: Nguyễn Văn"
                                                                    value={newSessionData.culastname}
                                                                    onChange={(e) => setNewSessionData({ ...newSessionData, culastname: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="cufirstname">Tên khách hàng</Label>
                                                                <Input
                                                                    id="cufirstname"
                                                                    placeholder="Ví dụ: A"
                                                                    value={newSessionData.cufirstname}
                                                                    onChange={(e) => setNewSessionData({ ...newSessionData, cufirstname: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                <div className="space-y-2">
                                                    <Label htmlFor="exerciseType">Loại tập luyện <span className="text-red-500">*</span></Label>
                                                    <Select
                                                        value={newSessionData.exerciseType}
                                                        onValueChange={(value) => setNewSessionData({ ...newSessionData, exerciseType: value })}
                                                    >
                                                        <SelectTrigger>
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

                                                <Button
                                                    className="w-full mt-4"
                                                    onClick={handleAddExerciseSession}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Thêm buổi tập
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog chỉnh sửa buổi tập */}
            <Dialog open={isEditSessionDialogOpen} onOpenChange={setIsEditSessionDialogOpen}>
                <DialogContent className="bg-white md:max-w-[800px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            Chỉnh sửa buổi tập - {currentSession?.customerName}
                        </DialogTitle>
                    </DialogHeader>

                    {currentSession && (
                        <div className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Edit className="h-5 w-5" />
                                        Thông tin buổi tập
                                    </CardTitle>
                                    <CardDescription>
                                        Cập nhật thông tin buổi tập
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="culastname">Họ khách hàng</Label>
                                            <Input
                                                id="culastname"
                                                placeholder="Ví dụ: Nguyễn Văn"
                                                value={editSessionData.culastname}
                                                onChange={(e) => setEditSessionData({ ...editSessionData, culastname: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cufirstname">Tên khách hàng</Label>
                                            <Input
                                                id="cufirstname"
                                                placeholder="Ví dụ: A"
                                                value={editSessionData.cufirstname}
                                                onChange={(e) => setEditSessionData({ ...editSessionData, cufirstname: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ptfirstname">Họ huấn luyện viên</Label>
                                            <Input
                                                id="ptfirstname"
                                                placeholder="Ví dụ: Nguyễn"
                                                value={editSessionData.ptfirstname}
                                                onChange={(e) => setEditSessionData({ ...editSessionData, ptfirstname: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ptlastname">Tên huấn luyện viên</Label>
                                            <Input
                                                id="ptlastname"
                                                placeholder="Ví dụ: Văn"
                                                value={editSessionData.ptlastname}
                                                onChange={(e) => setEditSessionData({ ...editSessionData, ptlastname: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="exerciseType">Loại tập luyện</Label>
                                            <Select
                                                value={editSessionData.exerciseType}
                                                onValueChange={(value) => setEditSessionData({ ...editSessionData, exerciseType: value })}
                                            >
                                                <SelectTrigger>
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
                                        <Button
                                            className="w-full mt-4"
                                            onClick={handleUpdateSession}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Cập nhật buổi tập
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsEditSessionDialogOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TrainerListPage;
