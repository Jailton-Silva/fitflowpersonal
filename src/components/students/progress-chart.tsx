
"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Measurement } from "@/lib/definitions"
import { format } from "date-fns"

export default function ProgressChart({measurements}: {measurements?: Measurement[]}) {
    const chartData = (measurements && measurements.length > 0 ? measurements : []).map(m => ({
        ...m,
        name: format(new Date(m.created_at), "dd/MM/yy"),
        "Peso (kg)": m.weight,
        "Gordura Corporal (%)": m.body_fat
    }));


  return (
    <div className="h-[350px] w-full">
        {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" unit="kg" name="Peso" domain={['dataMin - 2', 'dataMax + 2']} />
                <YAxis yAxisId="right" orientation="right" unit="%" name="Gordura Corporal" domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                    contentStyle={{
                    background: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    }}
                    formatter={(value, name) => [(value as number).toFixed(1), name.toString()]}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Peso (kg)" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="Gordura Corporal (%)" stroke="hsl(var(--accent))" strokeWidth={2} connectNulls />
                </LineChart>
            </ResponsiveContainer>
        ) : (
             <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Não há dados suficientes para exibir o gráfico. Adicione pelo menos duas medições.</p>
            </div>
        )}
    </div>
  )
}
