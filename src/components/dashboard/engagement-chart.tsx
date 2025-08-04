"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

export type EngagementData = { month: string; completed: number; scheduled: number }[];

export default function EngagementChart({ data }: { data: EngagementData }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Não há dados de engajamento para exibir.</p>
      </div>
    );
  }
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
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
