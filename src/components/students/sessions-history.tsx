
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkoutSession } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";

type EnrichedSession = WorkoutSession & {
    workouts: { name: string } | null;
}

export default function SessionsHistory({ sessions }: { sessions: EnrichedSession[] }) {
  const [formattedSessions, setFormattedSessions] = useState<any[]>([]);

  useEffect(() => {
    // Format dates on the client to avoid hydration mismatch
    const clientFormattedSessions = sessions.map(session => ({
        ...session,
        formattedDate: format(new Date(session.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    }));
    setFormattedSessions(clientFormattedSessions);
  }, [sessions]);


  if (!formattedSessions || formattedSessions.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhuma sessão de treino encontrada.</p>;
  }

  return (
    <div className="max-h-80 overflow-y-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Treino</TableHead>
            <TableHead className="hidden sm:table-cell">Data de Início</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Exercícios</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {formattedSessions.map((session) => (
            <TableRow key={session.id}>
                <TableCell className="font-medium max-w-[150px] truncate">{session.workouts?.name ?? 'Treino não encontrado'}</TableCell>
                <TableCell className="hidden sm:table-cell">{session.formattedDate}</TableCell>
                <TableCell>
                    {session.completed_at ? (
                         <Badge variant="default">Finalizado</Badge>
                    ) : (
                         <Badge variant="secondary">Em Andamento</Badge>
                    )}
                </TableCell>
                <TableCell className="text-right">
                    {session.completed_exercises ? (session.completed_exercises as string[]).length : 0}
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
