
"use client";

import { useState } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Appointment } from '@/lib/definitions';
import { cn } from '@/lib/utils';


const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const statusVariant = {
        scheduled: 'bg-blue-500/20 text-blue-700 border-blue-500',
        completed: 'bg-green-500/20 text-green-700 border-green-500',
        cancelled: 'bg-red-500/20 text-red-700 border-red-500',
    }
    
    return (
        <div className={cn("p-2 rounded-md border-l-4", statusVariant[appointment.status])}>
            <p className="font-semibold text-xs">{appointment.title}</p>
            <p className="text-xs text-muted-foreground">{appointment.students?.name}</p>
            <p className="text-xs text-muted-foreground">
                {format(new Date(appointment.start_time), "HH:mm")} - {format(new Date(appointment.end_time), "HH:mm")}
            </p>
        </div>
    )
}


export function WeekView({ appointments }: { appointments: Appointment[] }) {
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
        <h2 className="text-xl font-semibold font-headline capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button className="ripple hidden sm:flex">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Agendamento
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {week.map((day) => (
          <div key={day.toString()} className="border rounded-lg p-2 bg-background">
            <h3 className="text-center font-semibold text-sm capitalize">
              {format(day, 'EEE', { locale: ptBR })}
            </h3>
            <p
              className={cn(
                'text-center text-lg font-bold',
                !isSameMonth(day, currentDate) && 'text-muted-foreground'
              )}
            >
              {format(day, 'd')}
            </p>
            <div className="mt-2 space-y-2">
              {appointments
                .filter((apt) => isSameDay(new Date(apt.start_time), day))
                .sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
