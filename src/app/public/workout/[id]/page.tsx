import { createServerClient } from "@supabase/ssr";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Utensils, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Workout } from "@/lib/definitions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

async function getWorkoutForPublic(workoutId: string) {
    // This function must use service_role key to bypass RLS for a public page.
    // Ensure this key is set in your environment variables.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
        { cookies: () => ({}) } // We don't need cookies for service_role client
    );

    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name)')
        .eq('id', workoutId)
        .single();
    
    if (error || !data) {
        console.error("Error fetching workout for public page:", error);
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


function WorkoutView({ workout }: { workout: Workout }) {
   return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-background font-body">
        <Card className="shadow-lg">
             <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                        <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2">
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{workout.students?.name ?? 'Aluno não especificado'}</span>
                            </span>
                            <span className="flex items-center gap-2 text-sm text-muted-foreground mt-1 sm:mt-0">
                                <Calendar className="h-4 w-4" />
                                Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 {workout.description && (
                    <div className="prose prose-sm max-w-none text-muted-foreground mb-6 whitespace-pre-wrap">
                        <p>{workout.description}</p>
                    </div>
                )}

                {workout.diet_plan && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
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
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-headline flex items-center gap-2">
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
                    ))}
                </div>
            </CardContent>
        </Card>
        <footer className="text-center mt-8">
            <p className="text-xs text-muted-foreground">Potencializado por FitFlow</p>
        </footer>
      </div>
   )
}

function PasswordForm({ workoutId, error }: { workoutId: string, error?: string }) {
    
    const verifyPassword = async (formData: FormData) => {
        "use server";
        const password = formData.get("password") as string;
        const workout = await getWorkoutForPublic(workoutId);

        if (workout && workout.access_password === password) {
            return redirect(`/public/workout/${workoutId}?verified=true`);
        } else {
            return redirect(`/public/workout/${workoutId}?error=Senha incorreta`);
        }
    }

    return (
         <div className="flex items-center justify-center min-h-screen bg-muted">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center font-headline">Acesso ao Plano de Treino</CardTitle>
                    <CardDescription className="text-center">
                        Digite a senha fornecida pelo seu personal trainer para visualizar o plano.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 text-center text-sm text-destructive-foreground bg-destructive rounded-md">
                            {error}
                        </div>
                    )}
                    <form action={verifyPassword} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha de Acesso</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <SubmitButton className="w-full ripple">
                            Acessar Treino
                        </SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}


export default async function PublicWorkoutPage({ params, searchParams }: { params: { id: string }, searchParams: { verified?: string, error?: string } }) {
    const workoutId = params.id;
    const workout = await getWorkoutForPublic(workoutId);

    if (!workout) {
        notFound();
    }

    // Se o treino não tem senha, mostra direto
    if (!workout.access_password) {
        return <WorkoutView workout={workout} />;
    }

    // Se tem senha, verifica se já foi validada
    const isVerified = searchParams.verified === 'true';

    if (isVerified) {
         // Valida a senha novamente no servidor para segurança
        const verifiedWorkout = await getWorkoutForPublic(workoutId);
        if(verifiedWorkout?.id === workoutId) {
             return <WorkoutView workout={workout} />;
        }
    }
    
    // Se tem senha e não foi validada, mostra o formulário
    return <PasswordForm workoutId={workoutId} error={searchParams.error} />;
}
