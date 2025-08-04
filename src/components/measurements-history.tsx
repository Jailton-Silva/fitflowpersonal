
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
import { Measurement } from "@/lib/definitions";
import { Edit } from "lucide-react";
import { Button } from "../ui/button";
import MeasurementForm from "../students/measurement-form";

type FormattedMeasurement = Measurement & {
    formattedDate: string;
}

export default function MeasurementsHistory({ studentId, measurements, isPublicView = false }: { studentId: string, measurements: Measurement[], isPublicView?: boolean }) {
  const [formattedMeasurements, setFormattedMeasurements] = useState<FormattedMeasurement[]>([]);
  
  useEffect(() => {
    // Format dates on the client to avoid hydration mismatch
    const clientFormatted = measurements.map(m => ({
        ...m,
        formattedDate: format(new Date(m.created_at), "dd/MM/yy", { locale: ptBR })
    }));
    setFormattedMeasurements(clientFormatted);
  }, [measurements]);

  if (!formattedMeasurements || formattedMeasurements.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhuma avaliação encontrada para os filtros selecionados.</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Peso</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Altura</TableHead>
            <TableHead className="text-right">Gordura %</TableHead>
            {!isPublicView && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
        </TableHeader>
        <TableBody>
            {formattedMeasurements.map((m) => (
            <TableRow key={m.id}>
                <TableCell className="font-medium">{m.formattedDate}</TableCell>
                <TableCell className="text-right">{m.weight} kg</TableCell>
                <TableCell className="text-right hidden sm:table-cell">{m.height} cm</TableCell>
                <TableCell className="text-right">{m.body_fat ? `${m.body_fat}%` : '-'}</TableCell>
                {!isPublicView && (
                    <TableCell className="text-right">
                        <MeasurementForm studentId={studentId} measurement={m}>
                            <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            </Button>
                        </MeasurementForm>
                    </TableCell>
                )}
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
