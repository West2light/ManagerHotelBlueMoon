import axios from 'axios';
import { getCookie } from 'cookies-next';

// API URL - URL của backend Spring Boot
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Equipment {
    id: number;
    name: string;
    roomName: string;
    roomId: number;
    quantity: number;
    status: 'good' | 'maintenance' | 'broken';
}

export interface SearchParams {
    room_name?: string;
    roomEquipment?: string;
    status?: string;
}

export const equipmentService = {
    async findDevices(room_name: string = "", roomEquipment: string = "", status: string = "") {
        try {
            const token = getCookie('auth') ? JSON.parse(getCookie('auth') as string).token : null;

            console.log('Đang gọi API findDevice với params:', { room_name, roomEquipment, status });

            const response = await axios.post(`${API_URL}/manager/findDevice`, {
                room_name,
                roomEquipment,
                status: status ? mapStatusToBackend(status) : ""
            }, {
                headers: {
                    'token': token,
                    'Content-Type': 'application/json'
                }
            });


            if (response.data && response.data.list && Array.isArray(response.data.list)) {
                const mappedData = response.data.list.map((item: any, index: number) => {
                    return {
                        id: index + 1,
                        name: item.equipment_name,
                        roomName: item.room_name,
                        roomId: item.roomid || 0,
                        quantity: item.quantity || 0,
                        status: mapStatus(item.status),
                        realId: item.id || item.equipmentId || item.equipment_id
                    };
                });

                return mappedData;
            }

            return [];
        } catch (error) {
            console.error('Lỗi khi tìm kiếm thiết bị:', error);
            if (axios.isAxiosError(error)) {
                console.error('Chi tiết lỗi:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            }
            return [];
        }
    },

    async addEquipment(room_name: string, equipment_name: string, quantity: number, status: string) {
        try {
            const token = getCookie('auth') ? JSON.parse(getCookie('auth') as string).token : null;

            const response = await axios.post(`${API_URL}/manager/addDevice`, {
                room_name,
                equipment_name,
                quantity,
                status: mapStatusToBackend(status)
            }, {
                headers: {
                    'token': token,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Lỗi khi thêm thiết bị:', error);
            throw error;
        }
    },

    async updateEquipment(room_name: string, equipment_name: string, status: string, quantity: number) {
        try {
            const token = getCookie('auth') ? JSON.parse(getCookie('auth') as string).token : null;

            const response = await axios.post(`${API_URL}/manager/updateDevice`, {
                room_name,
                equipment_name,
                status: mapStatusToBackend(status),
                quantity
            }, {
                headers: {
                    'token': token,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Lỗi khi cập nhật thiết bị:', error);
            throw error;
        }
    },

    async deleteEquipment(room_name: string, equipment_name: string) {
        try {
            const token = getCookie('auth') ? JSON.parse(getCookie('auth') as string).token : null;
            const response = await axios({
                method: 'post',
                url: `${API_URL}/manager/deleteDevice`,
                data: {
                    room_name,
                    equipment_name
                },
                headers: {
                    'token': token,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response từ server:', response.data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi xóa thiết bị:', error);
            if (axios.isAxiosError(error)) {
                console.error('Chi tiết lỗi:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            }
            throw error;
        }
    },

    async getAllEquipments() {
        try {
            const token = getCookie('auth') ? JSON.parse(getCookie('auth') as string).token : null;

            const response = await axios.post(`${API_URL}/manager/findDevice`, {}, {
                headers: {
                    'token': token,
                    'Content-Type': 'application/json'
                }
            });


            if (response.data && response.data.list && Array.isArray(response.data.list)) {
                const mappedData = response.data.list.map((item: any, index: number) => {
                    return {
                        id: index + 1,
                        name: item.equipment_name,
                        roomName: item.room_name,
                        roomId: item.roomid || 0,
                        quantity: item.quantity || 0,
                        status: mapStatus(item.status),
                        realId: item.id || item.equipmentId || item.equipment_id
                    };
                });

                return mappedData;
            }

            return [];
        } catch (error) {
            console.error('Lỗi khi lấy tất cả thiết bị:', error);
            return [];
        }
    }
};

function mapStatusToBackend(status: string): string {
    console.log("Mapping status từ FE sang BE:", status);

    switch (status.toLowerCase()) {
        case 'good':
            console.log("-> Chuyển thành: hoạt động");
            return 'hoạt động';
        case 'maintenance':
            console.log("-> Chuyển thành: bảo trì");
            return 'bảo trì';
        case 'broken':
            console.log("-> Chuyển thành: hỏng");
            return 'hỏng';
        default:
            console.log("-> Status không xác định, mặc định: hoạt động");
            return 'hoạt động';
    }
}

function mapStatus(status: string): 'good' | 'maintenance' | 'broken' {
    console.log("Mapping status từ BE sang FE:", status);

    if (!status) {
        console.log("-> Status rỗng, mặc định: good");
        return 'good';
    }

    switch (status.toLowerCase()) {
        case 'hoạt động':
        case 'tốt':
            console.log("-> Chuyển thành: good");
            return 'good';
        case 'bảo trì':
            console.log("-> Chuyển thành: maintenance");
            return 'maintenance';
        case 'hỏng':
            console.log("-> Chuyển thành: broken");
            return 'broken';
        default:
            console.log("-> Status không xác định, mặc định: good");
            return 'good';
    }
}

