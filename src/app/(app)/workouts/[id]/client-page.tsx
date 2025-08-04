
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Share2, MoreVertical, Trash2, Eye, EyeOff, CheckCircle, XCircle, PlayCircle, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Workout } from "@/lib/definitions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
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

type WorkoutDetailClientProps = {
    workout: Workout;
}

async function updateWorkoutStatus(workoutId: string, status: 'active' | 'inactive' | 'not-started' | 'completed') {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").update({ status }).eq("id", workoutId);
    return { error };
}

async function deleteWorkout(workoutId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
    return { error };
}


function StatusSelectorAction({ workout }: { workout: Workout }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusChange = async (newStatus: Workout['status']) => {
    const { error } = await updateWorkoutStatus(workout.id, newStatus);
    if (error) {
      toast({
        title: `Erro ao alterar status`,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: `Status do plano de treino foi alterado.`,
      });
      router.refresh();
    }
  };
  
  const statusOptions: {value: Workout['status'], label: string, icon: React.ReactNode}[] = [
      { value: 'not-started', label: 'Não Iniciado', icon: <PlayCircle className="mr-2 h-4 w-4" /> },
      { value: 'active', label: 'Ativo', icon: <Eye className="mr-2 h-4 w-4" /> },
      { value: 'completed', label: 'Concluído', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
      { value: 'inactive', label: 'Inativo', icon: <XCircle className="mr-2 h-4 w-4" /> },
  ]

  return (
    <DropdownMenuSub>
        <DropdownMenuSubTrigger>
            Alterar Status
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
            <DropdownMenuSubContent>
                {statusOptions.map(opt => (
                    <DropdownMenuItem key={opt.value} onClick={() => handleStatusChange(opt.value)}>
                        {opt.icon}
                        <span>{opt.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
        </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}


function DeleteWorkoutAction({ workoutId }: { workoutId: string }) {
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
  
  const trigger = (
    <DropdownMenuItem
        className="text-destructive focus:text-destructive focus:bg-destructive/10"
        onSelect={(e) => e.preventDefault()}
    >
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir Treino
    </DropdownMenuItem>
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


export default function WorkoutDetailClient({ workout }: WorkoutDetailClientProps) {
    const { toast } = useToast();

    const handleShare = () => {
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
                    <StatusSelectorAction workout={workout} />
                    <DropdownMenuSeparator />
                    <DeleteWorkoutAction workoutId={workout.id} />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
