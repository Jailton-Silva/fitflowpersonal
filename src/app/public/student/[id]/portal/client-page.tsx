
"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Cake, Ruler, Weight, Dumbbell, Phone, Activity, Trophy } from "lucide-react";
import { differenceInYears, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Workout, Measurement, Student } from "@/lib/definitions";
import MeasurementsHistory from "@/components/students/measurements-history";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProgressChart from "@/components/students/progress-chart";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";

type StudentPublicPortalClientProps = {
    student: Student;
    initialWorkouts: Workout[];
    initialMeasurements: Measurement[];
}

export default function StudentPublicPortalClient({ student, initialWorkouts, initialMeasurements }: StudentPublicPortalClientProps) {
    
    const [workoutsFilter, setWorkoutsFilter] = useState("");
    const [measurementsFilter, setMeasurementsFilter] = useState<DateRange | undefined>(undefined);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';

    const filteredWorkouts = useMemo(() => {
        const lowerCaseFilter = workoutsFilter.toLowerCase();
        return initialWorkouts.filter(w => w.name.toLowerCase().includes(lowerCaseFilter));
    }, [initialWorkouts, workoutsFilter]);

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter?.from ? new Date(measurementsFilter.from.setHours(0,0,0,0)) : null;
        const toDate = measurementsFilter?.to ? new Date(measurementsFilter.to.setHours(23,59,59,999)) : null;

        return initialMeasurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            return (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
        });
    }, [initialMeasurements, measurementsFilter]);
    
    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 no-print">
                <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow Portal</h1>
                    </div>
                </div>
            </header>
             <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center bg-card p-6 rounded-lg shadow-sm">
                        <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                            <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                            <AvatarFallback className="text-3xl">
                                {student.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 text-center sm:text-left">
                            <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                            <p className="text-muted-foreground">{student.email}</p>
                            <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground pt-1 gap-4">
                               {student.phone && ( <div className="flex items-center"><Phone className="mr-2 h-4 w-4" /><span>{student.phone}</span></div>)}
                               {age !== 'N/A' && (<div className="flex items-center"><Cake className="mr-2 h-4 w-4"/><span>{age} anos</span></div>)}
                            </div>
                        </div>
                    </div>
                    
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Planos de Treino</CardTitle>
                             <div className="pt-2">
                                <Input 
                                    placeholder="Buscar por nome do plano..."
                                    value={workoutsFilter}
                                    onChange={(e) => setWorkoutsFilter(e.target.value)}
                                    className="h-9 max-w-sm"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredWorkouts.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredWorkouts.map((workout) => (
                                        <Link key={workout.id} href={`/public/workout/${workout.id}`} className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                           <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{workout.name}</p>
                                                    <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                                </div>
                                                <Button variant="outline" size="sm">Ver Treino</Button>
                                           </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">Nenhum plano de treino encontrado.</p>
                            )}
                        </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Minhas Avaliações Físicas</CardTitle>
                                 <div className="pt-2">
                                    <DateRangeFilter onDateChange={setMeasurementsFilter} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Trophy className="mr-2"/> Meus Objetivos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{student.goals || "Nenhum objetivo definido."}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ProgressChart measurements={filteredMeasurements} />
                        </CardContent>
                    </Card>

                </div>
            </main>
             <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}
