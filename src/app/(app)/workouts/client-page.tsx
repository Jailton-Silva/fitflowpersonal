
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Workout, Student, Exercise } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Dumbbell, MoreVertical, Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { WorkoutFilters } from "@/components/workouts/workout-filters";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { deleteWorkout, updateWorkoutStatus } from "./actions";


function ToggleStatusAction({ workout }: { workout: Workout }) {
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
  
  return (
    <DropdownMenuItem onClick={handleToggle}>
      {newStatus === 'active' ? (
        <Eye className="mr-2 h-4 w-4" />
      ) : (
        <EyeOff className="mr-2 h-4 w-4" />
      )}
      <span>{newStatusText}</span>
    </DropdownMenuItem>
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
      router.refresh();
    }
  };
  
  const trigger = (
    <DropdownMenuItem
        className="text-destructive focus:text-destructive focus:bg-destructive/10"
        onSelect={(e) => e.preventDefault()}
    >
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir
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
            Sim, excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


function WorkoutCardActions({ workout }: { workout: Workout }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/workouts/${workout.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Link>
                </DropdownMenuItem>
                <ToggleStatusAction workout={workout} />
                <DropdownMenuSeparator />
                <DeleteWorkoutAction workoutId={workout.id} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


export default function WorkoutsClientPage({ 
    workouts, 
    students, 
    exercises 
}: { 
    workouts: Workout[], 
    students: Pick<Student, 'id' | 'name'>[],
    exercises: Pick<Exercise, 'id' | 'name'>[]
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold font-headline">Planos de Treino</h1>
                <Button asChild className="ripple">
                <Link href="/workouts/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Treino
                </Link>
                </Button>
            </div>
            
            <WorkoutFilters students={students} exercises={exercises} />
            
            {workouts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workouts.map((workout: Workout) => (
                    <Card key={workout.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{workout.name}</CardTitle>
                            <WorkoutCardActions workout={workout} />
                        </div>
                        <CardDescription>
                        Para: {workout.students?.name ?? "N/A"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-2">
                        <Badge variant={workout.status === 'active' ? 'default' : 'secondary'}>
                            {workout.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                        <Dumbbell className="mr-2 h-4 w-4" />
                        <span>
                            {(workout.exercises as any[]).length} exercício
                            {(workout.exercises as any[]).length !== 1 ? "s" : ""}
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
                <h2 className="text-xl font-semibold">Nenhum Treino Encontrado</h2>
                <p className="text-muted-foreground mt-2">
                    Tente ajustar seus filtros ou crie um novo plano de treino.
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
    )
}
