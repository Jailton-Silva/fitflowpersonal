
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useTransition } from "react";
import { Dumbbell, User, Trophy, Share2, Video, Printer, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Workout, WorkoutSession } from "@/lib/definitions";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { ThemeToggle } from "@/components/theme-toggle";
import { updateCompletedExercises } from "@/app/public/workout/[id]/actions";
import { cn } from "@/lib/utils";


async function getWorkoutSession(workoutId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser(); // This is a client component, but let's assume it's for a logged in user if applicable
    
    // In a public page, we might not have a user. Let's adjust logic.
    // For a public page, we need a way to track a session. We can use localStorage or create a session and store its ID.
    // For simplicity, let's try to find an *active* session for this workout.
    const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('workout_id', workoutId)
        .is('completed_at', null) // Find an incomplete session
        .order('started_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore 'exact one row' error
        console.error("Error fetching session:", error);
    }
    return data as WorkoutSession | null;
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


export default function PublicWorkoutView({ workout, initialIsAuthorized }: { workout: Workout, initialIsAuthorized: boolean }) {
    const [isAuthorized, setIsAuthorized] = useState(initialIsAuthorized);
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (isAuthorized) {
            setLoading(true);
            getWorkoutSession(workout.id).then(sessionData => {
                setSession(sessionData);
                setLoading(false);
            });
        } else {
             setLoading(false);
        }
    }, [isAuthorized, workout.id]);


    const handleStartWorkout = async () => {
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
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link Copiado!",
            description: "O link de compartilhamento do treino foi copiado para a área de transferência.",
        });
    };

    if (loading) {
         return (
             <div className="flex flex-col min-h-screen bg-muted p-4 sm:p-8">
                <Skeleton className="max-w-4xl mx-auto w-full h-96" />
             </div>
        )
    }

    if (!isAuthorized) {
        return <WorkoutPasswordForm workoutId={workout.id} />;
    }

    const allExercisesCompleted = session && session.completed_at;

    return (
        <div className="flex flex-col min-h-screen bg-muted" id="printable-area">
            <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 no-print">
                <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow</h1>
                    </div>
                     <div className="flex items-center gap-2">
                         <ThemeToggle />
                        <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-lg p-6 sm:p-8">
                    {allExercisesCompleted ? (
                        <div className="text-center py-12">
                            <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
                            <h2 className="text-3xl font-bold font-headline mt-4">Parabéns!</h2>
                            <p className="text-muted-foreground mt-2">Você concluiu todos os exercícios deste treino. Ótimo trabalho!</p>
                             <p className="text-sm text-muted-foreground mt-1">Finalizado em: {format(new Date(session.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                            <Button asChild className="mt-6">
                                <Link href="/dashboard">Voltar ao Início</Link>
                            </Button>
                        </div>
                    ) : (
                    <>
                        <header className="mb-8">
                             <div className="flex justify-between items-start">
                                <div>
                                    <Badge>Plano de Treino</Badge>
                                    <h1 className="text-3xl sm:text-4xl font-bold font-headline mt-2">{workout.name}</h1>
                                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>{workout.students?.name}</span>
                                        </div>
                                         <span className="text-sm">Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                                    </div>
                                </div>
                                {!session && (
                                     <Button onClick={handleStartWorkout} className="ripple">Iniciar Treino</Button>
                                )}
                            </div>
                        </header>

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
                                {(workout.exercises as any[]).map((exercise, index) => {
                                    const isCompleted = session?.completed_exercises?.includes(exercise.exercise_id) ?? false;
                                    return (
                                        <div key={index} className={cn("flex gap-4 items-start p-4 border rounded-lg transition-colors", isCompleted ? "bg-green-500/10 border-green-500/20" : "")}>
                                            {session && (
                                                <div className="mt-1">
                                                    <ExerciseCheck sessionId={session.id} exerciseId={exercise.exercise_id} isCompleted={isCompleted} />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="font-bold text-lg font-headline">{exercise.name}</h3>
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
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                     <div><strong className="block text-muted-foreground">Séries</strong> {exercise.sets || '-'}</div>
                                                     <div><strong className="block text-muted-foreground">Reps</strong> {exercise.reps || '-'}</div>
                                                     <div><strong className="block text-muted-foreground">Carga</strong> {exercise.load ? `${exercise.load} kg` : '-'}</div>
                                                     <div><strong className="block text-muted-foreground">Descanso</strong> {exercise.rest ? `${exercise.rest} s` : '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                </div>
                            </div>
                        </section>
                    </>
                    )}
                </div>
            </main>

            <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}
