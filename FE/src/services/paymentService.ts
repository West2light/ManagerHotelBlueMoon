import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Payment {
    id?: string;
    customerId?: number;
    customerName?: string;
    amount: number;
    paymentMethod: string;
    paid: boolean;
    createdAt?: Date;
}

export const getPayments = async (token: string): Promise<Payment[]> => {
    try {
        const response = await axios.get(`${API_URL}/manager/getPayments`, {
            headers: {
                'token': token
            }
        });

        if (response.data && response.data.list) {
            return response.data.list.map((payment: any) => ({
                id: payment.payment_id?.toString() || '',
                customerId: payment.customer_id,
                customerName: payment.customer_name || '',
                amount: parseFloat(payment.amount) || 0,
                paymentMethod: payment.payment_method || 'cash',
                paid: payment.paid === true,
                createdAt: payment.created_at ? new Date(payment.created_at) : new Date()
            }));
        }

        return [];
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thanh toán:', error);
        throw new Error('Không thể lấy dữ liệu thanh toán');
    }
};

export const updatePaymentStatus = async (token: string, paymentId: string, paid: boolean): Promise<any> => {
    try {
        const response = await axios.post(
            `${API_URL}/manager/updatePayment`,
            {
                paymentId: paymentId,
                paid: paid
            },
            {
                headers: {
                    'token': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
        throw new Error('Không thể cập nhật trạng thái thanh toán');
    }
};

export const addPayment = async (
    token: string,
    phone: string,
    paymentMethod: string,
    amount: number,
    paid: boolean
): Promise<any> => {
    try {
        console.log('Gửi request thanh toán với dữ liệu:', {
            phone,
            paymentMethod,
            amount,
            paid
        });

        const response = await axios.post(
            `${API_URL}/manager/addPayment`,
            {
                phone,
                paymentMethod,
                amount,
                paid
            },
            {
                headers: {
                    'token': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Kết quả từ server:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm thanh toán:', error);
        if (axios.isAxiosError(error)) {
            console.error('Response error:', error.response?.data);
            throw new Error(`Không thể thêm thanh toán mới: ${error.response?.data?.message || error.message}`);
        }
        throw new Error('Không thể thêm thanh toán mới');
    }
}; 