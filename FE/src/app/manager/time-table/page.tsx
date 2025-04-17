"use client";
import React from 'react';
import MyCalendar from '@/components/ui/calendar';

export default function TimeTablePage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Lịch sử dụng sân</h1>
            <MyCalendar />
        </div>
    );
}