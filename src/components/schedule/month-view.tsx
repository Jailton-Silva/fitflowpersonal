
"use client";

import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle, Edit } from 'lucide-react';
import { Appointment, Student } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import AppointmentForm from './appointment-form';

const AppointmentBadge = ({ appointment, students }: { appointment: Appointment; students: Pick<Student, 'id' | 'name'>[] }) => {
    const statusVariant = {
        scheduled: 'bg-blue-500/20 text-blue-700 border-blue-500',
        completed: 'bg-green-500/20 text-green-700 border-green-500',
        cancelled: 'bg-red-500/20 text-red-700 border-red-500',
    }
    return (
       <AppointmentForm appointment={appointment} students={students}>
        <div className={cn("text-xs p-1 rounded-md overflow-hidden truncate cursor-pointer hover:opacity-80", statusVariant[appointment.status])}>
            <span className="font-semibold hidden sm:inline">{format(new Date(appointment.start_time), 'HH:mm')}</span> {appointment.title}
        </div>
      </AppointmentForm>
    )
}


export function MonthView({ appointments, students }: { appointments: Appointment[]; students: Pick<Student, 'id' | 'name'>[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold font-headline capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className='flex items-center gap-2'>
            <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
            </Button>
            </div>
            <AppointmentForm students={students}>
                <Button className="ripple flex-1 sm:flex-none">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agendar
                </Button>
            </AppointmentForm>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const date = startOfWeek(currentMonth, { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-semibold text-xs sm:text-sm capitalize text-muted-foreground" key={i}>
          {format(addDays(date, i), 'EEE', { locale: ptBR })}
        </div>
      );
    }
    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const appointmentsOnDay = appointments.filter((apt) =>
          isSameDay(new Date(apt.start_time), cloneDay)
        );

        days.push(
          <div
            className={cn(
              'relative flex flex-col h-24 sm:h-28 p-1 sm:p-2 border-t border-r border-border bg-background transition-colors hover:bg-muted/50',
              !isSameMonth(day, monthStart) ? 'text-muted-foreground bg-muted/20' : '',
              isSameDay(day, selectedDate) ? 'bg-primary/10' : ''
            )}
            key={day.toString()}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className="font-bold self-end text-xs sm:text-base">{formattedDate}</span>
            <div className='flex-1 space-y-1 overflow-y-auto'>
                {appointmentsOnDay.map(apt => <AppointmentBadge key={apt.id} appointment={apt} students={students} />)}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-b">{rows}</div>;
  };

  return (
    <div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
