"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

export type ProgressData = { name: string; weight: number; bodyFat: number }[];

export default function ProgressChart({ data }: { data: ProgressData }) {
   if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Não há dados de progresso para exibir.</p>
      </div>
    );
  }
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false}/>
          <YAxis yAxisId="left" unit="kg" name="Peso" domain={['dataMin - 2', 'dataMax + 2']} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis yAxisId="right" orientation="right" unit="%" name="Gordura Corporal" domain={['dataMin - 2', 'dataMax + 2']} fontSize={12} tickLine={false} axisLine={false}/>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value, name) => [
              (value as number).toFixed(1),
              name === 'weight' ? 'Peso (kg)' : 'Gordura Corporal (%)'
            ]}
          />
           <Legend />
          <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="Gordura Corporal (%)" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
