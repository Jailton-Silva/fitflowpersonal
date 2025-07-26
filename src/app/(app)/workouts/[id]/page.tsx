
"use client";

import { createClient } from "@/lib/supabase/client";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, ArrowLeft, Printer, Edit, Utensils } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Workout } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select(
            '*, students(id, name)'
        )
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        return null;
    }
    return data;
}

export default function WorkoutDetailPage() {
    const params = useParams();
    const workoutId = params.id as string;
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (workoutId) {
            getWorkoutDetails(workoutId).then(data => {
                setWorkout(data as Workout);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [workoutId]);
    
    if (loading) {
        return (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-40" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <div className="flex items-center gap-4 mt-2">
                           <Skeleton className="h-5 w-48" />
                           <Skeleton className="h-5 w-64" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <Skeleton className="h-20 w-full" />
                       <Skeleton className="h-12 w-1/4" />
                       <div className="space-y-4">
                           <Skeleton className="h-24 w-full" />
                           <Skeleton className="h-24 w-full" />
                       </div>
                    </CardContent>
                </Card>
             </div>
        )
    }

    if (!workout) {
        notFound();
    }

    const handlePrint = () => {
        window.print();
    }

    return (
        <div className="space-y-6" id="printable-area">
            <div className="flex justify-between items-center no-print">
                 <Button variant="outline" asChild>
                    <Link href="/workouts">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Treinos
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                    <Button asChild className="ripple">
                        <Link href={`/workouts/${workout.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                                <Link href={`/students/${(workout.students as any)?.id}`} className="flex items-center gap-2 hover:underline">
                                    <User className="h-4 w-4" />
                                    <span>{(workout.students as any)?.name}</span>
                                </Link>
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Criado em {format(new Date(workout.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </span>
                            </CardDescription>
                        </div>
                        <Badge>Plano de Treino</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {workout.description && (
                        <div className="prose prose-sm max-w-none text-muted-foreground mb-6 whitespace-pre-wrap">
                           <p>{workout.description}</p>
                        </div>
                    )}

                    {workout.diet_plan && (
                        <div className="mb-6">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Utensils className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                             <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                               <p>{workout.diet_plan}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                        {(workout.exercises as any[]).map((exercise, index) => (
                             <Card key={index} className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                                        {exercise.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="font-semibold">Séries</p>
                                            <p>{exercise.sets || '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold">Repetições</p>
                                            <p>{exercise.reps || '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold">Carga</p>
                                            <p>{exercise.load ? `${exercise.load} kg` : '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold">Descanso</p>
                                            <p>{exercise.rest ? `${exercise.rest} s` : '-'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
