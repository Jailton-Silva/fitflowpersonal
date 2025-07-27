
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
import { Measurement } from "@/lib/definitions";
import { Edit } from "lucide-react";
import { Button } from "../ui/button";
import MeasurementForm from "./measurement-form";

export default function MeasurementsHistory({ studentId, measurements }: { studentId: string, measurements: Measurement[] }) {
  if (!measurements || measurements.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhuma avaliação encontrada para os filtros selecionados.</p>;
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
            <TableHead className="text-right">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {measurements.map((m) => (
            <TableRow key={m.id}>
                <TableCell>{format(new Date(m.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell className="text-right">{m.weight} kg</TableCell>
                <TableCell className="text-right">{m.height} cm</TableCell>
                <TableCell className="text-right">{m.body_fat ? `${m.body_fat}%` : '-'}</TableCell>
                <TableCell className="text-right">
                    <MeasurementForm studentId={studentId} measurement={m}>
                        <Button variant="ghost" size="icon">
                           <Edit className="h-4 w-4" />
                        </Button>
                    </MeasurementForm>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
