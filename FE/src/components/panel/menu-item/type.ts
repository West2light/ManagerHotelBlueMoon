import type { LucideIcon } from 'lucide-react';

export type MenuItemProps = {
    item: MenuItem,
    depth: number,
}

export interface MenuItem {
  icon?: LucideIcon;
  label: string;
  pathname: string;
  subMenu?: MenuItem[];
}