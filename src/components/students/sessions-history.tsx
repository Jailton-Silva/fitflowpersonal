
"use client";

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
  if (!sessions || sessions.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhuma sessão de treino registrada ainda.</p>;
  }

  return (
    <div className="max-h-80 overflow-y-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Treino</TableHead>
            <TableHead>Data de Início</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Exercícios Concluídos</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sessions.map((session) => (
            <TableRow key={session.id}>
                <TableCell className="font-medium">{session.workouts?.name ?? 'Treino não encontrado'}</TableCell>
                <TableCell>{format(new Date(session.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
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
