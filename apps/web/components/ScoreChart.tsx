'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ScanData {
  scannedAt: string;
  score: number;
}

export default function ScoreChart({ data }: { data: ScanData[] }) {
  // ترتيب البيانات حسب التاريخ
  const sortedData = [...data].sort(
    (a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime()
  );

  // تنسيق البيانات للرسم البياني
  const chartData = sortedData.map((item) => ({
    date: new Date(item.scannedAt).toLocaleDateString('ar-EG'),
    score: item.score,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          fontSize={10}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          stroke="#94a3b8"
          fontSize={10}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#e2e8f0',
          }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}