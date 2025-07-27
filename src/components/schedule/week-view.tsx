
"use client";

import { useState } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle, Edit } from 'lucide-react';
import { Appointment, Student } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import AppointmentForm from './appointment-form';


const AppointmentCard = ({ appointment, students }: { appointment: Appointment, students: Pick<Student, 'id' | 'name'>[] }) => {
    const statusVariant = {
        scheduled: 'bg-blue-500/20 text-blue-700 border-blue-500',
        completed: 'bg-green-500/20 text-green-700 border-green-500',
        cancelled: 'bg-red-500/20 text-red-700 border-red-500',
    }
    
    return (
        <div className={cn("p-2 rounded-md border-l-4 relative group", statusVariant[appointment.status])}>
             <AppointmentForm appointment={appointment} students={students}>
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="h-3 w-3" />
                </Button>
             </AppointmentForm>
            <p className="font-semibold text-xs">{appointment.title}</p>
            <p className="text-xs text-muted-foreground">{appointment.students?.name}</p>
            <p className="text-xs text-muted-foreground">
                {format(new Date(appointment.start_time), "HH:mm")} - {format(new Date(appointment.end_time), "HH:mm")}
            </p>
        </div>
    )
}


export function WeekView({ appointments, students }: { appointments: Appointment[]; students: Pick<Student, 'id' | 'name'>[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStartsOn = 1; // Monday
  const week = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfWeek(currentDate, { weekStartsOn }), i)
  );

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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
        <AppointmentForm students={students}>
            <Button className="ripple flex-1 sm:flex-none">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Agendamento
            </Button>
        </AppointmentForm>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {week.map((day) => (
          <div key={day.toString()} className="border rounded-lg p-2 bg-background min-h-24">
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
                  <AppointmentCard key={apt.id} appointment={apt} students={students} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
