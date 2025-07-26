
import { createServerClient } from "@supabase/ssr";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Utensils, Lock } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Helper function to create a Supabase client for public pages
// This ensures we use the anon key and don't rely on user auth
function createPublicSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}


async function getWorkoutDetails(workoutId: string) {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
        .from('workouts')
        .select(`
            *, 
            students (
                id,
                name
            )
        `)
        .eq('id', workoutId)
        .single();
    
    if (error) {
        console.error("Error fetching workout (public):", error);
        return null;
    }
    return data;
}

export default async function PublicWorkoutPage({ params, searchParams }: { params: { id: string }, searchParams: { message?: string } }) {
    const workout = await getWorkoutDetails(params.id);

    if (!workout) {
        notFound();
    }
    
    // Se o treino não tiver senha, exibe direto.
    if (!workout.access_password) {
        return <WorkoutDisplay workout={workout} />;
    }

    const verifyPassword = async (formData: FormData) => {
        "use server";
        const password = formData.get("password") as string;
        
        // Re-fetch workout details to be safe, could also pass from parent
        const supabase = createPublicSupabaseClient();
        const { data: workoutToVerify } = await supabase
            .from('workouts')
            .select('access_password')
            .eq('id', params.id)
            .single();

        if (workoutToVerify?.access_password === password) {
            // "Log in" the user to this session to view the workout
            cookies().set(`workout-auth-${params.id}`, 'true', { path: '/', httpOnly: true, sameSite: 'lax' });
        } else {
            return { error: "Senha incorreta. Por favor, tente novamente." };
        }
    }
    
    const cookieStore = cookies();
    const isAuthenticated = cookieStore.get(`workout-auth-${params.id}`);

    if (isAuthenticated?.value === 'true') {
        return <WorkoutDisplay workout={workout} />;
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-background p-4">
             <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Lock className="text-primary"/>
                        Acesso Restrito
                    </CardTitle>
                    <CardDescription>
                        Este plano de treino é protegido por senha. Por favor, insira a senha fornecida pelo seu treinador.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {searchParams.message && <p className="text-sm text-red-500 mb-4">{searchParams.message}</p>}
                    <form action={verifyPassword} className="space-y-4">
                        <Input
                            name="password"
                            type="password"
                            placeholder="Digite a senha de acesso"
                            required
                        />
                        <SubmitButton className="w-full ripple">
                            Acessar Treino
                        </SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

function WorkoutDisplay({ workout }: { workout: any }) {
  return (
    <main className="flex justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                             <span className="flex items-center gap-2">
                                <strong>Aluno(a):</strong>
                                <span>{workout.students?.name ?? 'Não especificado'}</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <strong>Data:</strong>
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
                
                <div className="space-y-4">
                    <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                    {workout.exercises.map((exercise: any, index: number) => (
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
                                {exercise.video_url && (
                                    <div className="mt-4">
                                        <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                            Ver vídeo de execução
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
        <footer className="text-center text-xs text-muted-foreground">
            <p>FitFlow &copy; {new Date().getFullYear()} - Seu parceiro de treino.</p>
        </footer>
      </div>
    </main>
  );
}
