import axios from 'axios';
import moment from 'moment';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ExerciseSession {
    id: string;
    title: string;
    trainerId?: string;
    trainerName?: string;
    customerId?: string;
    customerName?: string;
    start?: Date;
    end?: Date;
    exerciseType: string;
    description?: string;
    backgroundColor?: string;
}

export const getExerciseSessions = async (token: string): Promise<ExerciseSession[]> => {
    try {
        console.log('Calling API:', `${API_URL}/manager/getExercise`);
        console.log('Token:', token);

        const response = await axios.get(`${API_URL}/manager/getExercise`, {
            headers: {
                'token': token
            }
        });

        console.log('API Response:', response.data);
        console.log("API Response detail:", JSON.stringify(response.data));
        console.log("First session in list:", response.data.list && response.data.list.length > 0 ? JSON.stringify(response.data.list[0]) : "No sessions");

        if (response.data && response.data.list) {
            return response.data.list.map((session: any) => {
                console.log('Processing session:', session);

                // Xử lý sessionid đặc biệt cẩn thận
                let sessionId = '';
                if (session.sessionid !== undefined && session.sessionid !== null) {
                    sessionId = String(session.sessionid);
                    console.log('Session ID parsed:', sessionId);
                }

                // Tạo đối tượng session base
                const sessionObject: ExerciseSession = {
                    id: sessionId,
                    title: `${session.customer_name || 'Khách hàng'} - ${session.exercise_type || 'Buổi tập'}`,
                    customerName: session.customer_name,
                    trainerName: session.trainer_name,
                    exerciseType: session.exercise_type,
                    backgroundColor: getRandomColor()
                };

                // Xử lý thời gian an toàn, bỏ qua nếu giá trị null
                try {
                    if (session.begin_time) {
                        sessionObject.start = moment(session.begin_time, 'DD/MM/YYYY HH:mm').toDate();
                    }
                } catch (error) {
                    console.warn('Không thể xử lý thời gian bắt đầu:', error);
                }

                try {
                    if (session.end_time) {
                        sessionObject.end = moment(session.end_time, 'DD/MM/YYYY HH:mm').toDate();
                    }
                } catch (error) {
                    console.warn('Không thể xử lý thời gian kết thúc:', error);
                }

                // Chỉ thêm description nếu có giá trị
                if (session.description) {
                    sessionObject.description = session.description;
                }

                return sessionObject;
            });
        }
        throw new Error(response.data.message || 'Failed to fetch exercise sessions');
    } catch (error: any) {
        console.error('Error details:', error);
        if (error.response) {
            console.error('Server error:', error.response.data);
            throw new Error(error.response.data.message || 'Server error occurred');
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('Không thể kết nối đến server');
        } else {
            const errorMessage = error.message || 'Lỗi khi gửi request';

            // Kiểm tra lỗi cụ thể từ LocalDateTime
            if (errorMessage.includes('LocalDateTime.format') && errorMessage.includes('null')) {
                console.error('Lỗi dữ liệu từ server - giá trị thời gian null:', errorMessage);
                throw new Error('Dữ liệu từ server chứa giá trị thời gian không hợp lệ. Vui lòng liên hệ quản trị viên.');
            }

            console.error('Request error:', errorMessage);
            throw new Error('Đã xảy ra lỗi: ' + errorMessage);
        }
    }
};

export const addExerciseSession = async (token: string, data: {
    cufirstname: string;
    culastname: string;
    ptfirstname?: string;
    ptlastname?: string;
    exerciseType: string;
    beginAt?: Date;
    endAt?: Date;
    description?: string;
}): Promise<void> => {
    try {
        // Chuẩn bị dữ liệu trước khi gửi
        const payload: any = {
            cufirstname: data.cufirstname,
            culastname: data.culastname,
            exerciseType: data.exerciseType
        };

        // Chỉ thêm các trường có giá trị
        if (data.ptfirstname) {
            payload.ptfirstname = data.ptfirstname;
        }

        if (data.ptlastname) {
            payload.ptlastname = data.ptlastname;
        }

        if (data.beginAt) {
            payload.beginAt = moment(data.beginAt).format('YYYY-MM-DD HH:mm:ss');
        }

        if (data.endAt) {
            payload.endAt = moment(data.endAt).format('YYYY-MM-DD HH:mm:ss');
        }

        if (data.description) {
            payload.description = data.description;
        }

        console.log('Payload sent to server (add):', payload);

        const response = await axios.post(`${API_URL}/manager/addExercise`, payload, {
            headers: {
                'token': token,
                'Content-Type': 'application/json'
            }
        });

        console.log('Server response (add):', response.data);

        // Kiểm tra cả hai trường status và message
        if (response.data.status && !response.data.status.includes('thành công')) {
            throw new Error(response.data.status || 'Failed to add exercise session');
        }

        if (response.data.message && !response.data.message.includes('thành công')) {
            throw new Error(response.data.message || 'Failed to add exercise session');
        }
    } catch (error: any) {
        console.error('Error in addExerciseSession:', error);
        if (error.response) {
            console.error('Server error:', error.response.data);
            const errorMessage = error.response.data.status || error.response.data.message || 'Server error occurred';
            throw new Error(errorMessage);
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('Không thể kết nối đến server');
        } else {
            console.error('Request error:', error.message);
            throw new Error('Lỗi khi gửi request');
        }
    }
};

export const updateExerciseSession = async (token: string, sessionId: string, data: {
    sessionid?: number;
    exerciseType: string;
    beginAt?: Date | string;
    endAt?: Date | string;
    description?: string;
    cufirstname?: string;
    culastname?: string;
    ptfirstname?: string;
    ptlastname?: string;
}): Promise<void> => {
    try {
        console.log('=== updateExerciseSession STARTED ===');
        console.log('updateExerciseSession called with sessionId:', sessionId, 'Type:', typeof sessionId);

        // Kiểm tra sessionId
        if (!sessionId || sessionId.trim() === '') {
            const errMsg = 'Session ID is invalid or empty';
            console.error(errMsg);
            alert(errMsg);
            throw new Error(errMsg);
        }

        // Convert sessionId to number (backend yêu cầu ID là số)
        // Dù sessionId được khai báo là string, nhưng backend sẽ parse nó thành số
        let sessionIdNumber;
        try {
            sessionIdNumber = parseInt(sessionId);
            if (isNaN(sessionIdNumber)) {
                throw new Error('SessionId is not a valid number');
            }
            console.log('SessionId parsed to number:', sessionIdNumber);
        } catch (error) {
            console.error('Failed to parse sessionId to number:', error);
            alert('Lỗi: ID buổi tập không phải số hợp lệ');
            throw new Error('SessionId must be a valid number');
        }

        // Tạo payload phù hợp với yêu cầu của backend
        const payload: any = {
            sessionid: sessionIdNumber, // Sửa thành sessionid (lowercase)
            exerciseType: data.exerciseType
        };

        // Chỉ thêm các trường có giá trị
        if (data.cufirstname) {
            payload.cufirstname = data.cufirstname;
        }

        if (data.culastname) {
            payload.culastname = data.culastname;
        }

        if (data.ptfirstname) {
            payload.ptfirstname = data.ptfirstname;
        }

        if (data.ptlastname) {
            payload.ptlastname = data.ptlastname;
        }

        if (data.beginAt) {
            payload.beginAt = typeof data.beginAt === 'string'
                ? data.beginAt
                : moment(data.beginAt).format('YYYY-MM-DD HH:mm:ss');
        }

        if (data.endAt) {
            payload.endAt = typeof data.endAt === 'string'
                ? data.endAt
                : moment(data.endAt).format('YYYY-MM-DD HH:mm:ss');
        }

        if (data.description) {
            payload.description = data.description;
        }

        console.log('Payload gửi đến server (theo backend):', payload);

        const response = await axios.post(`${API_URL}/manager/updateExercise`, payload, {
            headers: {
                'token': token,
                'Content-Type': 'application/json'
            }
        });

        console.log('Server response:', response.data);

        // Kiểm tra response đầy đủ hơn
        if (response.data) {
            if (response.data.status && !response.data.status.includes('thành công')) {
                console.error('Error status in response:', response.data.status);
                throw new Error(response.data.status);
            }
            if (response.data.message && !response.data.message.includes('thành công')) {
                console.error('Error message in response:', response.data.message);
                throw new Error(response.data.message);
            }
        }

        console.log('Update successful');
    } catch (error: any) {
        console.error('Error in updateExerciseSession:', error);
        if (error.response) {
            console.error('Server error details:', error.response.data);
            console.error('Server error status:', error.response.status);
            console.error('Server error headers:', error.response.headers);
            const errorMessage =
                error.response.data.status ||
                error.response.data.message ||
                error.response.data.error ||
                'Server error occurred';
            throw new Error(errorMessage);
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('Không thể kết nối đến server');
        } else {
            console.error('Generic error:', error.message);
            throw error;
        }
    }
};


// Hàm helper để tạo màu ngẫu nhiên
const getRandomColor = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1', '#0ea5e9', '#14b8a6'];
    return colors[Math.floor(Math.random() * colors.length)];
}; 