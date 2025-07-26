
"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Student } from "@/lib/definitions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "../ui/button"

type ScheduleFiltersProps = {
    students: Pick<Student, 'id' | 'name'>[]
}

export function ScheduleFilters({ students }: ScheduleFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleFilterChange = (key: 'student' | 'status', value: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
    
    const clearFilters = () => {
         router.push(pathname, { scroll: false });
    }

    const hasActiveFilters = searchParams.has('student') || searchParams.has('status');

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <Select
                onValueChange={(value) => handleFilterChange('student', value)}
                value={searchParams.get('student') ?? ''}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por aluno..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Todos os alunos</SelectItem>
                    {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                onValueChange={(value) => handleFilterChange('status', value)}
                value={searchParams.get('status') ?? ''}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
            </Select>
            {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>Limpar filtros</Button>
            )}
        </div>
    )
}
