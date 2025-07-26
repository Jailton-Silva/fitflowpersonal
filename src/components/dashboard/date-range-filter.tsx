"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { subDays, format } from "date-fns";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleDateChange = (days: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const to = new Date();
    const from = subDays(to, days);
    
    newParams.set("from", format(from, "yyyy-MM-dd"));
    newParams.set("to", format(to, "yyyy-MM-dd"));
    
    router.push(`${pathname}?${newParams.toString()}`);
  };
  
  const isActive = (days: number) => {
    const from = searchParams.get('from');
    if (!from) return false;
    const expectedFrom = format(subDays(new Date(), days), "yyyy-MM-dd");
    return from === expectedFrom;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isActive(7) ? "default" : "outline"}
        size="sm"
        onClick={() => handleDateChange(7)}
      >
        Últimos 7 dias
      </Button>
      <Button
        variant={isActive(30) ? "default" : "outline"}
        size="sm"
        onClick={() => handleDateChange(30)}
      >
        Últimos 30 dias
      </Button>
      <Button
        variant={isActive(90) ? "default" : "outline"}
        size="sm"
        onClick={() => handleDateChange(90)}
      >
        Últimos 90 dias
      </Button>
    </div>
  );
}
