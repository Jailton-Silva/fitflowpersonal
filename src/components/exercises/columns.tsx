"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
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
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React from "react";
import ExerciseForm from "./exercise-form";


async function deleteExercise(exerciseId: string, onComplete: () => void, onError: (error: any) => void) {
  const supabase = createClient();
  // First, check if user is the owner. This is an extra layer of security.
  // RLS should be the primary security mechanism.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      onError(new Error("Usuário não autenticado."));
      return;
  }
   const { data: trainer } = await supabase.from("trainers").select('id').eq('user_id', user.id).single();
    if (!trainer) {
        onError(new Error("Treinador não encontrado."));
        return;
    }

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId)
    .eq("trainer_id", trainer.id); // Security check

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
        toast({
          title: "Sucesso!",
          description: "Exercício excluído com sucesso.",
        });
        router.refresh();
      },
      (error) => {
         toast({
          title: "Erro ao excluir exercício",
          description: "Apenas o criador do exercício pode excluí-lo. " + error.message,
          variant: "destructive",
        });
      }
    )
  }

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
            Sim, excluir exercício
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export const columns: ColumnDef<Exercise>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
     cell: ({ row }) => {
        return <div className="pl-4 font-medium">{row.getValue("name")}</div>
     },
  },
  {
    accessorKey: "muscle_groups",
    header: "Grupos Musculares",
    cell: ({ row }) => {
      const groups = row.getValue("muscle_groups") as string[];
      if (!groups || groups.length === 0) return <div className="text-muted-foreground">-</div>;
      return (
        <div className="flex flex-wrap gap-1">
          {groups.map((group, index) => (
            <Badge key={index} variant="secondary">{group}</Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "equipment",
    header: "Equipamento",
     cell: ({ row }) => {
        const equipment = row.getValue("equipment") as string;
        return equipment || <div className="text-muted-foreground">-</div>;
     }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const exercise = row.original;

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
    },
  },
];
