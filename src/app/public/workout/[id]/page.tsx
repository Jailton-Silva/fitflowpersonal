
"use client";

import { createClient } from "@/lib/supabase/client";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, ArrowLeft, Edit, Utensils, Share2, Video, Trophy, PartyPopper } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Workout, WorkoutSession, WorkoutExercise } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { getWorkoutSession, startWorkoutSession, getWorkoutDetails } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";


const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl.includes('youtube.com/watch?v=')) {
        return <p>URL do vídeo inválida.</p>
    }
    const videoId = videoUrl.split('v=')[1].split('&')[0];
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
        <iframe
            width="100%"
            height="315"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    );
};


export default function PublicWorkoutPage() {
    const params = useParams();
    const workoutId = params.id as string;
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!workoutId) return;

        const fetchData = async () => {
            const workoutData = await getWorkoutDetails(workoutId);
            if (!workoutData) {
                setLoading(false);
                notFound();
                return;
            }
            setWorkout(workoutData as Workout);
            
            if (workoutData.student_id) {
                const sessionData = await getWorkoutSession(workoutId, workoutData.student_id);
                setSession(sessionData);
            }
            setLoading(false);
        }
        fetchData();
    }, [workoutId]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast({
            title: "Link Copiado!",
            description: "O link de compartilhamento do treino foi copiado para a área de transferência.",
        });
    }

     const handleStartWorkout = async () => {
        if (!workout?.student_id) return;
        const { data, error } = await startWorkoutSession(workout.id, workout.student_id);
        if (error) {
            toast({ title: "Erro", description: "Não foi possível iniciar o treino.", variant: "destructive"});
        } else {
            setSession(data);
            toast({ title: "Sucesso!", description: "Treino iniciado. Marque os exercícios conforme for concluindo."});
        }
    }

    if (loading) {
        return (
             <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-40" />
                    <div className="flex gap-2">
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
    
    const student = workout.students;

    // Workout completed view
    if (session?.completed_at) {
        return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
                 <header className="w-full max-w-4xl mx-auto py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
                        <Dumbbell /> FitFlow
                    </h1>
                     <ThemeToggle />
                </header>
                <main className="flex-1 flex items-center justify-center w-full">
                    <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95">
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
                                <Trophy className="text-yellow-400 h-8 w-8" />
                                Parabéns, {student?.name?.split(' ')[0]}!
                            </CardTitle>
                            <CardDescription>
                                Você completou o treino <span className="font-bold">{workout.name}</span>!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <PartyPopper className="h-24 w-24 mx-auto text-primary" />
                            <p className="text-muted-foreground">
                                Treino finalizado em {format(new Date(session.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
                            </p>
                            <p>Continue com o excelente trabalho. Cada treino concluído é um passo mais perto dos seus objetivos!</p>
                            <Button onClick={handleShare}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Compartilhar Conquista
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
         <div className="flex flex-col min-h-screen bg-background">
             <header className="w-full max-w-4xl mx-auto py-4 flex justify-between items-center px-4">
                <h1 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
                    <Dumbbell /> FitFlow
                </h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar
                    </Button>
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex-1 py-6 px-4">
                 <div className="space-y-6 max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>{student?.name}</span>
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
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

                            {!session && (
                                <div className="text-center p-6 bg-muted rounded-lg">
                                    <h3 className="font-bold text-lg">Pronto para começar?</h3>
                                    <p className="text-muted-foreground mb-4">Clique no botão abaixo para iniciar seu treino e registrar seu progresso.</p>
                                    <Button onClick={handleStartWorkout} className="ripple">
                                        Começar Treino Agora
                                    </Button>
                                </div>
                            )}
                            
                            {session && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                                    {(workout.exercises as WorkoutExercise[]).map((exercise, index) => {
                                        const isCompleted = session.completed_exercises?.includes(exercise.exercise_id) ?? false;
                                        return (
                                            <Card key={exercise.exercise_id || index} className={cn("bg-muted/50 transition-all", isCompleted && "bg-green-500/10 border-green-500/50")}>
                                                <CardHeader>
                                                    <div className="flex justify-between items-center">
                                                        <CardTitle className="text-lg font-headline flex items-center gap-3">
                                                            <ExerciseCheck sessionId={session.id} exerciseId={exercise.exercise_id} isCompleted={isCompleted} />
                                                            {exercise.name}
                                                        </CardTitle>
                                                        {exercise.video_url && (
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                                        <Video className="h-4 w-4" />
                                                                        Ver Vídeo
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-3xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle>{exercise.name}</DialogTitle>
                                                                    </DialogHeader>
                                                                    <VideoPlayer videoUrl={exercise.video_url} />
                                                                </DialogContent>
                                                            </Dialog>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div><p className="font-semibold">Séries</p><p>{exercise.sets || '-'}</p></div>
                                                        <div><p className="font-semibold">Repetições</p><p>{exercise.reps || '-'}</p></div>
                                                        <div><p className="font-semibold">Carga</p><p>{exercise.load ? `${exercise.load} kg` : '-'}</p></div>
                                                        <div><p className="font-semibold">Descanso</p><p>{exercise.rest ? `${exercise.rest} s` : '-'}</p></div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
         </div>
    );
}
