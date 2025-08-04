
"use client";

import { useState, useMemo, useTransition } from "react";
import { Workout, Measurement, Student } from "@/lib/definitions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dumbbell,
  Activity,
  Ruler,
  Weight,
  Upload,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar } from "@/app/public/student/[id]/actions";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { parseISO } from "date-fns";

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
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const { toast } = useToast();

  const [isUploading, startUploadTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    student.avatar_url ?? null
  );

  // Filter states
  const [workoutsFilter, setWorkoutsFilter] = useState<{
    range?: DateRange;
  }>({});
  const [measurementsFilter, setMeasurementsFilter] = useState<{
    range?: DateRange;
  }>({});

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("avatar", file);
      startUploadTransition(async () => {
        const { error, path } = await uploadStudentAvatar(student.id, formData);
        if (error) {
          toast({
            title: "Erro no Upload",
            description: error,
            variant: "destructive",
          });
        } else {
          toast({ title: "Sucesso!", description: "Sua foto foi atualizada." });
          // The page will be revalidated, but we can update the preview for immediate feedback
          setAvatarPreview(path);
        }
      });
    }
  };

  const filteredWorkouts = useMemo(() => {
    const fromDate = workoutsFilter.range?.from
      ? new Date(workoutsFilter.range.from.setHours(0, 0, 0, 0))
      : null;
    const toDate = workoutsFilter.range?.to
      ? new Date(workoutsFilter.range.to.setHours(23, 59, 59, 999))
      : null;

    return workouts.filter((w) => {
      const itemDate = parseISO(w.created_at);
      const dateMatch =
        (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
      return dateMatch;
    });
  }, [workouts, workoutsFilter]);

  const filteredMeasurements = useMemo(() => {
    const fromDate = measurementsFilter.range?.from
      ? new Date(measurementsFilter.range.from.setHours(0, 0, 0, 0))
      : null;
    const toDate = measurementsFilter.range?.to
      ? new Date(measurementsFilter.range.to.setHours(23, 59, 59, 999))
      : null;

    return measurements.filter((m) => {
      const itemDate = parseISO(m.created_at);
      const dateMatch =
        (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
      return dateMatch;
    });
  }, [measurements, measurementsFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Student Info Card */}
          <Card className="overflow-hidden">
            <div className="bg-card p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-2 border-primary">
                    <AvatarImage
                      src={avatarPreview || undefined}
                      alt={student.name}
                    />
                    <AvatarFallback className="text-3xl">
                      {student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                      <Upload className="h-6 w-6 text-white" />
                    )}
                    <Input
                      id="avatar-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <Badge>Aluno</Badge>
                  <h1 className="text-3xl font-bold font-headline mt-1">
                    {student.name}
                  </h1>
                  <p className="text-muted-foreground">{student.email}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-muted-foreground mb-2 flex items-center">
                    <Dumbbell className="mr-2 h-4 w-4" /> Objetivos
                  </h3>
                  <p>{student.goals || "Nenhum objetivo definido."}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-muted-foreground mb-2 flex items-center">
                    <Ruler className="mr-2 h-4 w-4" /> Altura
                  </h3>
                  <p>{student.height ? `${student.height} cm` : "N/A"}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-muted-foreground mb-2 flex items-center">
                    <Weight className="mr-2 h-4 w-4" /> Peso Inicial
                  </h3>
                  <p>{student.weight ? `${student.weight} kg` : "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Workout Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Meus Planos de Treino
              </CardTitle>
              <CardDescription>
                Acesse os treinos preparados pelo seu personal trainer.
              </CardDescription>
              <div className="flex flex-col md:flex-row gap-2 pt-2">
                <DateRangeFilter
                  onDateChange={(range) =>
                    setWorkoutsFilter((prev) => ({ ...prev, range }))
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredWorkouts.length > 0 ? (
                <ul className="space-y-3">
                  {filteredWorkouts.map((workout: Workout) => (
                    <li
                      key={workout.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(workout.exercises as any[]).length} exercícios
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/public/workout/${workout.id}`}>
                          Acessar Treino
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum treino encontrado para os filtros selecionados.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Measurements History & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center">
                  <Activity className="mr-2" /> Minhas Avaliações Físicas
                </CardTitle>
                <CardDescription>
                  Seu histórico de medições.
                </CardDescription>
                <div className="flex flex-col md:flex-row gap-2 pt-2">
                  <DateRangeFilter
                    onDateChange={(range) =>
                      setMeasurementsFilter((prev) => ({ ...prev, range }))
                    }
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
                <CardTitle className="font-headline flex items-center">
                  <Activity className="mr-2" /> Gráfico de Evolução
                </CardTitle>
                <CardDescription>
                  Sua evolução física ao longo do tempo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart measurements={filteredMeasurements} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-muted-foreground text-xs no-print">
        <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
      </footer>
    </div>
  );
}
