"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Exercise } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ExerciseForm from "@/components/exercises/exercise-form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExerciseCard, ExerciseTableRow, ExerciseTableHeader } from "@/components/exercises/exercise-list-components";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getExercises = async () => {
      setIsLoading(true);
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("trainer_id", trainer.id)
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao buscar exercícios:", error);
      } else {
        setExercises(data as Exercise[]);
        setFilteredExercises(data as Exercise[]);
      }
      setIsLoading(false);
    };

    getExercises();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = exercises.filter((item) => {
      return item.name.toLowerCase().includes(lowercasedFilter) ||
        (item.muscle_groups as string[])?.join(' ').toLowerCase().includes(lowercasedFilter) ||
        item.equipment?.toLowerCase().includes(lowercasedFilter);
    });
    setFilteredExercises(filteredData);
  }, [searchTerm, exercises]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Biblioteca de Exercícios</h1>
          <p className="text-muted-foreground">Consulte e gerencie seus exercícios para montar os treinos.</p>
        </div>
        <ExerciseForm>
          <Button className="ripple">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Exercício
          </Button>
        </ExerciseForm>
      </div>

      <div className="rounded-md border bg-card">
        <div className="p-4">
          <Input
            placeholder="Filtrar por nome, músculo..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden">
              {filteredExercises.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredExercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} />)}
                </div>
              ) : (
                <p className="p-4 text-center text-muted-foreground">Nenhum exercício encontrado.</p>
              )}
            </div>
            {/* Desktop View */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <ExerciseTableHeader />
                <tbody className="divide-y divide-border">
                  {filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise) => <ExerciseTableRow key={exercise.id} exercise={exercise} />)
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        Nenhum exercício encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
