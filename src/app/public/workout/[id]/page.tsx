
'use server';

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Dumbbell, User, Calendar, Utensils, Video } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { Workout } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

async function verifyPassword(formData: FormData) {
  const password = formData.get('password') as string;
  const workoutId = formData.get('workoutId') as string;

  if (!password || !workoutId) {
    return redirect(`/public/workout/${workoutId}?error=Senha é obrigatória`);
  }
  
  const supabase = createClient();
  const { data: workout, error } = await supabase
    .from('workouts')
    .select('access_password')
    .eq('id', workoutId)
    .single();

  if (error || !workout) {
    return redirect(`/public/workout/${workoutId}?error=Treino não encontrado`);
  }

  if (workout.access_password === password) {
    // Redirect with a success flag
    return redirect(`/public/workout/${workoutId}?verified=true`);
  } else {
    return redirect(`/public/workout/${workoutId}?error=Senha incorreta`);
  }
}

function getYoutubeEmbedUrl(url: string) {
    if (!url) return null;
    let videoId;
    if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else {
        return null;
    }
    return `https://www.youtube.com/embed/${videoId}`;
}


function WorkoutView({ workout, studentName }: { workout: Workout; studentName: string }) {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex items-center gap-4 mb-8">
        <Dumbbell className="h-10 w-10 text-primary" />
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline text-primary">FitFlow</h1>
            <p className="text-muted-foreground">Seu plano de treino personalizado</p>
        </div>
      </header>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-headline">{workout.name}</CardTitle>
              <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{studentName}</span>
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
        <CardContent className="space-y-6">
          {workout.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
              <p>{workout.description}</p>
            </div>
          )}

          {workout.diet_plan && (
            <div>
              <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Utensils className="h-5 w-5 text-primary" />Plano de Dieta</h3>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                <p>{workout.diet_plan}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
            {(workout.exercises as any[]).map((exercise, index) => {
                const videoUrl = getYoutubeEmbedUrl(exercise.video_url || '');
                return (
                    <Card key={index} className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center justify-between gap-2">
                            <span>{exercise.name}</span>
                             {videoUrl && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Video className="mr-2 h-4 w-4" /> Ver Vídeo
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>{exercise.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="aspect-video">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={videoUrl}
                                                title={`Vídeo do exercício ${exercise.name}`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded-lg"
                                            ></iframe>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardTitle>
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
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FitFlow. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}


function PasswordForm({ workoutId, error }: { workoutId: string; error?: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md mx-4">
                 <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center font-headline">Acesso ao Treino</CardTitle>
                    <CardDescription className="text-center">
                        Para ver este plano de treino, por favor, insira a senha fornecida pelo seu personal trainer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={verifyPassword} className="space-y-4">
                         {error && (
                            <div className="p-3 text-center text-sm text-destructive-foreground bg-destructive rounded-md">
                                {error}
                            </div>
                        )}
                        <input type="hidden" name="workoutId" value={workoutId} />
                        <div className="space-y-2">
                           <Input name="password" type="password" placeholder="********" required className="text-center" />
                        </div>
                        <SubmitButton className="w-full ripple">Acessar Treino</SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default async function PublicWorkoutPage({ params, searchParams }: { params: { id: string }, searchParams: { error?: string, verified?: string } }) {
    const supabase = createClient();
    const workoutId = params.id;
    const { data: workoutWithoutStudent, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
    
    if (workoutError || !workoutWithoutStudent) {
        notFound();
    }
    
    const needsPassword = !!workoutWithoutStudent.access_password;
    const isVerified = searchParams.verified === 'true';

    // If it doesn't need a password, or if it does and is verified
    if (!needsPassword || isVerified) {
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('name')
            .eq('id', workoutWithoutStudent.student_id)
            .single();
        
        if (studentError) {
             return <div>Erro ao carregar dados do aluno.</div>
        }
        
        const completeWorkout: Workout = {
            ...workoutWithoutStudent,
            students: {
                id: workoutWithoutStudent.student_id,
                name: student.name,
            }
        };
        
        return <WorkoutView workout={completeWorkout} studentName={student.name} />;
    }

    // If it needs a password and is not verified, show password form
    return <PasswordForm workoutId={workoutId} error={searchParams.error} />;
}
