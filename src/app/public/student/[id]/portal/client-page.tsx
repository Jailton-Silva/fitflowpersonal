
"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dumbbell,
  Weight,
  Ruler,
  Calendar,
  Activity,
  User,
  Upload,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Workout, Measurement, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementForm from "@/components/students/measurement-form";
import MeasurementsHistory from "@/components/students/measurements-history";
import { parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar } from "../actions";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StudentPortalClientProps = {
  student: Student;
  initialWorkouts?: Workout[];
  initialMeasurements?: Measurement[];
};

export default function StudentPortalClient({
  student,
  initialWorkouts = [],
  initialMeasurements = [],
}: StudentPortalClientProps) {
  const [isUploading, startUploadTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);
  const { toast } = useToast();

  const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({});
  const [workoutsFilter, setWorkoutsFilter] = useState<{ status?: 'all' | 'active' | 'inactive'; range?: DateRange }>({ status: 'all' });


  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('avatar', file);
      startUploadTransition(async () => {
          const { error } = await uploadStudentAvatar(student.id, formData);
          if (error) {
              toast({ title: "Erro no Upload", description: error, variant: "destructive" });
          } else {
              toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada."});
          }
      });
    }
  };

  const filteredMeasurements = useMemo(() => {
    const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0,0,0,0)) : null;
    const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23,59,59,999)) : null;

    return initialMeasurements.filter(m => {
        const itemDate = parseISO(m.created_at);
        const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
        return dateMatch;
    });
  }, [initialMeasurements, measurementsFilter]);

  const filteredWorkouts = useMemo(() => {
    const fromDate = workoutsFilter.range?.from ? new Date(workoutsFilter.range.from.setHours(0,0,0,0)) : null;
    const toDate = workoutsFilter.range?.to ? new Date(workoutsFilter.range.to.setHours(23,59,59,999)) : null;
    
    return initialWorkouts.filter(w => {
      const itemDate = parseISO(w.created_at);
      const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
      const statusMatch = workoutsFilter.status === 'all' || w.status === workoutsFilter.status;

      return dateMatch && statusMatch;
    });
  }, [initialWorkouts, workoutsFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden">
        <div className="bg-muted/50 p-6 flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-primary">
                    <AvatarImage src={avatarPreview || student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-3xl">
                        {student.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin"/> : <Upload className="h-6 w-6"/>}
                    <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading}/>
                </label>
            </div>
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                <p className="text-muted-foreground">{student.email}</p>
            </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="flex items-center gap-2"><User className="text-primary"/><strong>Objetivo:</strong> {student.goals || "Não definido"}</div>
            <div className="flex items-center gap-2"><Weight className="text-primary"/><strong>Peso:</strong> {student.weight ? `${student.weight} kg` : "N/A"}</div>
            <div className="flex items-center gap-2"><Ruler className="text-primary"/><strong>Altura:</strong> {student.height ? `${student.height} cm` : "N/A"}</div>
             <div className="flex items-center gap-2"><Calendar className="text-primary"/><strong>Membro desde:</strong> {new Date(student.created_at).toLocaleDateString('pt-BR')}</div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Dumbbell className="mr-2" /> Meus Treinos
          </CardTitle>
          <CardDescription>
            Acesse seus planos de treino atuais e passados.
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-2">
            <Select
                onValueChange={(value: 'all' | 'active' | 'inactive') => setWorkoutsFilter(prev => ({ ...prev, status: value }))}
                value={workoutsFilter.status}
            >
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="Filtrar por status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
            </Select>
            <DateRangeFilter
                onDateChange={(range) => setWorkoutsFilter(prev => ({...prev, range}))}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout) => (
                <Link
                  key={workout.id}
                  href={`/public/workout/${workout.id}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{workout.name}</p>
                    <Badge variant={workout.status === "active" ? "default" : "secondary"}>
                      {workout.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workout.exercises.length} exercícios
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum plano de treino encontrado para os filtros selecionados.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <Activity className="mr-2" /> Histórico de Medições
            </CardTitle>
             <CardDescription>
                Acompanhe sua evolução física ao longo do tempo.
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-2 pt-2">
                <DateRangeFilter
                    onDateChange={(range) => setMeasurementsFilter(prev => ({...prev, range}))}
                />
            </div>
          </CardHeader>
          <CardContent>
            <MeasurementsHistory
              studentId={student.id}
              measurements={filteredMeasurements}
              isPublicView={true}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Gráfico de Evolução</CardTitle>
             <CardDescription>
                Visualize seu progresso de peso e gordura corporal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart measurements={filteredMeasurements} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
