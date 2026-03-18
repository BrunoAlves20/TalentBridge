"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

const hiresData = [
  { month: "Jan", hires: 2 },
  { month: "Fev", hires: 3 },
  { month: "Mar", hires: 5 },
  { month: "Abr", hires: 4 },
  { month: "Mai", hires: 6 },
  { month: "Jun", hires: 7 }
];

const pipelineData = [
  { name: "Triagem", value: 120 },
  { name: "Teste", value: 70 },
  { name: "Entrevista", value: 35 },
  { name: "Oferta", value: 12 }
];

const COLORS = ["#6366f1", "#8b5cf6", "#22c55e", "#f59e0b"];

export default function RecruiterCharts() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 mt-12">

      {/* Gráfico de contratações */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Contratações por Mês
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={hiresData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hires" fill="#6366f1" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* Pipeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Pipeline de Candidatos
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pipelineData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label
            >
              {pipelineData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}