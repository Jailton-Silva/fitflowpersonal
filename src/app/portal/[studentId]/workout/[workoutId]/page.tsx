
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Repeat, Weight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Tipagem para os exercícios dentro do treino
// Adicionei campos que podem ser úteis como 'observation', 'rest_time', etc.
type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number | null;
  observation?: string | null;
  rest_time?: string | null;
};

async function getWorkoutData(studentId: string, workoutId: string) {
  const supabase = createClient();

  // Busca o treino específico, mas crucialmente, verifica se ele pertence ao studentId fornecido
  const { data: workout, error } = await supabase
    .from('workouts')
    .select(`
      *,
      students (name)
    `)
    .eq('id', workoutId)
    .eq('student_id', studentId) // Cláusula de segurança!
    .single();

  // Se não encontrar o treino ou der erro, retorna 404
  if (error || !workout) {
    notFound();
  }

  return workout;
}

export default async function WorkoutPortalPage({ params }: { params: { studentId: string; workoutId: string } }) {
  const workout = await getWorkoutData(params.studentId, params.workoutId);
  const exercises = workout.exercises as Exercise[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-6 shadow-md">
        <div className="container mx-auto">
          <p className="text-lg">Portal do Aluno</p>
          <h1 className="text-3xl font-bold font-headline">Plano de Treino</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">{workout.name}</CardTitle>
            <p className="text-muted-foreground">Treino para: {workout.students?.name || 'Aluno'}</p>
          </CardHeader>
          <CardContent>
            {workout.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground mb-4">
                <p>{workout.description}</p>
              </div>
            )}
            <div className="space-y-4">
              {exercises && exercises.length > 0 ? (
                exercises.map((exercise, index) => (
                  <Collapsible key={exercise.id || index} className="border rounded-lg">
                    <CollapsibleTrigger className="w-full flex justify-between items-center p-4">
                      <h3 className="font-semibold text-left">{exercise.name}</h3>
                      <span className="text-sm text-muted-foreground">Clique para expandir</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 border-t bg-muted/30">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div className="flex flex-col items-center p-2 bg-background rounded-md">
                                <span className="text-muted-foreground text-xs mb-1">Séries</span>
                                <span className="font-bold text-lg">{exercise.sets}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-background rounded-md">
                                <span className="text-muted-foreground text-xs mb-1">Reps</span>
                                <span className="font-bold text-lg">{exercise.reps}</span>
                            </div>
                             <div className="flex flex-col items-center p-2 bg-background rounded-md">
                                <span className="text-muted-foreground text-xs mb-1">Carga</span>
                                <span className="font-bold text-lg">{exercise.weight ? `${exercise.weight} kg` : '-'}</span>
                            </div>
                             <div className="flex flex-col items-center p-2 bg-background rounded-md">
                                <span className="text-muted-foreground text-xs mb-1">Descanso</span>
                                <span className="font-bold text-lg">{exercise.rest_time || '-'}</span>
                            </div>
                        </div>
                        {exercise.observation && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start">
                                    <Info className="h-5 w-5 mr-2 text-blue-500 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-sm">Observações:</h4>
                                        <p className="text-sm text-blue-800">{exercise.observation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CollapsibleContent>
                  </Collapsible>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum exercício encontrado neste plano.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
