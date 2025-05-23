import {
  LayoutDashboard,
  Users,
  LineChart,
  Dumbbell,
  Calendar,
  ClipboardList,
  Settings,
  UserCog,
  UserPlus,
  Building,
  DollarSign,
  BarChart3,
  FileText,
  ShieldCheck,
  Star,
  UserCheck,
  ScrollText,
  CreditCard,
  BookCheck,
  Sheet,
  ListChecks,
  User,
  Package,
  History,
  Receipt,
  School
} from 'lucide-react';
import { MenuItem } from '@/components/panel/menu-item/type';
import React from 'react';

// Menu cho Admin
export const adminMenuItems: MenuItem[] = [
  {
    label: 'Quản lý doanh thu',
    icon: DollarSign,
    pathname: '/admin/ql-doanh-thu',
  },

  {
    label: 'Quản lý thiết bị',
    icon: Dumbbell,
    pathname: '/admin/ql-danh-sach-thiet-bi',
  },
  {
    label: 'Quản lý nhân sự',
    icon: Users,
    pathname: '',
    subMenu: [
      {
        label: 'Danh sách quản lý',
        icon: UserCog,
        pathname: '/admin/ql-nhan-su/danh-sach-quan-ly',
      },
      {
        label: 'Danh sách huấn luyện viên',
        icon: UserPlus,
        pathname: '/admin/ql-nhan-su/danh-sach-trainer',
      },
      {
        label: 'Danh sách hội viên',
        icon: ClipboardList,
        pathname: '/admin/ql-nhan-su/danh-sach-hoi-vien',
      }
    ]
  },
  {
    label: 'Quản lý phòng tập',
    icon: School,
    pathname: '/admin/ql-phong-tap',
  },
  {
    label: 'Quản lý người dùng',
    icon: UserCog,
    pathname: '',
    subMenu: [
      {
        label: 'Danh sách người dùng',
        icon: ClipboardList,
        pathname: '/admin/user-manage',
      },
    ]
  },
  {
    label: 'Đánh giá khách hàng',
    icon: Star,
    pathname: '/admin/review-khach-hang',
  },
];

// Menu cho Manager
export const managerMenuItems: MenuItem[] = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    pathname: '/manager/home',
  },
  {
    label: 'Quản lý khách hàng',
    icon: Users,
    pathname: '',
    subMenu: [
      {
        label: 'Danh sách khách hàng',
        icon: ClipboardList,
        pathname: '/manager/user-manage',
      },
      {
        label: 'Tạo tài khoản khách hàng',
        icon: UserPlus,
        pathname: '/manager/user-manage/create-account',
      },
      {
        label: 'Đăng ký gói tập khách hàng',
        icon: UserPlus,
        pathname: '/manager/user-manage/create',
      },
      {
        label: 'Quản lý gói tập',
        icon: BookCheck,
        pathname: '/manager/membership-manage',
      },
      {
        label: 'Xét duyệt đăng ký',
        icon: UserCheck,
        pathname: '/manager/membership-register/approve',
      }
    ]
  },
  {
    label: 'Quản lý thanh toán',
    icon: CreditCard,
    pathname: '/manager/payment-manage',
  },
  {
    label: 'Quản lý trainer',
    icon: UserCog,
    pathname: '',
    subMenu: [
      {
        label: 'Danh sách trainer',
        icon: ClipboardList,
        pathname: '/manager/trainer-list',
      },
    ]
  },
  {
    label: 'Quản lý thiết bị',
    icon: Dumbbell,
    pathname: '',
    subMenu: [
      {
        label: 'Danh sách thiết bị',
        icon: ListChecks,
        pathname: '/manager/equipment-list',
      }
    ]
  },
  {
    label: 'Lịch tập',
    icon: Calendar,
    pathname: '',
    subMenu: [
      {
        label: 'Xem lịch tập',
        icon: Sheet,
        pathname: '/manager/time-table',
      },
    ]
  },
  {
    label: 'Đánh giá',
    icon: Star,
    pathname: '/manager/reviews',
  }
];

// Menu cho Trainer
export const trainerMenuItems: MenuItem[] = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    pathname: '/trainer/home',
  },
  {
    label: 'Lịch tập',
    icon: Calendar,
    pathname: '/trainer/time-table',
  },
  {
    label: 'Khách hàng',
    icon: Users,
    pathname: '/trainer/user-manage',
  },
];

// Menu cho Customer
export const customerMenuItems: MenuItem[] = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    pathname: '/customer/home',
  },
  {
    label: 'Thông tin cá nhân',
    icon: User,
    pathname: '/customer/profile',
  },
  {
    label: 'Gói tập của tôi',
    icon: Package,
    pathname: '/customer/membership',
  },
  {
    label: 'Lịch sử tập luyện',
    icon: History,
    pathname: '/customer/training-history',
  },
  {
    label: 'Thông tin thanh toán',
    icon: Receipt,
    pathname: '/customer/payment',
  },
  {
    label: 'Đánh giá',
    icon: Star,
    pathname: '/customer/review',
  }
];