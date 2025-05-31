import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Review {
    reviewId: string;
    customer: string;
    text: string;
    date: string;
}

export const getReviews = async (token: string): Promise<Review[]> => {
    try {
        const response = await axios.get(`${API_URL}/manager/getReviews`, {
            headers: {
                'token': token
            }
        });

        if (response.data && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch reviews');
    } catch (error: any) {
        if (error.response) {
            // Lỗi từ server (status code không phải 2xx)
            console.error('Server error:', error.response.data);
            throw new Error(error.response.data.message || 'Server error occurred');
        } else if (error.request) {
            // Không nhận được response từ server
            console.error('No response received:', error.request);
            throw new Error('Không thể kết nối đến server');
        } else {
            // Lỗi khi setting up request
            console.error('Request error:', error.message);
            throw new Error('Lỗi khi gửi request');
        }
    }
}; 