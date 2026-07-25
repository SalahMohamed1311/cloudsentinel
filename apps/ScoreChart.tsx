import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ScoreChart({ data }: { data: { date: string; score: number }[] }) {
  return (
    <div className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-4">
      <h4 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">تطور الأمان عبر الوقت (Score History)</h4>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: '#334155', borderRadius: '12px' }} />
          <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}