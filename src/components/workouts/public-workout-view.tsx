

"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useMemo, useTransition } from "react";
import { Dumbbell, User, Trophy, Printer, Video, Loader2, ArrowLeft } from "lucide-react";
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Workout, WorkoutSession } from "@/lib/definitions";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicHeader from "../layout/public-header";
import { finishWorkoutSession } from "@/app/public/workout/[id]/actions";

// Combined function to get relevant session data
async function getSessionData(workoutId: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('workout_id', workoutId)
        .order('started_at', { ascending: false });

    if (error) {
        console.error("Error fetching sessions:", error);
        return { activeSession: null, completedTodaySession: null };
    }

    const activeSession = data.find(s => s.completed_at === null) || null;
    const completedTodaySession = data.find(s => s.completed_at && isToday(new Date(s.completed_at))) || null;

    return { activeSession, completedTodaySession };
}


async function startWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
            workout_id: workoutId,
            student_id: studentId,
            started_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) {
        console.error("Error starting session:", error);
    }
    return data as WorkoutSession | null;
}

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
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

export default function PublicWorkoutView({ workout }: { workout: Workout }) {
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [completedToday, setCompletedToday] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFinishing, startFinishTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();
    
    const finalSessionToDisplay = useMemo(() => completedToday || session, [completedToday, session]);

    useEffect(() => {
        setLoading(true);
        getSessionData(workout.id).then(({ activeSession, completedTodaySession }) => {
            setSession(activeSession);
            setCompletedToday(completedTodaySession);
            setLoading(false);
        });
    }, [workout.id]);

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const handleStartWorkout = async () => {
        if (workout.status === 'inactive') {
            toast({
                title: "Treino Concluído",
                description: "Este plano de treino foi marcado como concluído e não pode ser iniciado.",
                variant: "destructive"
            });
            return;
        }
        if (!workout.student_id) {
             toast({
                title: "Erro",
                description: "Este treino não está associado a nenhum aluno.",
                variant: "destructive",
            });
            return;
        }
        if (completedToday) {
             toast({
                title: "Treino já finalizado hoje",
                description: "Você já concluiu este treino hoje. Volte amanhã!",
            });
            return;
        }
        setLoading(true);
        const newSession = await startWorkoutSession(workout.id, workout.student_id);
        if (newSession) {
            setSession(newSession);
        } else {
             toast({
                title: "Erro ao iniciar treino",
                description: "Não foi possível registrar o início da sessão. Tente novamente.",
                variant: "destructive",
            });
        }
        setLoading(false);
        router.refresh();
    }
    
    const handleFinishWorkout = async () => {
        if (!session) return;
        startFinishTransition(async () => {
            const { error } = await finishWorkoutSession(session.id);
            if(error) {
                 toast({
                    title: "Erro ao finalizar treino",
                    description: error.error,
                    variant: "destructive",
                });
            } else {
                 toast({
                    title: "Parabéns!",
                    description: "Treino finalizado com sucesso.",
                });
                router.refresh();
            }
        });
    }

    if (loading) {
         return (
             <div className="flex flex-col min-h-screen bg-muted p-4 sm:p-8">
                <Skeleton className="max-w-4xl mx-auto w-full h-96" />
             </div>
        )
    }
    
    const isWorkoutFinished = finalSessionToDisplay && finalSessionToDisplay.completed_at;
    const canStartWorkout = !finalSessionToDisplay && workout.status === 'active';

    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <PublicHeader studentId={workout.student_id} />

            <main className="flex-1 py-8 px-4" id="printable-area">
                <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-lg p-6 sm:p-8 space-y-8">
                     <header>
                         <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <Button variant="link" asChild className="p-0 h-auto mb-2 no-print">
                                    <Link href={`/public/student/${workout.student_id}/portal`}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Voltar ao Portal
                                    </Link>
                                </Button>
                                <h1 className="text-3xl sm:text-4xl font-bold font-headline mt-2">{workout.name}</h1>
                                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{workout.students?.name}</span>
                                    </div>
                                     <span className="text-sm">Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                                </div>
                            </div>
                             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto self-start no-print">
                                {canStartWorkout && (
                                    <Button onClick={handleStartWorkout} className="ripple w-full sm:w-auto">Iniciar Treino</Button>
                                )}
                                <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir
                                </Button>
                            </div>
                        </div>
                    </header>

                    {isWorkoutFinished && (
                        <div className="text-center py-6 px-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
                            <h2 className="text-2xl font-bold font-headline mt-4">Parabéns!</h2>
                            <p className="text-muted-foreground mt-1">Você concluiu este treino. Ótimo trabalho!</p>
                             <p className="text-sm text-muted-foreground mt-1">Finalizado em: {format(new Date(finalSessionToDisplay.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        </div>
                    )}

                    {workout.status === 'inactive' && !finalSessionToDisplay && (
                        <div className="text-center py-6 px-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                             <h2 className="text-xl font-bold font-headline mt-2">Treino Concluído</h2>
                            <p className="text-muted-foreground mt-1">Este plano de treino foi marcado como concluído pelo seu treinador e não pode ser mais executado.</p>
                        </div>
                    )}
                    
                    <section className="space-y-6">
                         {workout.description && (
                            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                            <p>{workout.description}</p>
                            </div>
                        )}

                         {workout.diet_plan && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h3 className="font-headline font-semibold mb-2">Plano de Dieta Sugerido</h3>
                                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                <p>{workout.diet_plan}</p>
                                </div>
                            </div>
                        )}

                         <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Exercícios</h2>
                            <div className="space-y-4">
                            {!finalSessionToDisplay && workout.status === 'active' ? (
                                <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">Clique em "Iniciar Treino" para começar a registrar seu progresso.</p>
                                </div>
                            ) : finalSessionToDisplay ? (
                                (workout.exercises as any[]).map((exercise, index) => {
                                    const isCompleted = finalSessionToDisplay?.completed_exercises?.includes(exercise.exercise_id) ?? false;
                                    return (
                                        <div key={index} className={cn("flex gap-4 items-start p-4 border rounded-lg transition-colors", isCompleted ? "bg-green-500/10 border-green-500/20" : "")}>
                                            <div className="mt-1 no-print">
                                                <ExerciseCheck sessionId={finalSessionToDisplay.id} exerciseId={exercise.exercise_id} isCompleted={isCompleted} disabled={!!isWorkoutFinished} />
                                            </div>
                                             <div className="flex-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="font-bold text-lg font-headline">{exercise.name}</h3>
                                                    {exercise.video_url && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" className="flex items-center gap-2 no-print">
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
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                    <div><strong className="block text-muted-foreground">Séries</strong> {exercise.sets || '-'}</div>
                                                    <div><strong className="block text-muted-foreground">Reps</strong> {exercise.reps || '-'}</div>
                                                    <div><strong className="block text-muted-foreground">Carga</strong> {exercise.load ? `${exercise.load} kg` : '-'}</div>
                                                    <div><strong className="block text-muted-foreground">Descanso</strong> {exercise.rest ? `${exercise.rest} s` : '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                 <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">Este treino foi concluído e arquivado.</p>
                                </div>
                            )}
                            </div>
                        </div>

                        {finalSessionToDisplay && !isWorkoutFinished && (
                            <div className="flex justify-center mt-8 no-print">
                                <Button size="lg" className="ripple" onClick={handleFinishWorkout} disabled={isFinishing}>
                                    {isFinishing && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Finalizar Treino
                                </Button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}
