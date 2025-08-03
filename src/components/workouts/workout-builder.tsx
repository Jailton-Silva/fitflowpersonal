
"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Student, Exercise, Workout } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2, Video, RefreshCw, Copy } from "lucide-react";
import { Textarea } from "../ui/textarea";
import AiAssistant from "./ai-assistant";
import { ExerciseRecommendationsOutput } from "@/ai/flows/exercise-recommendations";

const workoutSchema = z.object({
  name: z.string().min(3, "O nome do treino é obrigatório"),
  student_id: z.string().min(1, "Por favor, selecione um aluno"),
  description: z.string().optional(),
  diet_plan: z.string().optional(),
  access_password: z.string().optional(),
  exercises: z.array(
    z.object({
      exercise_id: z.string().optional(), // Becomes optional as we might have just the name
      name: z.string(),
      video_url: z.string().optional(),
      sets: z.string().optional(),
      reps: z.string().optional(),
      load: z.string().optional(),
      rest: z.string().optional(),
    })
  ),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

type WorkoutBuilderProps = {
  students: Pick<Student, 'id' | 'name'>[];
  exercises: Exercise[];
  workout?: Workout;
  defaultStudentId?: string;
};

export default function WorkoutBuilder({ students, exercises, workout, defaultStudentId }: WorkoutBuilderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      student_id: defaultStudentId || "",
      description: "",
      diet_plan: "",
      access_password: "",
      exercises: [],
    },
  });

  const isEditMode = !!workout;

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  useEffect(() => {
    if (isEditMode && workout) {
      form.reset({
        name: workout.name,
        student_id: workout.student_id,
        description: workout.description ?? "",
        diet_plan: workout.diet_plan ?? "",
        access_password: workout.access_password ?? "",
        exercises: (workout.exercises || []).map(e => ({
          ...e, 
          video_url: exercises.find(exDb => exDb.id === e.exercise_id)?.video_url || undefined 
        }))
      });
    } else {
        form.reset({
            name: "",
            student_id: defaultStudentId || "",
            description: "",
            diet_plan: "",
            access_password: "",
            exercises: [],
        });
    }
  }, [workout, isEditMode, defaultStudentId, form, exercises]);


  const onSubmit = async (values: WorkoutFormData) => {
    const supabase = createClient();
    
    let error;
    
    // Remove video_url from submission data as it's not a DB field
    const submissionData = {
        ...values,
        diet_plan: values.diet_plan || null,
        access_password: values.access_password || null,
        exercises: values.exercises.map(({ video_url, ...rest}) => rest),
    };

    if (isEditMode) {
      const { error: updateError } = await supabase
        .from("workouts")
        .update(submissionData)
        .eq("id", workout.id);
      error = updateError;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data: trainer } = await supabase
        .from("trainers")
        .select("id")
        .eq("user_id", user.id)
        .single();
        
      if (!trainer) return;

      const { error: insertError } = await supabase.from("workouts").insert([
        { ...submissionData, trainer_id: trainer.id }
      ]);
      error = insertError;
    }
    
    if (error) {
      toast({ title: `Erro ao ${isEditMode ? 'atualizar' : 'criar'} treino`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Plano de treino ${isEditMode ? 'atualizado' : 'criado'} com sucesso.` });
      router.push("/workouts");
      router.refresh();
    }
  };

  const addExercise = (exercise: Exercise) => {
    append({
      exercise_id: exercise.id,
      name: exercise.name,
      video_url: exercise.video_url,
      sets: "",
      reps: "",
      load: "",
      rest: "",
    });
  };

  const handleRecommendation = (recommended: ExerciseRecommendationsOutput) => {
     const recommendedNames = recommended.exerciseRecommendations.split(',').map(e => e.trim().toLowerCase());
     
     const exercisesToAdd = exercises
        .filter(e => recommendedNames.includes(e.name.toLowerCase()))
        .map(e => ({
            exercise_id: e.id,
            name: e.name,
            video_url: e.video_url,
            sets: "3", // Default values, can be adjusted
            reps: "12",
            load: "",
            rest: "60",
        }));
     
     replace(exercisesToAdd);

     form.setValue('diet_plan', recommended.dietPlan);
     form.setValue('name', `Plano de Treino IA - ${new Date().toLocaleDateString('pt-BR')}`);
     form.setValue('description', recommended.explanation);

     toast({
       title: "Recomendações da IA aplicadas",
       description: "Exercícios, plano de dieta e detalhes do treino foram preenchidos. Revise e ajuste se necessário.",
     })
  }

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8);
    form.setValue('access_password', newPassword);
  }

  const copyPassword = () => {
    const password = form.getValues('access_password');
    if (password) {
        navigator.clipboard.writeText(password);
        toast({ title: "Senha copiada!" });
    } else {
        toast({ title: "Nenhuma senha para copiar", variant: "destructive"});
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Treino</FormLabel>
                      <FormControl><Input placeholder="Ex: Semana 1 - Corpo Inteiro" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atribuir ao Aluno</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um aluno" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição/Notas do Treino</FormLabel>
                      <FormControl><Textarea placeholder="Notas opcionais para o treino" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="diet_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano de Dieta</FormLabel>
                      <FormControl><Textarea placeholder="Detalhes do plano alimentar, suplementação, etc." {...field} rows={5} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="access_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha de Acesso (Opcional)</FormLabel>
                       <div className="flex items-center gap-2">
                            <FormControl>
                                <Input type="text" placeholder="Deixe em branco para acesso livre" {...field} value={field.value ?? ''} />
                            </FormControl>
                             <Button type="button" variant="outline" size="icon" onClick={copyPassword}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={generatePassword}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                       <FormDescription>Se preenchida, o aluno precisará desta senha para ver o treino.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exercícios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-2 relative">
                     <div className="flex justify-between items-start gap-4">
                        <h4 className="font-semibold flex-1 pr-2 mt-1">{field.name}</h4>
                        <div className="flex items-center gap-2">
                           {field.video_url && (
                            <Button asChild variant="outline" size="sm">
                                <a href={field.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm">
                                <Video className="h-4 w-4"/> Ver vídeo
                                </a>
                            </Button>
                            )}
                            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Input {...form.register(`exercises.${index}.sets`)} placeholder="Séries" />
                        <Input {...form.register(`exercises.${index}.reps`)} placeholder="Reps" />
                        <Input {...form.register(`exercises.${index}.load`)} placeholder="Carga (kg)" />
                        <Input {...form.register(`exercises.${index}.rest`)} placeholder="Descanso (s)" />
                    </div>
                  </div>
                ))}
                 {fields.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum exercício adicionado ainda.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
             <AiAssistant onRecommendation={handleRecommendation} studentId={form.watch('student_id')} exercises={exercises} />
             <Card>
                <CardHeader>
                    <CardTitle>Biblioteca de Exercícios</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                        {exercises.map((exercise) => (
                            <div key={exercise.id} className="flex items-center justify-between">
                                <span>{exercise.name}</span>
                                <Button type="button" size="sm" variant="outline" onClick={() => addExercise(exercise)}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Adicionar
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting} className="ripple">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Salvar Alterações' : 'Criar Plano de Treino'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
