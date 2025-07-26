import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Workout } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Dumbbell } from "lucide-react";

async function getWorkouts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*, students(name)");
  
  if (error) {
    console.error("Erro ao buscar treinos:", error);
    return [];
  }
  return data;
}

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Planos de Treino</h1>
        <Button asChild className="ripple">
          <Link href="/workouts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Treino
          </Link>
        </Button>
      </div>
      {workouts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout: any) => (
            <Card key={workout.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription>
                  Para: {workout.students?.name ?? "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  <span>
                    {workout.exercises.length} exercício
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" asChild>
                    <Link href={`/workouts/${workout.id}`}>Ver Plano</Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Nenhum Treino Ainda</h2>
          <p className="text-muted-foreground mt-2">
            Comece criando um novo plano de treino.
          </p>
          <Button asChild className="mt-4 ripple">
            <Link href="/workouts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Treino
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
