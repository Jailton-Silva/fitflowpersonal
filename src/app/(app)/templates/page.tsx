
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Workout } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dumbbell, MoreVertical, Edit, Trash2, Copy } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Server actions need to be defined separately or imported
async function deleteWorkout(workoutId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
    return { error };
}


function DeleteTemplateAction({ workoutId, onDeleted }: { workoutId: string, onDeleted: () => void }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    const { error } = await deleteWorkout(workoutId);

    if (error) {
      toast({
        title: "Erro ao excluir template",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Template excluído.",
      });
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
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o template.
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


function TemplateCardActions({ workout, onDeleted }: { workout: Workout, onDeleted: () => void }) {
    const router = useRouter();
    const { toast } = useToast();

    const createWorkoutFromTemplate = () => {
        router.push(`/workouts/new?template_id=${workout.id}`);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={createWorkoutFromTemplate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Usar Template
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/templates/${workout.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Link>
                </DropdownMenuItem>
                <DeleteTemplateAction workoutId={workout.id} onDeleted={onDeleted} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function TemplatesPage() {
    const [templates, setTemplates] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTemplates = async () => {
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
        
        let { data, error } = await supabase
            .from("workouts")
            .select("*")
            .eq("trainer_id", trainer.id)
            .is('student_id', null)
            .order("created_at", { descending: true });

        if (error) {
            console.error("Erro ao buscar templates:", error);
            data = [];
        }

        setTemplates(data as Workout[]);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchTemplates();
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold font-headline">Templates de Treino</h1>
                    <p className="text-muted-foreground">Crie e gerencie seus modelos de treino para agilizar a criação de planos.</p>
                </div>
                <Button asChild className="ripple">
                <Link href="/templates/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Template
                </Link>
                </Button>
            </div>
            
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-52 w-full" />
                    <Skeleton className="h-52 w-full" />
                    <Skeleton className="h-52 w-full" />
                </div>
            ) : templates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template: Workout) => (
                    <Card key={template.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{template.name}</CardTitle>
                            <TemplateCardActions workout={template} onDeleted={fetchTemplates}/>
                        </div>
                        <CardDescription>
                            Modelo de treino reutilizável
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-2">
                        <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                            {template.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                        <Dumbbell className="mr-2 h-4 w-4" />
                        <span>
                            {(template.exercises as any[]).length} exercício
                            {(template.exercises as any[]).length !== 1 ? "s" : ""}
                        </span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`/templates/${template.id}/edit`}>Ver/Editar</Link>
                        </Button>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">Nenhum Template Encontrado</h2>
                <p className="text-muted-foreground mt-2">
                   Crie seu primeiro template para agilizar seu trabalho.
                </p>
                <Button asChild className="mt-4 ripple">
                    <Link href="/templates/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Template
                    </Link>
                </Button>
                </div>
            )}
        </div>
    )
}

export default function TemplatesPageWrapper() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <TemplatesPage />
        </Suspense>
    )
}
