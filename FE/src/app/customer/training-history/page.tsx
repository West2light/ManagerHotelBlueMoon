"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import axios from "axios";
import { getCurrentUser } from "@/utils/auth";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import Modal from '@/components/ui/popup';
import { Event } from '@/components/ui/event-form';

interface TrainingSession {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
  ptName: string;
  type: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  notes?: string;
}

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop<Event>(Calendar);

const CustomEvent = ({ event }: { event: Event }) => {
  return (
    <div className="h-full w-full overflow-hidden p-0.5 text-sm flex flex-col">
      <div className="font-medium truncate leading-tight">{event.title}</div>
      {event.trainerName && (
        <div className="truncate opacity-80 leading-tight text-xs">PT: {event.trainerName}</div>
      )}
    </div>
  );
};

const getEventStyle = (event: Event) => {
  if (event.location === 'Phòng tập chính') {
    return { 
      backgroundColor: '#86efac', 
      borderColor: '#4ade80',
      color: '#166534' 
    }; 
  } else if (event.location === 'Phòng cardio') {
    return { 
      backgroundColor: '#93c5fd', 
      borderColor: '#60a5fa',
      color: '#1e40af' 
    }; 
  } else {
    return { 
      backgroundColor: '#cbd5e1', 
      borderColor: '#94a3b8',
      color: '#334155' 
    }; 
  }
};

const EventDetails: React.FC<{ event: Event | null }> = ({ event }) => {
  if (!event) return null;
  return (
    <div className="space-y-2">
      <p><span className="font-semibold">Bắt đầu:</span> {moment(event.start).format('DD/MM/YYYY HH:mm')}</p>
      <p><span className="font-semibold">Kết thúc:</span> {moment(event.end).format('DD/MM/YYYY HH:mm')}</p>
      <p><span className="font-semibold">Thời lượng:</span> {moment.duration(moment(event.end).diff(event.start)).asHours()} giờ</p>
      {event.trainerName && (
        <p><span className="font-semibold">Huấn luyện viên:</span> {event.trainerName}</p>
      )}
      {event.description && (
        <p><span className="font-semibold">Mô tả:</span> {event.description}</p>
      )}
      {event.location && (
        <p><span className="font-semibold">Địa điểm:</span> {event.location}</p>
      )}
    </div>
  );
};

function TrainingCalendar({ events }: { events: Event[] }) {
  const [myEvents, setMyEvents] = useState<Event[]>(events);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  
  useEffect(() => {
    setMyEvents(events);
  }, [events]);
  
  const onSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };
  
  const handleCloseModal = () => {
    setShowDetails(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <button 
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => setDate(new Date())}
            >
              Hôm nay
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => {
                const newDate = view === 'month' 
                  ? moment(date).subtract(1, 'month').toDate()
                  : view === 'week'
                  ? moment(date).subtract(1, 'week').toDate()
                  : moment(date).subtract(1, 'day').toDate();
                setDate(newDate);
              }}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="text-lg font-medium">
              {view === 'month' 
                ? moment(date).format('MMMM YYYY')
                : view === 'week'
                ? `${moment(date).startOf('week').format('DD/MM')} - ${moment(date).endOf('week').format('DD/MM/YYYY')}`
                : moment(date).format('DD/MM/YYYY')
              }
            </div>
            
            <button 
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => {
                const newDate = view === 'month' 
                  ? moment(date).add(1, 'month').toDate()
                  : view === 'week'
                  ? moment(date).add(1, 'week').toDate()
                  : moment(date).add(1, 'day').toDate();
                setDate(newDate);
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 border rounded ${view === 'month' ? 'bg-blue-600 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setView('month')}
            >
              Tháng
            </button>
            <button 
              className={`px-3 py-1 border rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setView('week')}
            >
              Tuần
            </button>
            <button 
              className={`px-3 py-1 border rounded ${view === 'day' ? 'bg-blue-600 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setView('day')}
            >
              Ngày
            </button>
          </div>
        </div>
        
        <DnDCalendar
          localizer={localizer}
          events={myEvents}
          defaultDate={new Date()}
          date={date}
          view={view as any}
          onView={(newView) => setView(newView)}
          onNavigate={(newDate) => setDate(newDate)}
          defaultView='month'
          startAccessor="start"
          endAccessor="end"
          style={{
            height: "calc(100vh - 280px)",
            paddingBottom: "2rem",
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            borderRadius: '8px',
          }}
          onSelectEvent={onSelectEvent}
          resizable={false}
          selectable={false}
          components={{
            event: CustomEvent,
            toolbar: () => null
          }}
          eventPropGetter={(event) => ({
            style: {
              ...getEventStyle(event),
              minHeight: '2rem',
              maxHeight: '2rem',
              padding: 0,
              margin: '1px 0',
              overflow: 'hidden'
            }
          })}
          dayPropGetter={(date) => {
            const today = new Date();
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();

            return {
              style: isToday ? { backgroundColor: '#f0f9ff' } : {}
            };
          }}
          formats={{
            timeGutterFormat: (date, culture, localizer) => localizer?.format(date, 'HH:mm', culture) || '',
            dayFormat: (date, culture, localizer) => localizer?.format(date, 'ddd DD/MM', culture) || '',
            dayRangeHeaderFormat: ({ start, end }) => {
              return `${moment(start).format('DD/MM/YYYY')} - ${moment(end).format('DD/MM/YYYY')}`;
            }
          }}
          messages={{
            today: 'Hôm nay',
            previous: 'Trước',
            next: 'Sau',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày',
            showMore: (total) => `+ ${total} buổi tập khác`,
          }}
          views={['month', 'week', 'day']}
        />
      </div>
      
      <Modal
        isOpen={showDetails}
        onClose={handleCloseModal}
        title={selectedEvent?.title || "Chi tiết buổi tập"}
        className="w-full max-w-md"
      >
        <div className="space-y-4">
          <EventDetails event={selectedEvent} />
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function TrainingHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessionsOnSelectedDate, setSessionsOnSelectedDate] = useState<TrainingSession[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([]);
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id ? parseInt(currentUser.id) : 0;
  useEffect(() => {
    fetchTrainingHistory();
  }, []);
  
  useEffect(() => {
    if (selectedDate && trainingSessions.length > 0) {
      const sessionsOnDate = trainingSessions.filter(session => 
        session.date.toDateString() === selectedDate.toDateString()
      );
      setSessionsOnSelectedDate(sessionsOnDate);
    } else {
      setSessionsOnSelectedDate([]);
    }
  }, [selectedDate, trainingSessions]);
  
  const fetchTrainingHistory = async () => {
    setIsLoading(true);
    try {
      const userId = currentUserId; 
      console.log("userId: ", userId);
      const response = await axios.post('http://localhost:3001/customer/getSessionsWithPT', { userId });
      console.log("response: ", response);
      if (response.data && response.data.status === "Lấy danh sách session thành công") {
        const sessionData = response.data.data;
        
        const formattedSessions: TrainingSession[] = sessionData.map((session: any) => {
          const beginTime = new Date(session.sessionBeginTime);
          const endTime = new Date(session.sessionEndTime);
          
          const now = new Date();
          let status: 'completed' | 'upcoming' | 'cancelled' = 'upcoming';
          if (endTime < now) {
            status = 'completed';
          }
          
          return {
            id: session.sessionId,
            date: beginTime,
            startTime: moment(beginTime).format('HH:mm'),
            endTime: moment(endTime).format('HH:mm'),
            ptName: session.trainer,
            type: "Cá nhân", 
            status,
            notes: session.description || ""
          };
        });
        
        setTrainingSessions(formattedSessions);
        
        const events: Event[] = formattedSessions.map(session => {
          const [hours, minutes] = session.startTime.split(':').map(Number);
          const [endHours, endMinutes] = session.endTime.split(':').map(Number);
          
          const startDate = new Date(session.date);
          startDate.setHours(hours, minutes);
          
          const endDate = new Date(session.date);
          endDate.setHours(endHours, endMinutes);
          
          return {
            id: session.id,
            title: `Buổi tập ${session.type}`,
            start: startDate,
            end: endDate,
            description: session.notes,
            location: session.status === 'completed' ? 'Phòng tập chính' : 'Phòng cardio',
            trainerName: session.ptName
          };
        });
        
        setCalendarEvents(events);
        
        const today = new Date();
        const todaySessions = formattedSessions.filter(session => 
          session.date.toDateString() === today.toDateString()
        );
        setSessionsOnSelectedDate(todaySessions);
      } 
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử tập luyện:', error);
    } finally {
      setIsLoading(false);
    }
  };

  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Đã hoàn thành</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-500">Sắp tới</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-500">Không xác định</Badge>;
    }
  };

  const pastSessions = trainingSessions.filter(session => 
    session.status === 'completed'
  ).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const upcomingSessions = trainingSessions.filter(session => 
    session.status === 'upcoming'
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">      
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">Lịch tập</TabsTrigger>
          <TabsTrigger value="history">Lịch sử buổi tập</TabsTrigger>
          <TabsTrigger value="upcoming">Buổi tập sắp tới</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Lịch tập cá nhân</CardTitle>
              <CardDescription>
                Xem lịch tập của bạn với huấn luyện viên cá nhân
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="h-[75vh]">
                  <TrainingCalendar events={calendarEvents} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử buổi tập</CardTitle>
              <CardDescription>
                Các buổi tập bạn đã hoàn thành với huấn luyện viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pastSessions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Huấn luyện viên</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastSessions.map(session => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {session.date.toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {session.startTime} - {session.endTime}
                        </TableCell>
                        <TableCell>{session.ptName}</TableCell>
                        <TableCell>{session.type}</TableCell>
                        <TableCell>{session.notes || "-"}</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Bạn chưa có buổi tập nào với huấn luyện viên
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Buổi tập sắp tới</CardTitle>
              <CardDescription>
                Các buổi tập đã lên lịch với huấn luyện viên của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : upcomingSessions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Huấn luyện viên</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingSessions.map(session => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {session.date.toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {session.startTime} - {session.endTime}
                        </TableCell>
                        <TableCell>{session.ptName}</TableCell>
                        <TableCell>{session.type}</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Bạn không có buổi tập nào sắp tới
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}