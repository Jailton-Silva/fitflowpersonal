
"use client";

import { createClient } from "@/lib/supabase/client";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Share2, Video, Trophy, Lock } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useTransition } from "react";
import { Workout, WorkoutSession } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getWorkoutSession, startWorkoutSession, updateCompletedExercises } from "./actions";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";


async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select(
            '*, students(id, name, student_id:id)'
        )
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        return null;
    }
    return data as Workout;
}


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

type EnrichedWorkout = Workout & { session?: WorkoutSession | null };

export default function PublicWorkoutPage() {
    const params = useParams();
    const workoutId = params.id as string;
    const [workout, setWorkout] = useState<EnrichedWorkout | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (workoutId) {
            const fetchData = async () => {
                const workoutDetails = await getWorkoutDetails(workoutId);
                if (workoutDetails) {
                    const session = await getWorkoutSession(workoutDetails.id, workoutDetails.student_id);
                    setWorkout({ ...workoutDetails, session });
                }
                setLoading(false);
            };
            fetchData();
        }
    }, [workoutId]);

    const handleStartWorkout = () => {
        startTransition(async () => {
            const { data: newSession, error } = await startWorkoutSession(workoutId);
            if (error) {
                toast({ title: "Erro", description: "Não foi possível iniciar o treino.", variant: "destructive" });
            } else if (newSession) {
                setWorkout(prev => prev ? { ...prev, session: newSession } : null);
                toast({ title: "Sucesso!", description: "Treino iniciado. Vamos lá!" });
            }
        });
    };
    
    if (loading) {
        return (
             <div className="space-y-6 p-4 md:p-6 lg:p-8">
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
        return notFound();
    }
    
    const isWorkoutCompleted = !!workout.session?.completed_at;

    return (
        <div className="bg-background min-h-screen">
             <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Link href="#" className="flex items-center justify-center" prefetch={false}>
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="sr-only">FitFlow</span>
                </Link>
                <h1 className="ml-2 text-2xl font-headline font-bold text-primary">FitFlow</h1>
                <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                    <ThemeToggle />
                </nav>
            </header>
            <main className="p-4 md:p-6 lg:p-8">
            {isWorkoutCompleted ? (
                <Card className="text-center animate-in fade-in-50">
                    <CardHeader>
                        <Trophy className="mx-auto h-16 w-16 text-yellow-400" />
                        <CardTitle className="text-3xl font-headline mt-4">Parabéns!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl text-muted-foreground">Você completou o treino <span className="font-semibold text-primary">{workout.name}</span>.</p>
                        <p className="mt-2">Continue assim, você está no caminho certo!</p>
                    </CardContent>
                     <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            Finalizado em: {format(new Date(workout.session!.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </CardFooter>
                </Card>
            ) : !workout.session ? (
                 <div className="flex items-center justify-center py-12">
                     <Card className="text-center max-w-md">
                         <CardHeader>
                            <CardTitle className="text-2xl font-headline">Pronto para começar?</CardTitle>
                            <CardDescription>
                                Inicie o treino para registrar seu progresso.
                            </CardDescription>
                         </CardHeader>
                         <CardContent>
                              <Button onClick={handleStartWorkout} disabled={isPending} className="w-full ripple">
                                {isPending ? "Iniciando..." : "Iniciar Treino"}
                              </Button>
                         </CardContent>
                     </Card>
                 </div>
            ) : (
                <div className="space-y-6" id="printable-area">
                <div className="flex justify-between items-center no-print">
                    <div>
                        <h1 className="text-2xl font-bold font-headline">{workout.name}</h1>
                        <p className="text-muted-foreground">Sessão iniciada em: {format(new Date(workout.session.started_at), "dd/MM/yyyy 'às' HH:mm")}</p>
                    </div>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Imprimir / Salvar PDF
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{(workout.students as any)?.name}</span>
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
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                            {(workout.exercises as any[]).map((exercise, index) => {
                                const isCompleted = workout.session!.completed_exercises.includes(exercise.exercise_id);
                                return (
                                    <Card key={index} className={cn("bg-muted/50 transition-all", isCompleted && "bg-green-500/10")}>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-lg font-headline flex items-center gap-2">
                                                   <ExerciseCheck sessionId={workout.session!.id} exerciseId={exercise.exercise_id} isCompleted={isCompleted} />
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
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
                </div>
            )}
            </main>
        </div>
    );
}
