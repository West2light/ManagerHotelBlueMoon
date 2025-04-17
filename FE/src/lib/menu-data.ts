import { 
  LayoutDashboard, 
  Users, 
  LineChart,
  Dumbbell,
  Calendar
} from 'lucide-react';
import { MenuItem } from '@/components/panel/menu-item/type';

// Menu cho Admin
export const adminMenuItems: MenuItem[] = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    pathname: '/admin/dashboard',
  },
  {
    label: 'Quản lý người dùng',
    icon: Users,
    pathname: '/admin/user-manage',
    subMenu: [
      {
        label: 'Danh sách người dùng',
        pathname: '/admin/user-manage/list',
      },
      {
        label: 'Thêm người dùng',
        pathname: '/admin/user-manage/add',
      }
    ]
  },
  {
    label: 'Báo cáo doanh thu',
    icon: LineChart,
    pathname: '/admin/revenue',
  },
  // Thêm các mục khác cho Admin
];

// Menu cho Manager
export const managerMenuItems: MenuItem[] = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    pathname: '/manager/dashboard',
  },
  {
    label: 'Quản lý khách hàng',
    icon: Users,
    pathname: '/manager/customer-manage',
  },
  {
    label: 'Quản lý thiết bị',
    icon: Dumbbell,
    pathname: '/manager/equipment',
  },
  // Thêm các mục khác cho Manager
];

// Menu cho Trainer
export const trainerMenuItems: MenuItem[] = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    pathname: '/trainer/dashboard',
  },
  {
    label: 'Lịch tập',
    icon: Calendar,
    pathname: '/trainer/schedule',
  },
  {
    label: 'Khách hàng',
    icon: Users,
    pathname: '/trainer/customers',
  },
  // Thêm các mục khác cho Trainer
]; 