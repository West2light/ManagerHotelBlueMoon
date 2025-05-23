'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueData {
  revenue: number;
  month: number;
}

const lineColors = [
  'rgb(53, 162, 235)',
  'rgb(255, 99, 132)',
  'rgb(75, 192, 192)',
  'rgb(255, 205, 86)',
  'rgb(153, 102, 255)',
];

const DoanhThuPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [compareYears, setCompareYears] = useState<number[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [revenueData, setRevenueData] = useState<{ [year: number]: RevenueData[] }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<{ [year: number]: number }>({});
  const [averageRevenue, setAverageRevenue] = useState<{ [year: number]: number }>({});
  const [highestMonth, setHighestMonth] = useState<{ [year: number]: { month: number, revenue: number } }>({});

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    setAvailableYears(years);
  }, []);

  useEffect(() => {
    const fetchRevenueData = async (year: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post('http://localhost:3001/admin/revenueByYear', { year: year.toString() });
        if (response.data && response.data.data) {
          setRevenueData(prev => ({ ...prev, [year]: response.data.data }));
          
          const total = response.data.data.reduce((sum: number, item: RevenueData) => sum + item.revenue, 0);
          setTotalRevenue(prev => ({ ...prev, [year]: total }));
          
          setAverageRevenue(prev => ({ ...prev, [year]: total / 12 }));
          
          const highest = response.data.data.reduce(
            (max: RevenueData, item: RevenueData) => (item.revenue > max.revenue ? item : max),
            { month: 0, revenue: 0 }
          );
          setHighestMonth(prev => ({ ...prev, [year]: highest }));
        }
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu doanh thu. Vui lòng thử lại sau.');
        console.error('Error fetching revenue data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!revenueData[selectedYear]) {
      fetchRevenueData(selectedYear);
    }

    compareYears.forEach(year => {
      if (!revenueData[year]) {
        fetchRevenueData(year);
      }
    });
  }, [selectedYear, compareYears, revenueData]);

  const handleCompareYearChange = (year: number) => {
    setCompareYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year];
      }
    });
  };

  const chartData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: `Doanh thu năm ${selectedYear}`,
        data: revenueData[selectedYear]?.map(item => item.revenue) || Array(12).fill(0),
        borderColor: lineColors[0],
        backgroundColor: `${lineColors[0]}33`,
        tension: 0.3,
      },
      ...compareYears.map((year, index) => ({
        label: `Doanh thu năm ${year}`,
        data: revenueData[year]?.map(item => item.revenue) || Array(12).fill(0),
        borderColor: lineColors[(index + 1) % lineColors.length],
        backgroundColor: `${lineColors[(index + 1) % lineColors.length]}33`,
        tension: 0.3,
      })),
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Biểu đồ doanh thu theo tháng',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)',
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tổng doanh thu năm {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalRevenue[selectedYear]?.toLocaleString('vi-VN')} VNĐ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Doanh thu trung bình/tháng năm {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageRevenue[selectedYear]?.toLocaleString('vi-VN')} VNĐ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tháng có doanh thu cao nhất năm {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              Tháng {highestMonth[selectedYear]?.month}: {highestMonth[selectedYear]?.revenue?.toLocaleString('vi-VN')} VNĐ
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <Label htmlFor="year-select">Chọn năm</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger id="year-select" className="w-[180px]">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-4">
            <Label className="mb-2 block">So sánh với năm</Label>
            <div className="flex gap-4 flex-wrap">
              {availableYears
                .filter(year => year !== selectedYear)
                .map(year => (
                  <div key={year} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`year-${year}`} 
                      checked={compareYears.includes(year)}
                      onCheckedChange={() => handleCompareYearChange(year)}
                    />
                    <Label htmlFor={`year-${year}`}>{year}</Label>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Dữ liệu doanh thu chi tiết năm {selectedYear}</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Tháng</th>
                <th className="p-2 text-right">Doanh thu (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {revenueData[selectedYear]?.map(item => (
                <tr key={item.month} className="border-b">
                  <td className="p-2">Tháng {item.month}</td>
                  <td className="p-2 text-right">{item.revenue.toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoanhThuPage;