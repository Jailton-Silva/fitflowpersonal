

"use client"

import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Appointment = {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    students: { name: string };
};

export function CalendarView({ appointments }: { appointments: Appointment[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekStartsOn = 1; // Monday
    const week = Array.from({ length: 7 }).map((_, i) =>
        addDays(startOfWeek(currentDate, { weekStartsOn }), i)
    );

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold font-headline capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {week.map((day) => (
                    <div key={day.toString()} className="border rounded-lg p-2 bg-background">
                        <h3 className="text-center font-semibold text-sm capitalize">
                            {format(day, "EEE", { locale: ptBR })}
                        </h3>
                        <p className={`text-center text-lg font-bold ${!isSameMonth(day, currentDate) && "text-muted-foreground"}`}>
                            {format(day, "d")}
                        </p>
                        <div className="mt-2 space-y-2">
                           {appointments
                                .filter(apt => isSameDay(new Date(apt.start_time), day))
                                .map(apt => (
                                    <div key={apt.id} className="p-2 rounded-md bg-primary/10 border-l-4 border-primary">
                                        <p className="font-semibold text-xs">{apt.title}</p>
                                        <p className="text-xs text-muted-foreground">{apt.students?.name}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(apt.start_time), "HH:mm")}</p>
                                    </div>
                                ))
                           }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
