"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Jan", weight: 85, bodyFat: 22 },
  { name: "Fev", weight: 84, bodyFat: 21 },
  { name: "Mar", weight: 82, bodyFat: 20 },
  { name: "Abr", weight: 81, bodyFat: 19 },
  { name: "Mai", weight: 80, bodyFat: 18.5 },
  { name: "Jun", weight: 79, bodyFat: 17.8 },
]

export default function ProgressChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Gordura Corporal (%)', angle: -90, position: 'insideRight' }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value, name) => [value, name === 'weight' ? 'Peso (kg)' : 'Gordura Corporal (%)']}
          />
          <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="hsl(var(--primary))" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="Gordura Corporal (%)" stroke="hsl(var(--accent))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
