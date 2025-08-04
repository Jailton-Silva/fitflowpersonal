
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Workout, Student, Exercise } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dumbbell, MoreVertical, Edit, Eye, EyeOff, Trash2, CheckCircle, XCircle, PlayCircle, StopCircle } from "lucide-react";
import { WorkoutFilters } from "@/components/workouts/workout-filters";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
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
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Server actions need to be defined separately or imported
async function updateWorkoutStatus(workoutId: string, status: Workout['status']) {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").update({ status }).eq("id", workoutId);
    return { error };
}

async function deleteWorkout(workoutId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
    return { error };
}


function StatusSelectorAction({ workout, onStatusChange }: { workout: Workout, onStatusChange: () => void }) {
  const { toast } = useToast();

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
      onStatusChange();
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

function DeleteWorkoutAction({ workoutId, onDeleted }: { workoutId: string, onDeleted: () => void }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    const { error } = await deleteWorkout(workoutId);
    if (error) {
      toast({ title: "Erro ao excluir treino", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Plano de treino excluído." });
      onDeleted();
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
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o plano de treino e todos os seus dados.
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


function WorkoutCardActions({ workout, onActionComplete }: { workout: Workout, onActionComplete: () => void }) {
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
                <StatusSelectorAction workout={workout} onStatusChange={onActionComplete} />
                <DropdownMenuSeparator />
                <DeleteWorkoutAction workoutId={workout.id} onDeleted={onActionComplete} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const statusMap: {[key: string]: {text: string, variant: "default" | "secondary" | "destructive" | "outline" | "success"}} = {
    'active': {text: 'Ativo', variant: 'success'},
    'not-started': {text: 'Não Iniciado', variant: 'secondary'},
    'completed': {text: 'Concluído', variant: 'default'},
    'inactive': {text: 'Inativo', variant: 'outline'},
}

function WorkoutsPage() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [students, setStudents] = useState<Pick<Student, 'id' | 'name'>[]>([]);
    const [exercises, setExercises] = useState<Pick<Exercise, 'id' | 'name'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();

    const fetchPageData = async () => {
        setIsLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsLoading(false);
            return;
        };

        const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
        if (!trainer) {
            setIsLoading(false);
            return;
        };

        // Fetch filters data
        const studentsPromise = supabase.from("students").select("id, name").eq("trainer_id", trainer.id).order('name');
        const exercisesPromise = supabase.from("exercises").select("id, name").eq("trainer_id", trainer.id).order('name');
        
        const [studentsResult, exercisesResult] = await Promise.all([studentsPromise, exercisesPromise]);
        setStudents(studentsResult.data ?? []);
        setExercises(exercisesResult.data ?? []);

        // Fetch workouts based on filters
        const studentId = searchParams.get('student');
        const exerciseIds = searchParams.getAll('exercises');
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const status = searchParams.get('status');

        let query = supabase
            .from("workouts")
            .select("*, students(id, name)")
            .eq("trainer_id", trainer.id)
            .not("student_id", "is", null)
            .order("created_at", { descending: true });

        if (studentId) query = query.eq('student_id', studentId);
        if (from) query = query.gte('created_at', from);
        if (to) query = query.lte('created_at', to);
        if (status && status !== 'all') query = query.eq('status', status);
        
        let { data, error } = await query;
        if (error) {
            console.error("Erro ao buscar treinos:", error);
            data = [];
        }
        
        let filteredWorkouts = data as Workout[];
        if (exerciseIds && exerciseIds.length > 0) {
            filteredWorkouts = filteredWorkouts.filter(workout => 
                exerciseIds.every(filterId => 
                    (workout.exercises as any[]).some(ex => ex.exercise_id === filterId)
                )
            );
        }

        setWorkouts(filteredWorkouts);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchPageData();
    }, [searchParams])

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
            
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-52 w-full" />
                    <Skeleton className="h-52 w-full" />
                    <Skeleton className="h-52 w-full" />
                </div>
            ) : workouts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workouts.map((workout: Workout) => (
                    <Card key={workout.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{workout.name}</CardTitle>
                            <WorkoutCardActions workout={workout} onActionComplete={fetchPageData} />
                        </div>
                        <CardDescription>
                        Para: {workout.students?.name ?? "N/A"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-2">
                        <Badge variant={statusMap[workout.status]?.variant || 'secondary'}>
                            {statusMap[workout.status]?.text || 'Desconhecido'}
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

export default function WorkoutsPageWrapper() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <WorkoutsPage />
        </Suspense>
    )
}
