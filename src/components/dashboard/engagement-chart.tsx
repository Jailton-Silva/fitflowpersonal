"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", completed: 30, scheduled: 40 },
  { month: "Fev", completed: 35, scheduled: 42 },
  { month: "Mar", completed: 40, scheduled: 45 },
  { month: "Abr", completed: 42, scheduled: 48 },
  { month: "Mai", completed: 48, scheduled: 50 },
  { month: "Jun", completed: 52, scheduled: 55 },
]

export default function EngagementChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend formatter={(value) => value === 'completed' ? 'Concluídos' : 'Agendados'}/>
          <Bar dataKey="scheduled" name="Agendados" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" name="Concluídos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
