
import { createClient } from "@supabase/ssr";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cookies } from "next/headers";


// This function will run on the server and has access to environment variables
async function getWorkoutForPublic(workoutId: string, supabaseUrl: string, supabaseKey: string) {
  // We must create a new client here because this is a public route
  // and we don't have the user's auth context.
  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get: (name: string) => {
            const cookieStore = cookies();
            return cookieStore.get(name)?.value
        }
      }
    }
  );
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*, students(id, name)')
    .eq('id', workoutId)
    .single();

  if (error || !data) {
    console.error("Error fetching public workout:", error);
    return null;
  }
  return data;
}

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
        return <p className="text-center text-sm text-muted-foreground">URL do vídeo inválida ou não fornecida.</p>
    }
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (!videoId) {
         return <p className="text-center text-sm text-muted-foreground">Não foi possível extrair o ID do vídeo.</p>
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
        <iframe
            width="100%"
            height="480"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
        ></iframe>
    );
};


const WorkoutView = ({ workout }: { workout: Awaited<ReturnType<typeof getWorkoutForPublic>> }) => {
    if (!workout) {
        notFound();
    }
    return (
         <div className="flex flex-col min-h-screen bg-muted">
            <header className="p-4 bg-background shadow-sm">
                 <div className="container mx-auto flex items-center gap-3">
                    <Dumbbell className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold font-headline text-foreground">{workout.name}</h1>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{workout.students?.name ?? 'Aluno não atribuído'}</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {workout.description && (
                            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                               <p>{workout.description}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            {(workout.exercises as any[]).map((exercise, index) => (
                                <Card key={index} className="bg-background">
                                    <CardHeader>
                                      <div className="flex justify-between items-center">
                                          <CardTitle className="text-lg font-headline">{exercise.name}</CardTitle>
                                           {exercise.video_url && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="flex items-center gap-2 ripple">
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
                                            <div><p className="font-semibold text-muted-foreground">Séries</p><p>{exercise.sets || '-'}</p></div>
                                            <div><p className="font-semibold text-muted-foreground">Repetições</p><p>{exercise.reps || '-'}</p></div>
                                            <div><p className="font-semibold text-muted-foreground">Carga</p><p>{exercise.load ? `${exercise.load} kg` : '-'}</p></div>
                                            <div><p className="font-semibold text-muted-foreground">Descanso</p><p>{exercise.rest ? `${exercise.rest} s` : '-'}</p></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
             <footer className="py-6 w-full text-center">
                <p className="text-xs text-muted-foreground">&copy; 2024 FitFlow. Powered by modern technology.</p>
            </footer>
        </div>
    )
}

const PasswordForm = ({ workoutId, error }: { workoutId: string, error?: string }) => {
    
    async function verifyPassword(formData: FormData) {
        'use server';
        const password = formData.get('password') as string;
        
        // This must run on the server to have access to env vars
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
             {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            }
        );

        const { data, error } = await supabase
            .from('workouts')
            .select('access_password')
            .eq('id', workoutId)
            .single();
        
        const redirectUrl = new URL(`/public/workout/${workoutId}`, process.env.NEXT_PUBLIC_BASE_URL);

        if (error || !data) {
            redirectUrl.searchParams.set("error", "Treino não encontrado.");
            return notFound();
        }

        if (data.access_password !== password) {
             redirectUrl.searchParams.set("error", "Senha incorreta. Tente novamente.");
        } else {
             redirectUrl.searchParams.set("verified", "true");
        }
        
        const { redirect } = await import('next/navigation');
        redirect(redirectUrl.toString());
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center font-headline">Acesso Restrito</CardTitle>
                    <CardDescription className="text-center">
                        Este treino é protegido por senha. Por favor, insira a senha para visualizar.
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
                            <Label htmlFor="password">Senha do Treino</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <SubmitButton className="w-full ripple">Acessar Treino</SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}


export default async function PublicWorkoutPage({ params, searchParams }: { params: { id: string }, searchParams: { verified?: string, error?: string } }) {
    // These env variables MUST be available here on the server component.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        // This will be caught by the error boundary and show a generic error page.
        throw new Error("Supabase URL or Key is not configured correctly.");
    }
    
    const workout = await getWorkoutForPublic(params.id, supabaseUrl, supabaseKey);

    if (!workout) {
        notFound();
    }
    
    // If workout has no password or if it's already verified, show the workout
    if (!workout.access_password || searchParams.verified === 'true') {
        return <WorkoutView workout={workout} />;
    }

    // Otherwise, show the password form
    return <PasswordForm workoutId={params.id} error={searchParams.error} />;
}
