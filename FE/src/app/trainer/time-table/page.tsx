"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/popup';
import { Event } from '@/components/ui/event-form';
import axios from 'axios';
import { useToast } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { Customer, getCustomersList, getTrainerId } from '@/utils/auth';

moment.locale('vi');
const localizer = momentLocalizer(moment);

const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json'
    }
});

interface TrainerEvent extends Event {
  customerId: number;
  exerciseType: string;
}

export default function TimeTablePage() {
    const [events, setEvents] = useState<TrainerEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<TrainerEvent | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const { toast } = useToast();
    
    const [formValues, setFormValues] = useState({
        exerciseType: "",
        customerId: "",
        beginAt: "",
        endAt: "",
        description: ""
    });
    
    const [trainerId, setTrainerId] = useState<number | null>(null);
    
    useEffect(() => {
        const fetchTrainerId = async () => {
            try {
                const id = await getTrainerId();
                if (id) {
                    console.log("Đã lấy được trainerId:", id);
                    setTrainerId(id);
                } else {
                    toast({
                        title: "Lỗi",
                        description: "Không thể xác định ID huấn luyện viên. Vui lòng đăng nhập lại.",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error("Lỗi khi lấy ID huấn luyện viên:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể xác định ID huấn luyện viên. Vui lòng đăng nhập lại.",
                    variant: "destructive"
                });
            }
        };
        
        fetchTrainerId();
    }, [toast]);
    
    const fetchSchedule = async () => {
        try {
            setIsLoading(true);
            
            if (!trainerId) {
                console.error("trainerId chưa được xác định");
                return;
            }
            
            const response = await api.get(`/pt/schedule/${trainerId}`);
            
            const formattedEvents = response.data.map((session: any) => ({
                id: session.id,
                title: session.exerciseType,
                start: new Date(session.beginAt),
                end: new Date(session.endAt),
                description: session.description,
                location: 'Phòng tập chính', 
                customerId: session.customer.id, 
                exerciseType: session.exerciseType,
                backgroundColor: getRandomColor() 
            }));
        
            
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Lỗi khi lấy lịch tập:", error);
            toast({
                title: "Lỗi",
                description: "Không thể lấy lịch tập. Vui lòng thử lại sau.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (trainerId) {
            fetchSchedule();
            fetchCustomers();
        }
    }, [trainerId]);
    
    const getRandomColor = () => {
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
        return colors[Math.floor(Math.random() * colors.length)];
    };
    
    const fetchCustomers = async () => {
        try {
            const customersList = await getCustomersList();
            if (customersList.length > 0) {
                console.log("Danh sách khách hàng từ API:", customersList);
                setCustomers(customersList);
                return;
            }
            
            try {
                if (trainerId) {
                    const ptCustomersResponse = await api.post("/pt/customer-list", { trainerId });
                    if (ptCustomersResponse.data && ptCustomersResponse.data.length > 0) {
                        setCustomers(ptCustomersResponse.data);
                        return;
                    }
                }
                
                const adminResponse = await api.get("/admin/getCustomerList");
                if (adminResponse.data && adminResponse.data.data) {
                    setCustomers(adminResponse.data.data);
                }
            } catch (fallbackError) {
                console.error("Lỗi khi sử dụng các API khác:", fallbackError);
                toast({
                    title: "Lỗi",
                    description: "Không thể lấy danh sách khách hàng. Vui lòng thử lại sau.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khách hàng:", error);
            toast({
                title: "Lỗi",
                description: "Không thể lấy danh sách khách hàng. Vui lòng thử lại sau.",
                variant: "destructive"
            });
        }
    };
    
    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setSelectedEvent(null);
        setSelectedSlot({ start, end });
        setFormValues({
            exerciseType: "",
            customerId: "",
            beginAt: formatDateTimeForInput(start),
            endAt: formatDateTimeForInput(end),
            description: ""
        });
        setShowForm(true);
    };
    
    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event as TrainerEvent);
        setShowDetails(true);
    };
    
    const handleEditEvent = () => {
        if (selectedEvent) {
            setFormValues({
                exerciseType: selectedEvent.exerciseType || "",
                customerId: String(selectedEvent.customerId) || "",
                beginAt: formatDateTimeForInput(selectedEvent.start),
                endAt: formatDateTimeForInput(selectedEvent.end),
                description: selectedEvent.description || ""
            });
            setShowDetails(false);
            setShowForm(true);
        }
    };
    
    const formatDateTimeForInput = (date: Date | string): string => {
        return moment(date).format("YYYY-MM-DDTHH:mm");
    };
    
    const formatDateTimeForAPI = (date: Date): string => {
        return moment(date).format("YYYY-MM-DDTHH:mm:ss");
    };
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (!formValues.customerId) {
                toast({
                    title: "Lỗi",
                    description: "Vui lòng chọn khách hàng",
                    variant: "destructive"
                });
                return;
            }
            
            if (!formValues.exerciseType) {
                toast({
                    title: "Lỗi",
                    description: "Vui lòng chọn loại bài tập",
                    variant: "destructive"
                });
                return;
            }
            
            if (!trainerId) {
                toast({
                    title: "Lỗi",
                    description: "Không thể xác định ID huấn luyện viên",
                    variant: "destructive"
                });
                return;
            }
            
            const sessionData = {
                trainerId,
                customerId: parseInt(formValues.customerId),
                exerciseType: formValues.exerciseType,
                beginAt: formatDateTimeForAPI(new Date(formValues.beginAt)),
                endAt: formatDateTimeForAPI(new Date(formValues.endAt)),
                description: formValues.description || ""
            };
            
            
            if (selectedEvent) {
                try {
                    const response = await api.post(`/pt/update-schedule/${selectedEvent.id}`, sessionData);
                    toast({
                        title: "Thành công",
                        description: "Đã cập nhật lịch tập"
                    });
                    fetchSchedule();
                } catch (error: any) {
                    console.error("Lỗi khi cập nhật lịch tập:", error);
                    console.error("Chi tiết lỗi:", error.response?.data || error.message);
                    toast({
                        title: "Lỗi",
                        description: "Không thể cập nhật lịch tập: " + (error.response?.data?.message || error.message),
                        variant: "destructive"
                    });
                    return;
                }
            } else {
                try {
                    const response = await api.post("/pt/add-schedule", sessionData);
                    toast({
                        title: "Thành công",
                        description: "Đã thêm lịch tập mới"
                    });
                    fetchSchedule();
                } catch (error: any) {
                    console.error("Lỗi khi thêm lịch tập:", error);
                    console.error("Chi tiết lỗi:", error.response?.data || error.message);
                    toast({
                        title: "Lỗi",
                        description: "Không thể thêm lịch tập: " + (error.response?.data?.message || error.message),
                        variant: "destructive"
                    });
                    return;
                }
            }
            
            setShowForm(false);
            setSelectedEvent(null);
            setSelectedSlot(null);
            setFormValues({
                exerciseType: "",
                customerId: "",
                beginAt: "",
                endAt: "",
                description: ""
            });
        } catch (error) {
            console.error("Lỗi khi lưu lịch tập:", error);
            toast({
                title: "Lỗi",
                description: "Không thể lưu lịch tập. Vui lòng thử lại sau.",
                variant: "destructive"
            });
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    };
    
    const handleExerciseTypeChange = (value: string) => {
        setFormValues({
            ...formValues,
            exerciseType: value
        });
    };
    
    const handleCustomerSelect = (value: string) => {
        setFormValues({
            ...formValues,
            customerId: value
        });
    };
    
    const getCustomerFullName = (customerId: number) => {
        const customer = customers.find(c => c.customerId === customerId);
        if (customer) {
            return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        }
        return 'Không có thông tin';
    };
    
    const eventPropGetter = (event: any) => {
        return {
            style: {
                backgroundColor: event.backgroundColor || '#3b82f6'
            }
        };
    };
    
    return (
        <div className="w-full p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold ">Lịch huấn luyện</h1>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                        setSelectedEvent(null);
                        const now = new Date();
                        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                        setFormValues({
                            exerciseType: "",
                            customerId: "",
                            beginAt: formatDateTimeForInput(now),
                            endAt: formatDateTimeForInput(oneHourLater),
                            description: ""
                        });
                        setShowForm(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Thêm lịch tập mới
                </Button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 700 }}
                        views={['month', 'week', 'day']}
                        view={view as any}
                        date={date}
                        onView={(newView) => setView(newView as string)}
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
                )}
            </div>
            
            <Modal 
                title="Chi tiết lịch tập" 
                description="Thông tin chi tiết về buổi tập luyện" 
                isOpen={showDetails} 
                onClose={() => setShowDetails(false)}
            >
                {selectedEvent && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                            <p className="text-gray-600">
                                Thời gian: {moment(selectedEvent.start).format('HH:mm - DD/MM/YYYY')} - {moment(selectedEvent.end).format('HH:mm - DD/MM/YYYY')}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold">Loại bài tập:</p>
                            <p>{selectedEvent.exerciseType}</p>
                        </div>
                        {selectedEvent.description && (
                            <div>
                                <p className="font-semibold">Mô tả:</p>
                                <p>{selectedEvent.description}</p>
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">Khách hàng:</p>
                            <p>{getCustomerFullName(selectedEvent.customerId)}</p>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setShowDetails(false)}>
                                Đóng
                            </Button>
                            <Button onClick={handleEditEvent}>
                                Chỉnh sửa
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal 
                title={selectedEvent ? "Chỉnh sửa lịch tập" : "Thêm lịch tập mới"} 
                description="Nhập thông tin chi tiết về buổi tập luyện"
                isOpen={showForm} 
                onClose={() => setShowForm(false)}
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium text-sm">
                            Loại bài tập
                        </label>
                        <Select 
                            value={formValues.exerciseType}
                            onValueChange={handleExerciseTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại bài tập" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Gym">Gym</SelectItem>
                                <SelectItem value="Yoga">Yoga</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <label className="block mb-1 font-medium text-sm">
                            Chọn khách hàng
                        </label>
                        <Select 
                            value={formValues.customerId}
                            onValueChange={handleCustomerSelect}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn khách hàng" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(customer => (
                                    <SelectItem key={customer.customerId} value={String(customer.customerId)}>
                                        {`${customer.firstName || ''} ${customer.lastName || ''}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="beginAt" className="block mb-1 font-medium text-sm">
                                Thời gian bắt đầu
                            </label>
                            <Input
                                type="datetime-local"
                                id="beginAt"
                                name="beginAt"
                                value={formValues.beginAt}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="endAt" className="block mb-1 font-medium text-sm">
                                Thời gian kết thúc
                            </label>
                            <Input
                                type="datetime-local"
                                id="endAt"
                                name="endAt"
                                value={formValues.endAt}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block mb-1 font-medium text-sm">
                            Mô tả
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formValues.description}
                            onChange={handleInputChange}
                            placeholder="Mô tả chi tiết về buổi tập..."
                            className="min-h-24"
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">
                            {selectedEvent ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}