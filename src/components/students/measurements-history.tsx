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

type Measurement = {
    id: string;
    created_at: string;
    weight: number;
    height: number;
    body_fat?: number;
    notes?: string;
}

export default function MeasurementsHistory({ measurements }: { measurements: Measurement[] }) {
  if (measurements.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhuma avaliação física registrada ainda.</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Peso</TableHead>
            <TableHead className="text-right">Altura</TableHead>
            <TableHead className="text-right">Gordura %</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {measurements.map((m) => (
            <TableRow key={m.id}>
                <TableCell>{format(new Date(m.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell className="text-right">{m.weight} kg</TableCell>
                <TableCell className="text-right">{m.height} cm</TableCell>
                <TableCell className="text-right">{m.body_fat ? `${m.body_fat}%` : '-'}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
