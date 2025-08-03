
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Share2, MoreVertical, Trash2, EyeOff, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Workout } from "@/lib/definitions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type WorkoutDetailClientProps = {
    workout: Workout;
}

async function updateWorkoutStatus(workoutId: string, status: 'active' | 'inactive') {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").update({ status }).eq("id", workoutId);
    return { error };
}

async function deleteWorkout(workoutId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
    return { error };
}


function ToggleStatusAction({ workout, as = "button" }: { workout: Workout, as?: "button" | "menuitem" }) {
  const { toast } = useToast();
  const router = useRouter();
  const newStatus = workout.status === 'active' ? 'inactive' : 'active';
  const newStatusText = newStatus === 'active' ? 'Ativar' : 'Desativar';

  const handleToggle = async () => {
    const { error } = await updateWorkoutStatus(workout.id, newStatus);
    if (error) {
      toast({
        title: `Erro ao ${newStatusText} treino`,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: `Plano de treino foi definido como ${newStatus === 'active' ? 'Ativo' : 'Inativo'}.`,
      });
      router.refresh();
    }
  };
  
  const content = (
    <>
      {newStatus === 'active' ? (
        <Eye className="mr-2 h-4 w-4" />
      ) : (
        <EyeOff className="mr-2 h-4 w-4" />
      )}
      <span>{newStatusText}</span>
    </>
  );

  if (as === "menuitem") {
    return <DropdownMenuItem onClick={handleToggle}>{content}</DropdownMenuItem>
  }

  return (
    <Button variant="outline" onClick={handleToggle}>
      {content}
    </Button>
  );
}


function DeleteWorkoutAction({ workoutId, as = "button" }: { workoutId: string, as?: "button" | "menuitem" }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    const { error } = await deleteWorkout(workoutId);

    if (error) {
      toast({
        title: "Erro ao excluir treino",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Plano de treino excluído.",
      });
      router.push('/workouts');
      router.refresh();
    }
  };
  
  const trigger = as === 'menuitem' ? (
    <DropdownMenuItem
        className="text-destructive focus:text-destructive focus:bg-destructive/10"
        onSelect={(e) => e.preventDefault()}
    >
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir Treino
    </DropdownMenuItem>
   ) : (
     <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir
     </Button>
   );


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o
            plano de treino e todos os seus dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
          >
            Sim, excluir treino
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


function WorkoutDetailClient({ workout }: WorkoutDetailClientProps) {
    const { toast } = useToast();

    const handleShare = () => {
        // Ensure this code runs only in the browser
        if (typeof window !== 'undefined') {
            const url = `${window.location.origin}/public/workout/${workout.id}`;
            navigator.clipboard.writeText(url);
            toast({
                title: "Link Copiado!",
                description: "O link de compartilhamento do treino foi copiado para a área de transferência.",
            });
        }
    }
    
    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
            </Button>
            <Button asChild className="ripple">
                <Link href={`/workouts/${workout.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <ToggleStatusAction workout={workout} as="menuitem" />
                    <DropdownMenuSeparator />
                    <DeleteWorkoutAction workoutId={workout.id} as="menuitem" />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}


WorkoutDetailClient.ToggleStatusAction = ToggleStatusAction;
WorkoutDetailClient.DeleteWorkoutAction = DeleteWorkoutAction;

export default WorkoutDetailClient;
