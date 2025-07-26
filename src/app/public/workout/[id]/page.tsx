
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workout, WorkoutExercise } from "@/lib/definitions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
        return <p className="text-center text-red-500">URL do vídeo do YouTube inválida ou não fornecida.</p>
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
            className="rounded-lg"
        ></iframe>
    );
};


async function getWorkoutForPublic(workoutId: string) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .select('*, students(id, name)')
            .eq('id', workoutId)
            .single();

        if (workoutError || !workoutData) {
            console.error("[ Server ] Error fetching workout:", workoutError);
            return null;
        }

        const exerciseIds = workoutData.exercises.map((e: WorkoutExercise) => e.exercise_id);

        const { data: exercisesDetails, error: exercisesError } = await supabase
            .from('exercises')
            .select('id, video_url')
            .in('id', exerciseIds);

        if (exercisesError) {
            console.error("[ Server ] Error fetching exercise details:", exercisesError);
            // We can still proceed without video urls
        }

        // Create a map for quick lookup
        const videoUrlMap = new Map(exercisesDetails?.map(e => [e.id, e.video_url]));

        // Combine workout data with exercise video urls
        const combinedWorkout = {
            ...workoutData,
            exercises: workoutData.exercises.map((e: WorkoutExercise) => ({
                ...e,
                video_url: videoUrlMap.get(e.exercise_id) || null
            }))
        };
        
        return combinedWorkout as Workout;
    } catch (e) {
        console.error("[ Server ] Exception in getWorkoutForPublic", e);
        return null;
    }
}


async function verifyPassword(formData: FormData) {
    "use server"
    const password = formData.get("password") as string;
    const workoutId = formData.get("workoutId") as string;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase
      .from('workouts')
      .select('access_password')
      .eq('id', workoutId)
      .single();

    if (error || !data) {
      return { success: false, message: 'Treino não encontrado.' };
    }
    
    if (data.access_password === password) {
        return { success: true, message: 'Acesso liberado!' };
    } else {
        return { success: false, message: 'Senha incorreta.' };
    }
}

export default async function PublicWorkoutPage({ 
    params,
    searchParams 
}: { 
    params: { id: string };
    searchParams: { token?: string; error?: string };
}) {
    const workout = await getWorkoutForPublic(params.id);
    
    if (!workout) {
        notFound();
    }
    
    // If workout has no password, grant access immediately
    const hasPassword = !!workout.access_password;
    const isVerified = searchParams.token === workout.access_password;

    if (hasPassword && !isVerified) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-sm">
                    <form action={`/public/workout/${params.id}?token=${workout.access_password}`} method="POST">
                         <CardHeader>
                            <CardTitle className="text-xl font-headline flex items-center gap-2"><Lock className="text-primary"/> Acesso Restrito</CardTitle>
                            <CardDescription>
                                Este treino é protegido por senha. Por favor, insira a senha fornecida pelo seu personal trainer.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {searchParams.error && <p className="text-sm font-medium text-destructive">{searchParams.error}</p>}
                             <div className="space-y-2">
                                <Label htmlFor="password">Senha de Acesso</Label>
                                <Input id="password" name="password" type="password" required />
                             </div>
                             <Button type="submit" className="w-full ripple">Acessar Treino</Button>
                        </CardContent>
                    </form>
                </Card>
            </div>
        )
    }

    return (
        <main className="bg-background text-foreground p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Aluno: <span className="font-semibold">{workout.students?.name ?? 'Não especificado'}</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">Plano de Treino</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         {workout.description && (
                            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                               <p>{workout.description}</p>
                            </div>
                        )}

                        {workout.diet_plan && (
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                                 <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                   <p>{workout.diet_plan}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-4"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                            <div className="space-y-4">
                                {(workout.exercises as WorkoutExercise[]).map((exercise, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-lg font-headline">{exercise.name}</CardTitle>
                                                {exercise.video_url && (
                                                     <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                                <Video className="h-4 w-4" />
                                                                Ver Vídeo
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
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
                                                    <p className="font-semibold text-muted-foreground">Séries</p>
                                                    <p className="text-lg font-bold">{exercise.sets || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-muted-foreground">Repetições</p>
                                                    <p className="text-lg font-bold">{exercise.reps || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-muted-foreground">Carga</p>
                                                    <p className="text-lg font-bold">{exercise.load ? `${exercise.load} kg` : '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-muted-foreground">Descanso</p>
                                                    <p className="text-lg font-bold">{exercise.rest ? `${exercise.rest} s` : '-'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <footer className="text-center mt-8">
                    <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} FitFlow. Potencializado para seu sucesso.</p>
                </footer>
            </div>
        </main>
    );
}

// Rota para tratar o POST da senha e redirecionar
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const formData = await request.formData();
    const password = formData.get("password") as string;
    const workoutId = params.id;
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase
      .from('workouts')
      .select('access_password')
      .eq('id', workoutId)
      .single();

    const redirectUrl = new URL(request.url);

    if (error || !data || data.access_password !== password) {
        redirectUrl.searchParams.set('error', 'Senha incorreta. Tente novamente.');
        return Response.redirect(redirectUrl, 303);
    }
    
    // Se a senha estiver correta, redirecionamos para a mesma página, mas com um "token" de sucesso.
    redirectUrl.searchParams.set('token', data.access_password);
    redirectUrl.searchParams.delete('error');
    return Response.redirect(redirectUrl, 303);
}
