import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface TrainerData {
    id: string;
    name: string;
    phone: string;
    email: string;
    gender: string;
    age: number;
}

export interface CustomerData {
    id: string;
    name: string;
    phone: string;
    email?: string;
}

export interface ExerciseSessionData {
    id: string;
    customerId?: string;
    customerName: string;
    trainerId?: string;
    trainerName: string;
    exerciseType: string;
}

export const getTrainers = async (token: string): Promise<TrainerData[]> => {
    try {
        const response = await axios.get(`${API_URL}/admin/getPTList`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.data) {
            return response.data.data.map((trainer: any) => ({
                id: trainer.managerId?.toString() || '',
                name: trainer.name || '',
                phone: trainer.phone || '',
                email: trainer.email || '',
                gender: trainer.gender || '',
                age: trainer.age || 0
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching trainers:', error);
        throw error;
    }
};

export const getCustomersByTrainer = async (token: string, trainerId: string): Promise<CustomerData[]> => {
    try {
        console.log(`Fetching customers for trainer ID: ${trainerId}`);
        const response = await axios.post(
            `${API_URL}/pt/customer-list`,
            { trainerId: parseInt(trainerId) },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Customers response:', response.data);

        if (response.data && Array.isArray(response.data)) {
            return response.data.map((customer: any) => {
                // Log chi tiết từng đối tượng customer để debug
                console.log('Customer data:', customer);

                // Kiểm tra xem có firstname và lastname không
                const hasFirstName = customer.firstname !== undefined && customer.firstname !== null;
                const hasLastName = customer.lastname !== undefined && customer.lastname !== null;

                // Nhiều cách lấy tên khác nhau tùy theo cấu trúc dữ liệu
                let customerName = '';

                if (hasFirstName && hasLastName) {
                    // Trường hợp 1: có cả firstname và lastname riêng biệt
                    customerName = `${customer.firstname} ${customer.lastname}`;
                } else if (customer.name) {
                    // Trường hợp 2: đã có trường name
                    customerName = customer.name;
                } else if (customer.firstName && customer.lastName) {
                    // Trường hợp 3: có firstName và lastName (camelCase)
                    customerName = `${customer.firstName} ${customer.lastName}`;
                } else if (customer.customerName) {
                    // Trường hợp 4: có trường customerName
                    customerName = customer.customerName;
                } else if (customer.first_name && customer.last_name) {
                    // Trường hợp 5: có first_name và last_name (snake_case)
                    customerName = `${customer.first_name} ${customer.last_name}`;
                } else if (customer.username) {
                    // Trường hợp 6: có username
                    customerName = customer.username;
                } else {
                    // Trường hợp 7: không có thông tin tên, lấy tên từ customerName hoặc id
                    customerName = customer.id ? `Khách hàng #${customer.id}` : 'Không có tên';
                }

                return {
                    id: customer.id?.toString() || customer.customerId?.toString() || '',
                    name: customerName || 'Khách hàng không có tên',
                    phone: customer.phone || '',
                    email: customer.email || ''
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Error fetching customers by trainer:', error);
        throw error;
    }
};

export const getCustomerByPhone = async (token: string, phone: string): Promise<CustomerData | null> => {
    try {
        console.log(`Searching customer with phone: ${phone}`);
        const response = await axios.post(
            `${API_URL}/admin/getCustomerListByPhone`,
            { phone },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Customer search response:', response.data);

        if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const customer = response.data.data[0]; // Lấy khách hàng đầu tiên nếu có nhiều kết quả
            return {
                id: customer.customerId?.toString() || '',
                name: customer.name || '',
                phone: customer.phone || '',
                email: customer.email || ''
            };
        }
        return null;
    } catch (error) {
        console.error('Error searching customer by phone:', error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Khách hàng không tồn tại
            return null;
        }
        throw error;
    }
};

export const getExerciseSessions = async (token: string, trainerId?: string): Promise<ExerciseSessionData[]> => {
    try {
        // Nếu không có trainerId thì trả về mảng rỗng
        if (!trainerId) {
            console.log('No trainerId provided, returning empty array');
            return [];
        }

        console.log(`Fetching exercise sessions for trainer ID: ${trainerId}`);

        // Sử dụng API từ ptController
        const response = await axios.get(
            `${API_URL}/pt/schedule/${trainerId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Exercise sessions response:', response.data);

        if (Array.isArray(response.data)) {
            // Format dữ liệu từ API pt/schedule/{trainerId}
            return response.data.map((session: any) => {
                // Kiểm tra nhiều trường hợp của dữ liệu khách hàng
                let customerName = '';

                // Trường hợp 1: Có object customer chứa thông tin khách hàng
                if (session.customer) {
                    if (session.customer.name) {
                        customerName = session.customer.name;
                    } else if (session.customer.firstname || session.customer.lastname) {
                        customerName = `${session.customer.firstname || ''} ${session.customer.lastname || ''}`.trim();
                    }
                }
                // Trường hợp 2: Có trường customerName
                else if (session.customerName) {
                    customerName = session.customerName;
                }
                // Trường hợp 3: Có firstname và lastname của khách hàng
                else if (session.cufirstname || session.culastname) {
                    customerName = `${session.cufirstname || ''} ${session.culastname || ''}`.trim();
                }

                // Format dữ liệu trainer tương tự
                let trainerName = '';
                if (session.trainer) {
                    if (session.trainer.name) {
                        trainerName = session.trainer.name;
                    } else if (session.trainer.firstname || session.trainer.lastname) {
                        trainerName = `${session.trainer.firstname || ''} ${session.trainer.lastname || ''}`.trim();
                    }
                } else if (session.trainerName) {
                    trainerName = session.trainerName;
                } else if (session.ptfirstname || session.ptlastname) {
                    trainerName = `${session.ptfirstname || ''} ${session.ptlastname || ''}`.trim();
                }

                return {
                    id: session.id?.toString() || session.sessionId?.toString() || '',
                    customerId: session.customer?.id?.toString() || session.customerId?.toString() || '',
                    customerName: customerName || 'Khách hàng không xác định',
                    trainerId: session.trainer?.id?.toString() || session.trainerId?.toString() || '',
                    trainerName: trainerName,
                    exerciseType: session.exerciseType || session.ExerciseType || ''
                };
            });
        }

        return [];
    } catch (error) {
        console.error('Error fetching exercise sessions:', error);
        throw error;
    }
};

export const addExerciseSession = async (
    token: string,
    data: {
        cufirstname: string,
        culastname: string,
        ptfirstname: string,
        ptlastname: string,
        exerciseType: string
    }
): Promise<boolean> => {
    try {
        console.log('Adding exercise session with data:', data);
        const response = await axios.post(
            `${API_URL}/manager/addExercise`,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'token': token
                }
            }
        );

        console.log('Add exercise session response:', response.data);

        return response.data && response.data.status === "Thêm buổi tập thành công";
    } catch (error) {
        console.error('Error adding exercise session:', error);
        throw error;
    }
};

export const getDetailedExerciseSessions = async (token: string, trainerId: string): Promise<ExerciseSessionData[]> => {
    try {
        console.log(`Fetching detailed exercise sessions for trainer ID: ${trainerId}`);

        // 1. Lấy danh sách buổi tập
        const sessions = await getExerciseSessions(token, trainerId);

        // 2. Lấy danh sách khách hàng của huấn luyện viên
        const customers = await getCustomersByTrainer(token, trainerId);
        console.log(`Fetched ${customers.length} customers for trainer ID: ${trainerId}`);

        // Tạo map khách hàng theo ID để truy xuất nhanh
        const customerMap = new Map();
        customers.forEach(customer => {
            if (customer.id) {
                customerMap.set(customer.id, customer);
            }
        });

        // 3. Cập nhật thông tin khách hàng cho mỗi buổi tập
        const updatedSessions = sessions.map(session => {
            // Nếu buổi tập đã có tên khách hàng khác "Khách hàng không xác định", giữ nguyên
            if (session.customerName && session.customerName !== "Khách hàng không xác định") {
                return session;
            }

            // Thử tìm khách hàng qua customerId (nếu có)
            if (session.customerId) {
                const customer = customerMap.get(session.customerId);
                if (customer) {
                    console.log(`Found customer for session ${session.id} by customerId:`, customer);
                    return {
                        ...session,
                        customerName: customer.name
                    };
                }
            }

            // Giữ nguyên session nếu không tìm thấy thông tin khách hàng
            return session;
        });

        return updatedSessions;
    } catch (error) {
        console.error('Error fetching detailed exercise sessions:', error);
        throw error;
    }
}; 