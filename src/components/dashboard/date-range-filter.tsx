
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
    onDateChange?: (range: { from?: string; to?: string }) => void;
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

  const [date, setDate] = React.useState<DateRange | undefined>({
      from: defaultFrom ? parse(defaultFrom, "yyyy-MM-dd", new Date()) : undefined,
      to: defaultTo ? parse(defaultTo, "yyyy-MM-dd", new Date()) : undefined,
  });

  // This effect will run when `date` changes.
  React.useEffect(() => {
    const fromStr = date?.from ? format(date.from, "yyyy-MM-dd") : undefined;
    const toStr = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;

    // If a callback is provided, use it. This is for client-side filtering.
    if (onDateChange) {
      onDateChange({ from: fromStr, to: toStr });
    } else {
      // Otherwise, update the URL search params. This is for server-side filtering.
      const newParams = new URLSearchParams(searchParams.toString());
      if (fromStr) newParams.set("from", fromStr);
      else newParams.delete("from");

      if (toStr) newParams.set("to", toStr);
      else newParams.delete("to");
      
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [date, pathname, router, searchParams, onDateChange]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
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
            onSelect={setDate}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
