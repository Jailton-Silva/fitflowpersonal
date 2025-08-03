
"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { Student, Exercise } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Check } from "lucide-react"
import { Badge } from "../ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command"
import { cn } from "@/lib/utils"

type WorkoutFiltersProps = {
    students: Pick<Student, 'id' | 'name'>[];
    exercises: Pick<Exercise, 'id' | 'name'>[];
}

export function WorkoutFilters({ students, exercises }: WorkoutFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Date Range State
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: searchParams.get('from') ? parse(searchParams.get('from')!, 'yyyy-MM-dd', new Date()) : undefined,
        to: searchParams.get('to') ? parse(searchParams.get('to')!, 'yyyy-MM-dd', new Date()) : undefined,
    });

    // Multi-select State
    const [selectedExercises, setSelectedExercises] = React.useState<Pick<Exercise, 'id' | 'name'>[]>(() => {
        const exerciseIds = searchParams.getAll('exercises');
        return exercises.filter(e => exerciseIds.includes(e.id));
    });

    // Effect to update URL when filters change
    React.useEffect(() => {
        const newParams = new URLSearchParams(searchParams.toString());

        // Handle date
        if (date?.from) {
            newParams.set("from", format(date.from, "yyyy-MM-dd"));
        } else {
            newParams.delete("from");
        }
        if (date?.to) {
            newParams.set("to", format(date.to, "yyyy-MM-dd"));
        } else {
            newParams.delete("to");
        }
        
        // Handle exercises
        newParams.delete('exercises');
        selectedExercises.forEach(ex => newParams.append('exercises', ex.id));
        
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }, [date, selectedExercises, pathname, router, searchParams]);

    const handleFilterChange = (key: 'student' | 'status', value: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
    
    const clearFilters = () => {
         setDate({ from: undefined, to: undefined });
         setSelectedExercises([]);
         router.push(pathname, { scroll: false });
    }

    const hasActiveFilters = searchParams.has('student') || searchParams.has('from') || searchParams.has('to') || searchParams.getAll('exercises').length > 0 || searchParams.has('status');

    return (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-card">
            <Select
                onValueChange={(value) => handleFilterChange('student', value)}
                value={searchParams.get('student') ?? 'all'}
            >
                <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px] flex-1">
                    <SelectValue placeholder="Filtrar por aluno..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os alunos</SelectItem>
                    {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                onValueChange={(value) => handleFilterChange('status', value)}
                value={searchParams.get('status') ?? 'all'}
            >
                <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px] flex-1">
                    <SelectValue placeholder="Filtrar por status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className="w-full sm:w-auto sm:min-w-[240px] justify-start text-left font-normal flex-1"
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
                    <span>Filtrar por data...</span>
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

             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal flex-1">
                        Exercícios
                        {selectedExercises.length > 0 && <Badge variant="secondary" className="ml-auto">{selectedExercises.length}</Badge>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                   <Command>
                       <CommandInput placeholder="Buscar exercícios..." />
                       <CommandList>
                           <CommandEmpty>Nenhum exercício encontrado.</CommandEmpty>
                           <CommandGroup>
                               {exercises.map((exercise) => {
                                   const isSelected = selectedExercises.some(e => e.id === exercise.id);
                                   return (
                                     <CommandItem
                                        key={exercise.id}
                                        onSelect={() => {
                                            if (isSelected) {
                                                setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
                                            } else {
                                                setSelectedExercises([...selectedExercises, exercise]);
                                            }
                                        }}
                                     >
                                         <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                           <Check className="h-4 w-4" />
                                         </div>
                                         <span>{exercise.name}</span>
                                     </CommandItem>
                                   )
                               })}
                           </CommandGroup>
                            {selectedExercises.length > 0 && (
                                <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={() => setSelectedExercises([])} className="justify-center text-center">
                                    Limpar seleção
                                    </CommandItem>
                                </CommandGroup>
                                </>
                            )}
                       </CommandList>
                   </Command>
                </PopoverContent>
             </Popover>

            {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>Limpar filtros</Button>
            )}
        </div>
    )
}
