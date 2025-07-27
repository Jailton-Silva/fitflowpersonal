
"use client";

import { createClient } from "@/lib/supabase/client";
import { notFound, useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Cake, Ruler, Weight, Dumbbell, Shield, Activity, Calendar as CalendarIcon, Phone, Edit, PlusCircle, History, Filter } from "lucide-react";
import { format, differenceInYears, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import StudentForm from "@/components/students/student-form";
import MeasurementForm from "@/components/students/measurement-form";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { subDays } from "date-fns";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

async function getStudentData(studentId: string, supabase: ReturnType<typeof createClient>) {
    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        return null;
    }
    return student;
}

async function getStudentWorkouts(studentId: string, supabase: ReturnType<typeof createClient>) {
    const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
    
    if (error) console.error("Erro ao buscar treinos:", error);
    return data || [];
}

async function getStudentMeasurements(studentId: string, supabase: ReturnType<typeof createClient>) {
    const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });
    
    if (error) console.error("Erro ao buscar medições:", error);
    return data || [];
}

async function getStudentWorkoutSessions(studentId: string, supabase: ReturnType<typeof createClient>) {
    const { data, error } = await supabase
        .from('workout_sessions')
        .select(`*, workouts (name)`)
        .eq('student_id', studentId)
        .order('started_at', { ascending: false });

    if (error) console.error("Erro ao buscar sessões:", error);
    return (data as EnrichedWorkoutSession[]) || [];
}

export default function StudentDetailPage() {
    const params = useParams();
    const studentId = params.id as string;
    const supabase = createClient();
    
    const [student, setStudent] = useState<Student | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [sessions, setSessions] = useState<EnrichedWorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterText, setFilterText] = useState("");
    const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        if (!studentId) return;

        const fetchData = async () => {
            setLoading(true);
            const studentData = await getStudentData(studentId, supabase);
            if (!studentData) {
                setLoading(false);
                notFound();
                return;
            }
            setStudent(studentData);
            
            const [workoutsData, measurementsData, sessionsData] = await Promise.all([
                getStudentWorkouts(studentId, supabase),
                getStudentMeasurements(studentId, supabase),
                getStudentWorkoutSessions(studentId, supabase)
            ]);

            setWorkouts(workoutsData);
            setMeasurements(measurementsData);
            setSessions(sessionsData);
            setLoading(false);
        };

        fetchData();
    }, [studentId]);

    const filteredData = useMemo(() => {
        const fromDate = dateRange.from ? parseISO(`${dateRange.from}T00:00:00`) : null;
        const toDate = dateRange.to ? parseISO(`${dateRange.to}T23:59:59`) : null;
        const lowerCaseFilter = filterText.toLowerCase();

        const filterByDate = (dateStr: string) => {
            if (!fromDate && !toDate) return true;
            const itemDate = parseISO(dateStr);
            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
            return true;
        };
        
        const filteredMeasurements = measurements.filter(m => 
            filterByDate(m.created_at) &&
            (m.notes?.toLowerCase().includes(lowerCaseFilter) || `peso ${m.weight}`.includes(lowerCaseFilter))
        );

        const filteredWorkouts = workouts.filter(w => 
            filterByDate(w.created_at) &&
            (w.name.toLowerCase().includes(lowerCaseFilter) || w.description?.toLowerCase().includes(lowerCaseFilter))
        );

        const filteredSessions = sessions.filter(s =>
            filterByDate(s.started_at) &&
            (s.workouts?.name.toLowerCase().includes(lowerCaseFilter))
        );
        
        return {
            measurements: filteredMeasurements,
            workouts: filteredWorkouts,
            sessions: filteredSessions,
        }
    }, [measurements, workouts, sessions, filterText, dateRange]);


    if (loading) {
        return <div className="p-6"><Skeleton className="h-96 w-full" /></div>
    }

    if (!student) {
        return notFound();
    }

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 border-2 border-primary">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-3xl">
                        {student.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{student.email}</p>
                     {student.phone && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                           <Phone className="mr-2 h-4 w-4" />
                            <span>{student.phone}</span>
                        </div>
                    )}
                </div>
                 <StudentForm student={student}>
                    <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Aluno
                    </Button>
                </StudentForm>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><User className="mr-2"/> Detalhes Pessoais</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center"><Cake className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Idade:</strong><span className="ml-2">{age} anos</span></div>
                         <div className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Nascimento:</strong><span className="ml-2">{student.birth_date ? format(new Date(student.birth_date), 'dd/MM/yyyy') : 'N/A'}</span></div>
                        <div className="flex items-center"><Ruler className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Altura:</strong><span className="ml-2">{student.height ? `${student.height} cm` : 'N/A'}</span></div>
                        <div className="flex items-center"><Weight className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Peso Atual:</strong><span className="ml-2">{student.weight ? `${student.weight} kg` : 'N/A'}</span></div>
                    </CardContent>
                </Card>
                 <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Objetivos</CardTitle></CardHeader><CardContent><p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p></CardContent></Card>
                 <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2"/> Obs. Saúde</CardTitle></CardHeader><CardContent><p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent></Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2"><Filter />Filtros de Histórico</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <Input 
                        placeholder="Buscar por nome do treino, notas..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="max-w-sm"
                    />
                    <DateRangeFilter
                        defaultFrom={dateRange.from}
                        defaultTo={dateRange.to}
                        onDateChange={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    />
                </CardContent>
            </Card>

             <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle>
                        <MeasurementForm studentId={student.id}>
                            <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Nova Avaliação</Button>
                        </MeasurementForm>
                    </CardHeader>
                    <CardContent><MeasurementsHistory studentId={student.id} measurements={filteredData.measurements} /></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><CalendarIcon className="mr-2"/> Planos de Treino</CardTitle></CardHeader>
                    <CardContent>
                       {filteredData.workouts.length > 0 ? (
                           <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                               {filteredData.workouts.map((workout: Workout) => (
                                   <li key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                       <div>
                                           <p className="font-semibold">{workout.name}</p>
                                           <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                       </div>
                                       <Button variant="outline" size="sm" asChild><Link href={`/workouts/${workout.id}`}>Ver Plano</Link></Button>
                                   </li>
                               ))}
                           </div>
                       ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para os filtros selecionados.</p>}
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader><CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões de Treino</CardTitle></CardHeader>
                <CardContent><SessionsHistory sessions={filteredData.sessions} /></CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                <CardContent><ProgressChart measurements={filteredData.measurements} /></CardContent>
            </Card>
        </div>
    );
}

