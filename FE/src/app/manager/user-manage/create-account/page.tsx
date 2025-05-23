'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount } from '@/services/userService';

export default function CreateAccountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const MAX_RETRIES = 5;

    // State cho custom dropdown
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        roleid: 4, // Mặc định là khách hàng
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        gender: 'Nam',
        age: 18
    });

    // Click bên ngoài dropdown sẽ đóng nó lại
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'age' || name === 'roleid' ? parseInt(value) : value
        });
    };

    const handleGenderSelect = (gender: string) => {
        setFormData({
            ...formData,
            gender
        });
        setDropdownOpen(false);
    };

    // Hàm gửi request tạo tài khoản
    const attemptCreateAccount = useCallback(async (userData: any, token: string, attemptNumber = 1): Promise<any> => {
        try {
            const result = await createAccount(userData, token);
            return { success: true, data: result };
        } catch (error: any) {
            // Kiểm tra nếu là lỗi duplicate key và chưa vượt quá số lần thử lại
            if (error.message &&
                error.message.includes('duplicate key value') &&
                attemptNumber < MAX_RETRIES) {
                console.log(`Thử lại lần ${attemptNumber + 1} sau lỗi trùng ID...`);
                // Thử lại sau 500ms
                await new Promise(resolve => setTimeout(resolve, 500));
                return attemptCreateAccount(userData, token, attemptNumber + 1);
            }

            return { success: false, error };
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra mật khẩu
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setRetryCount(0);
        setIsRetrying(false);

        try {
            // Lấy token từ localStorage hoặc cookie
            const token = localStorage.getItem('token') || '';

            // Kiểm tra có token chưa
            if (!token) {
                setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
                setLoading(false);
                return;
            }

            // Tạo đối tượng dữ liệu gửi đi (loại bỏ confirmPassword)
            const { confirmPassword, ...userData } = formData;

            // Thử tạo tài khoản với cơ chế tự động thử lại
            setIsRetrying(true);
            const { success, data, error: accountError } = await attemptCreateAccount(userData, token);
            setIsRetrying(false);

            if (success && data) {
                if (data.status === 'Thêm người dùng thành công') {
                    setSuccess('Tạo tài khoản thành công!');
                    // Reset form sau khi thành công
                    setFormData({
                        username: '',
                        password: '',
                        confirmPassword: '',
                        roleid: 4,
                        firstname: '',
                        lastname: '',
                        email: '',
                        phone: '',
                        gender: 'Nam',
                        age: 18
                    });
                } else {
                    setError(data.message || 'Tạo tài khoản thất bại');
                }
            } else if (accountError) {
                throw accountError;
            }
        } catch (error: any) {
            console.error('Lỗi xử lý:', error);

            // Xử lý hiển thị thông báo lỗi user-friendly
            let errorMessage = 'Đã xảy ra lỗi khi tạo tài khoản';

            // Kiểm tra nếu là lỗi trùng khóa trong database
            if (error.message && error.message.includes('duplicate key value')) {
                errorMessage = 'Tài khoản này có thể đã tồn tại. Vui lòng thử tên đăng nhập khác.';
            } else if (error.message && error.message.includes('Lỗi server: 500')) {
                // Cố gắng trích xuất thông báo lỗi từ backend
                try {
                    const errorJson = error.message.split('Lỗi server: 500 - ')[1];
                    const parsedError = JSON.parse(errorJson);
                    errorMessage = parsedError.message || errorMessage;

                    // Làm cho thông báo lỗi dễ hiểu hơn
                    if (errorMessage.includes('duplicate key value')) {
                        errorMessage = 'Đã xảy ra xung đột dữ liệu, vui lòng liên hệ quản trị viên.';
                    }
                } catch (e) {
                    // Nếu không parse được, giữ nguyên thông báo
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Tạo tài khoản mới</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {isRetrying && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    Đang thử lại sau lỗi xung đột dữ liệu... Vui lòng đợi.
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-6 border-b pb-4">
                    <h2 className="text-lg font-semibold mb-4">Thông tin tài khoản</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="roleid">
                                Vai trò <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="roleid"
                                name="roleid"
                                value={formData.roleid}
                                onChange={handleChange}
                                required
                            >
                                <option value={4}>Khách hàng</option>
                                <option value={3}>Huấn luyện viên</option>
                                <option value={2}>Quản lý</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstname">
                                Họ <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="firstname"
                                name="firstname"
                                type="text"
                                value={formData.firstname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastname">
                                Tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="lastname"
                                name="lastname"
                                type="text"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Giới tính <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:border-blue-400 transition-all duration-300 shadow"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <div className="flex items-center">
                                        {formData.gender === 'Nam' && (
                                            <span className="flex items-center text-blue-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Nam
                                            </span>
                                        )}
                                        {formData.gender === 'Nữ' && (
                                            <span className="flex items-center text-pink-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Nữ
                                            </span>
                                        )}
                                        {formData.gender === 'Khác' && (
                                            <span className="flex items-center text-purple-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Khác
                                            </span>
                                        )}
                                    </div>
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {dropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg py-1 animate-fadeIn">
                                        <div
                                            className="flex items-center px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer transition-colors"
                                            onClick={() => handleGenderSelect('Nam')}
                                        >
                                            <span className="flex items-center text-blue-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Nam
                                            </span>
                                        </div>
                                        <div
                                            className="flex items-center px-4 py-2.5 text-sm hover:bg-pink-50 cursor-pointer transition-colors"
                                            onClick={() => handleGenderSelect('Nữ')}
                                        >
                                            <span className="flex items-center text-pink-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Nữ
                                            </span>
                                        </div>
                                        <div
                                            className="flex items-center px-4 py-2.5 text-sm hover:bg-purple-50 cursor-pointer transition-colors"
                                            onClick={() => handleGenderSelect('Khác')}
                                        >
                                            <span className="flex items-center text-purple-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Khác
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <input type="hidden" name="gender" value={formData.gender} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
                                Tuổi <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="age"
                                name="age"
                                type="number"
                                min="1"
                                max="120"
                                value={formData.age}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading || isRetrying}
                    >
                        Hủy
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={loading || isRetrying}
                    >
                        {loading ? 'Đang xử lý...' : (isRetrying ? `Đang thử lại (${retryCount}/${MAX_RETRIES})` : 'Tạo tài khoản')}
                    </button>
                </div>
            </form>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
