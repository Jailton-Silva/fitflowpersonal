"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
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

export function DateRangeFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: from ? new Date(from) : subDays(new Date(), 30),
    to: to ? new Date(to) : new Date(),
  })

  React.useEffect(() => {
    if (date?.from && date?.to) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("from", format(date.from, "yyyy-MM-dd"));
        newParams.set("to", format(date.to, "yyyy-MM-dd"));
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [date, pathname, router, searchParams]);

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
              <span>Selecione uma data</span>
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
