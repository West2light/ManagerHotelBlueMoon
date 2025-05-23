import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import StoreProvider from '@/components/ui/store-provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GYM Management System',
  description: 'Hệ thống quản lý phòng tập gym hiện đại',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <StoreProvider>
          {children}
          <Toaster position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}