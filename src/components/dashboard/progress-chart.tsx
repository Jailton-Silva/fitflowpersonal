"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Jan", weight: 85, bodyFat: 22 },
  { name: "Feb", weight: 84, bodyFat: 21 },
  { name: "Mar", weight: 82, bodyFat: 20 },
  { name: "Apr", weight: 81, bodyFat: 19 },
  { name: "May", weight: 80, bodyFat: 18.5 },
  { name: "Jun", weight: 79, bodyFat: 17.8 },
]

export default function ProgressChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Body Fat (%)', angle: -90, position: 'insideRight' }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Line yAxisId="left" type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="hsl(var(--accent))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
