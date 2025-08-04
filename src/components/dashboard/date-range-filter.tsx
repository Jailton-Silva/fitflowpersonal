
"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DateRangeFilterProps = React.HTMLAttributes<HTMLDivElement> & {
    defaultFrom?: string;
    defaultTo?: string;
    onDateChange?: (range: DateRange | undefined) => void;
}

export function DateRangeFilter({
  className,
  defaultFrom,
  defaultTo,
  onDateChange
}: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [date, setDate] = React.useState<DateRange | undefined>(() => ({
      from: defaultFrom ? parse(defaultFrom, "yyyy-MM-dd", new Date()) : undefined,
      to: defaultTo ? parse(defaultTo, "yyyy-MM-dd", new Date()) : undefined,
  }));
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // This effect handles URL-based state management for Server Components
    // It does not run if onDateChange is provided
    if (!onDateChange) {
      const newParams = new URLSearchParams(searchParams.toString());
      if (date?.from) newParams.set("from", format(date.from, "yyyy-MM-dd"));
      else newParams.delete("from");

      if (date?.to) newParams.set("to", format(date.to, "yyyy-MM-dd"));
      else newParams.delete("to");
      
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [date, onDateChange, pathname, router, searchParams]);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (onDateChange) {
      onDateChange(selectedDate);
    }
    // Only close if it's not a client-side component with a handler
    // Or if a full range is selected
    if (!onDateChange || (selectedDate?.from && selectedDate?.to)) {
        setIsOpen(false);
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-9",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", {locale: ptBR})} -{" "}
                  {format(date.to, "LLL dd, y", {locale: ptBR})}
                </>
              ) : (
                format(date.from, "LLL dd, y", {locale: ptBR})
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
