"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MenuItemProps } from './type';
import clsx from 'clsx';
import { useStoreState } from '@/lib/redux/hook';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import dynamic from 'next/dynamic';

// Định nghĩa style cho chữ màu đen
const forceBlackStyle = { color: 'black' };

const MenuItemComponentBase: React.FC<MenuItemProps> = ({ item, depth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isShowSidebar = useStoreState(state => state.appState.isShowSidebar);

  const getIconSize = (depth: number) => {
    if (depth === 0) return 22;
    if (depth === 1) return 9;
    return 14;
  };

  const handleItemClick = (e: React.MouseEvent) => {
    if (item.subMenu && item.subMenu.length > 0) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const menuItemContent = (
    <div
      className={clsx(
        "flex items-center gap-3 text-sm text-black",
        isShowSidebar ? "justify-center" : "w-48",
        "overflow-hidden"
      )}
      style={forceBlackStyle}
    >
      {item.icon && (
        <item.icon
          size={getIconSize(depth)}
          className={clsx(
            "flex-shrink-0",
            depth > 0 && "text-gray-500"
          )}
        />
      )}
      {!isShowSidebar && <span className="truncate text-black" style={forceBlackStyle}>{item.label}</span>}
    </div>
  );

  const menuItemElement = item.subMenu && item.subMenu.length > 0 ? (
    <div
      onClick={handleItemClick}
      className={clsx(
        "flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-all duration-200 ease-in-out cursor-pointer text-black",
        {
          "justify-between": !isShowSidebar,
          "justify-center w-10": isShowSidebar,
          "ml-4": !isShowSidebar && depth === 1,
          "ml-8": !isShowSidebar && depth === 2,
          "ml-12": !isShowSidebar && depth === 3,
          "ml-16": !isShowSidebar && depth >= 4,
        }
      )}
      style={forceBlackStyle}
    >
      {menuItemContent}
      {!isShowSidebar && item.subMenu && item.subMenu.length > 0 && (
        <div className="flex-shrink-0 text-black" style={forceBlackStyle}>
          {isOpen ?
            <ChevronUp size={16} className="text-black" style={forceBlackStyle} /> :
            <ChevronDown size={16} className="text-black" style={forceBlackStyle} />
          }
        </div>
      )}
    </div>
  ) : (
    <Link
      href={item.pathname}
      className={clsx(
        "flex items-center p-2 rounded-md hover:bg-gray-50 transition-all duration-200 ease-in-out text-black",
        {
          "justify-between": !isShowSidebar,
          "justify-center w-10": isShowSidebar,
          "ml-4": !isShowSidebar && depth === 1,
          "ml-8": !isShowSidebar && depth === 2,
          "ml-12": !isShowSidebar && depth === 3,
          "ml-16": !isShowSidebar && depth >= 4,
        }
      )}
      style={forceBlackStyle}
    >
      {menuItemContent}
    </Link>
  );

  return (
    <div>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          {menuItemElement}
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          className="p-1 min-w-[100px] text-black"
          style={forceBlackStyle}
        >
          <div className="flex flex-col gap-2">
            <div className="font-medium text-sm text-black" style={forceBlackStyle}>{item.label}</div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {isOpen && item.subMenu && (
        <ul className="mt-0.5">
          {item.subMenu.map((subItem) => (
            <MenuItemComponent
              key={subItem.label}
              item={subItem}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const MenuItemComponent = dynamic(() => Promise.resolve(MenuItemComponentBase), {
  ssr: false
});

export default MenuItemComponent;