'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React from 'react';

// Style mạnh để override mọi màu khác
const forceBlackStyle = {
    color: "#000000 !important",
    fill: "#000000 !important",
    stroke: "#000000 !important"
};

interface MenuItemProps {
    item: {
        label: string;
        href?: string;
        icon?: any; // Thay đổi type để phù hợp với cách sử dụng
        children?: MenuItemProps['item'][];
    };
    depth?: number;
}

export default function MenuItemComponent({ item, depth = 0 }: MenuItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isActive = pathname === item.href;

    const handleClick = (e: React.MouseEvent) => {
        if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    // Tạo một phiên bản mới của icon với màu đen
    const renderIcon = () => {
        if (!item.icon) return null;

        // Tạo một bản sao của icon với props màu đen
        const IconComponent = item.icon;
        return <IconComponent size={20} color="black" style={forceBlackStyle} />;
    };

    const content = (
        <div className="flex items-center space-x-2">
            {item.icon && (
                <span className="w-5 h-5 flex items-center justify-center" style={forceBlackStyle}>
                    {renderIcon()}
                </span>
            )}
            <span>{item.label}</span>
            {hasChildren && (
                <span className="ml-auto">
                    {isOpen ?
                        <ChevronDown size={16} color="black" style={forceBlackStyle} /> :
                        <ChevronRight size={16} color="black" style={forceBlackStyle} />
                    }
                </span>
            )}
        </div>
    );

    return (
        <li>
            {item.href ? (
                <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                        ? 'bg-gray-100 text-black'
                        : 'text-black hover:bg-gray-50 hover:text-black'
                        }`}
                    onClick={handleClick}
                >
                    {content}
                </Link>
            ) : (
                <button
                    type="button"
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                        ? 'bg-gray-100 text-black'
                        : 'text-black hover:bg-gray-50 hover:text-black'
                        }`}
                    onClick={handleClick}
                >
                    {content}
                </button>
            )}
            {hasChildren && isOpen && item.children && (
                <ul className="mt-1 space-y-1">
                    {item.children.map((child, index) => (
                        <MenuItemComponent key={index} item={child} depth={depth + 1} />
                    ))}
                </ul>
            )}
        </li>
    );
} 