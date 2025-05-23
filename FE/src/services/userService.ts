// Interface cho dữ liệu người dùng
export interface UserData {
    username: string;
    password: string;
    roleid: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    gender: string;
    age: number;
}

// API base URL - cấu hình đúng port nơi backend đang chạy
const API_BASE_URL = 'http://localhost:3001';

// Hàm gọi API tạo tài khoản
export const createAccount = async (userData: UserData, token: string): Promise<any> => {
    try {
        console.log('Gửi request đến:', `${API_BASE_URL}/addUser`);
        console.log('Dữ liệu gửi đi:', userData);

        const response = await fetch(`${API_BASE_URL}/addUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify(userData)
        });

        // Log thông tin response để debug
        console.log('Status code:', response.status);

        // Kiểm tra nếu response không ok (status không nằm trong khoảng 200-299)
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response không thành công:', response.status, errorText);
            throw new Error(`Lỗi server: ${response.status} - ${errorText || 'Không có thông tin chi tiết'}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Chi tiết lỗi khi tạo tài khoản:', error);
        // Kiểm tra nếu là lỗi mạng
        if (error instanceof TypeError && (error as any).message === 'Failed to fetch') {
            throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc máy chủ đã khởi động chưa.');
        }
        throw error;
    }
};

// Sử dụng hàm
export const handleCreateCustomer = async (userData: UserData, token: string) => {
    try {
        const result = await createAccount(userData, token);
        return result;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};
