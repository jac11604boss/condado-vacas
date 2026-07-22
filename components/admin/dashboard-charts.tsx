"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = ["#FF6B35", "#2E8B57", "#9B59B6", "#38BDF8", "#FBBF24", "#F472B6"];

interface ChartsProps {
  salesByProvince: { province: string; seats: number }[];
  salesByMonth: { month: string; seats: number; revenue: number }[];
  topRrpp: { code: string; seats: number }[];
  categoryDistribution: { category: string; seats: number }[];
}

const tooltipStyle = {
  backgroundColor: "#1E293B",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#F1F5F9",
  fontSize: "12px",
};

export function DashboardCharts({
  salesByProvince,
  salesByMonth,
  topRrpp,
  categoryDistribution,
}: ChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Ventas por provincia */}
      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Plazas por provincia</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={salesByProvince}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="province" tick={{ fill: "#94A3B8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="seats" fill="#FF6B35" radius={[6, 6, 0, 0]} name="Plazas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ventas por mes */}
      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Ventas por mes</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={salesByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="seats" stroke="#2E8B57" strokeWidth={2.5} dot={{ fill: "#2E8B57" }} name="Plazas" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top RRPP */}
      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Top 5 RRPP (plazas)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topRrpp} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="code" tick={{ fill: "#94A3B8", fontSize: 11 }} width={110} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="seats" fill="#9B59B6" radius={[0, 6, 6, 0]} name="Plazas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribución por tipo */}
      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold">Ventas por tipo de evento</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={categoryDistribution}
              dataKey="seats"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(props) =>
                `${(props.payload as { category?: string })?.category ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
              fontSize={10}
            >
              {categoryDistribution.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
