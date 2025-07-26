import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Video, Lock } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createServerClient } from "@supabase/ssr";

async function getWorkoutDetails(workoutId: string) {
    // This needs a service role key or RLS bypass to fetch data in a server component for a public page
    // For now, we'll create a new client instance.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: () => undefined,
                set: () => { },
                remove: () => { },
            }
        }
    );
    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name, avatar_url)')
        .eq('id', workoutId)
        .single();
    
    return { data, error };
}

async function verifyPassword(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    const workoutId = formData.get("workoutId") as string;

    const { data: workout } = await getWorkoutDetails(workoutId);

    if (workout && (!workout.access_password || workout.access_password === password)) {
        redirect(`/public/workout/${workoutId}?verified=true`);
    } else {
        redirect(`/public/workout/${workoutId}?error=Senha incorreta`);
    }
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

const WorkoutView = ({ workout }: { workout: any }) => (
    <div className="bg-background min-h-screen">
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="mb-2">Plano de Treino</Badge>
                            <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{workout.students?.name}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                            </CardDescription>
                        </div>
                        <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {workout.description && (
                        <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                           <p>{workout.description}</p>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <h3 className="text-xl font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
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
                                        <div><p className="font-semibold">Séries</p><p>{exercise.sets || '-'}</p></div>
                                        <div><p className="font-semibold">Repetições</p><p>{exercise.reps || '-'}</p></div>
                                        <div><p className="font-semibold">Carga</p><p>{exercise.load ? `${exercise.load} kg` : '-'}</p></div>
                                        <div><p className="font-semibold">Descanso</p><p>{exercise.rest ? `${exercise.rest} s` : '-'}</p></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
        <footer className="text-center p-4 text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} FitFlow. Treino fornecido por seu personal trainer.</p>
        </footer>
    </div>
);

const PasswordForm = ({ workoutId, error }: { workoutId: string, error?: string }) => (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-center font-headline">Acesso Restrito</CardTitle>
                <CardDescription className="text-center">
                    Este treino é protegido por senha. Por favor, insira a senha fornecida pelo seu treinador.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-2 text-center text-sm text-destructive-foreground bg-destructive rounded-md">
                        {error}
                    </div>
                )}
                <form action={verifyPassword} className="space-y-4">
                    <Input name="password" type="password" placeholder="********" required />
                    <Input name="workoutId" type="hidden" value={workoutId} />
                    <Button type="submit" className="w-full ripple">Acessar Treino</Button>
                </form>
            </CardContent>
        </Card>
    </div>
);

export default async function PublicWorkoutPage({ 
    params,
    searchParams
}: { 
    params: { id: string },
    searchParams: { verified?: string, error?: string } 
}) {
    if (!params.id) {
        notFound();
    }
    
    const { data: workout, error } = await getWorkoutDetails(params.id);

    if (error || !workout) {
        notFound();
    }
    
    // Se o treino não tiver senha, ou se a senha já foi verificada, mostre o treino.
    if (!workout.access_password || searchParams.verified === 'true') {
        return <WorkoutView workout={workout} />;
    }

    // Caso contrário, mostre o formulário de senha.
    return <PasswordForm workoutId={params.id} error={searchParams.error} />;
}
