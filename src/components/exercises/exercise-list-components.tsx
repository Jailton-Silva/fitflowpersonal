
"use client";

import { Exercise } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import ExerciseForm from "./exercise-form";

// Action for Deleting an Exercise
async function deleteExercise(exerciseId: string, onComplete: () => void, onError: (error: any) => void) {
  const supabase = createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", exerciseId);
  if (error) {
    onError(error);
  } else {
    onComplete();
  }
}

function DeleteExerciseAction({ exerciseId }: { exerciseId: string }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = () => {
    deleteExercise(
      exerciseId,
      () => {
        toast({ title: "Sucesso!", description: "Exercício excluído com sucesso." });
        router.refresh();
      },
      (error) => {
        toast({ title: "Erro ao excluir exercício", description: error.message, variant: "destructive" });
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onSelect={(e) => e.preventDefault()}
        >
          Excluir
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o
            exercício da sua biblioteca.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Sim, excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Reusable Actions Dropdown
function ExerciseActions({ exercise }: { exercise: Exercise }) {
  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <ExerciseForm exercise={exercise}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Editar
            </DropdownMenuItem>
          </ExerciseForm>
          <DropdownMenuSeparator />
          <DeleteExerciseAction exerciseId={exercise.id} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Component for Mobile Card View
export function ExerciseCard({ exercise }: { exercise: Exercise }) {
    return (
        <div className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <p className="font-medium text-primary pr-4">{exercise.name}</p>
                <ExerciseActions exercise={exercise} />
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <strong className="font-medium text-foreground block">Equipamento</strong>
                  {exercise.equipment || 'N/A'}
                </div>
                <div>
                  <strong className="font-medium text-foreground block">Grupos Musculares</strong>
                   <div className="flex flex-wrap gap-1 mt-1">
                      {(exercise.muscle_groups as string[])?.length > 0 ? (
                        (exercise.muscle_groups as string[]).map((group, index) => (
                          <Badge key={index} variant="secondary">{group}</Badge>
                        ))
                      ) : 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Component for Desktop Table Row
export function ExerciseTableRow({ exercise }: { exercise: Exercise }) {
  return (
    <tr className="hover:bg-muted/50">
      <td className="p-4 font-medium">{exercise.name}</td>
      <td className="p-4 text-muted-foreground">
         <div className="flex flex-wrap gap-1">
          {(exercise.muscle_groups as string[])?.map((group, index) => (
            <Badge key={index} variant="secondary">{group}</Badge>
          ))}
        </div>
      </td>
      <td className="p-4 text-muted-foreground">{exercise.equipment || '-'}</td>
      <td className="p-4 text-right">
        <ExerciseActions exercise={exercise} />
      </td>
    </tr>
  );
}

// Component for Desktop Table Header
export function ExerciseTableHeader() {
  return (
    <thead className="border-b">
      <tr className="text-left text-muted-foreground">
        <th className="p-4 font-medium w-2/5">Nome</th>
        <th className="p-4 font-medium w-2/5">Grupos Musculares</th>
        <th className="p-4 font-medium w-1/5">Equipamento</th>
        <th className="p-4 font-medium text-right">Ações</th>
      </tr>
    </thead>
  );
}
