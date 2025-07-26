"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { name: "Jan", weight: 85, body_fat: 22 },
  { name: "Fev", weight: 84, body_fat: 21 },
  { name: "Mar", weight: 82, body_fat: 20 },
  { name: "Abr", weight: 81, body_fat: 19 },
  { name: "Mai", weight: 80, body_fat: 18.5 },
  { name: "Jun", weight: 79, body_fat: 17.8 },
]

export default function ProgressChart({measurements}: {measurements?: any[]}) {
    const chartData = (measurements && measurements.length > 0 ? measurements : data).map(m => ({
        ...m,
        name: m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : m.name,
    })).reverse();


  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" unit="kg" name="Peso" />
          <YAxis yAxisId="right" orientation="right" unit="%" name="Gordura Corporal" />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value, name) => [value, name === 'weight' ? 'Peso (kg)' : 'Gordura Corporal (%)']}
          />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
          <Line yAxisId="right" type="monotone" dataKey="body_fat" name="Gordura Corporal (%)" stroke="hsl(var(--accent))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
