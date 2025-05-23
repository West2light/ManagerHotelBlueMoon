"use client";
import Footer from "@/components/panel/footer";
import Header from "@/components/panel/header";
import Sidebar from "@/components/panel/side-bars";
import { customerMenuItems } from "@/lib/menu-data";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "@/utils/auth";
import { useEffect, useState } from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState({
    name: "Customer",
    icon: null
  });

  useEffect(() => {
    const user_get = getCurrentUser();
    if (user_get) {
      setUser({
        name: user_get.name || user_get.username || "Customer",
        icon: null
      });
    }
  }, []);

  const findMenuLabel = (path: string): string => {
    const mainItem = customerMenuItems.find(item => item.pathname === path);
    if (mainItem) return mainItem.label;

    for (const item of customerMenuItems) {
      if (item.subMenu) {
        const subItem = item.subMenu.find(sub => sub.pathname === path);
        if (subItem) return subItem.label;
      }
    }

    return 'Trang chủ'; 
  };

  return (
    <div className="min-h-screen bg-slate-100 flex gap-4 pr-4">
      <Sidebar />
      <div className="flex-1 flex flex-col gap-4 pt-2 max-h-screen">
        <Header pathName={findMenuLabel(pathname)} user={user} />
        <main className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="p-4 rounded-xl bg-white shadow-sm min-h-full">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}