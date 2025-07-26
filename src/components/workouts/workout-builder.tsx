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
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import AiAssistant from "./ai-assistant";

const workoutSchema = z.object({
  name: z.string().min(3, "O nome do treino é obrigatório"),
  student_id: z.string().min(1, "Por favor, selecione um aluno"),
  description: z.string().optional(),
  diet_plan: z.string().optional(),
  exercises: z.array(
    z.object({
      exercise_id: z.string().optional(), // Becomes optional as we might have just the name
      name: z.string(),
      sets: z.string().optional(),
      reps: z.string().optional(),
      load: z.string().optional(),
      rest: z.string().optional(),
    })
  ),
});

type WorkoutBuilderProps = {
  students: Pick<Student, 'id' | 'name'>[];
  exercises: Exercise[];
  workout?: Workout;
};

export default function WorkoutBuilder({ students, exercises, workout }: WorkoutBuilderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: workout || {
      name: "",
      student_id: "",
      description: "",
      diet_plan: "",
      exercises: [],
    },
  });

  const isEditMode = !!workout;

  useEffect(() => {
    if (workout) {
      form.reset(workout);
    }
  }, [workout, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const onSubmit = async (values: z.infer<typeof workoutSchema>) => {
    const supabase = createClient();
    
    let error;

    if (isEditMode) {
      const { error: updateError } = await supabase
        .from("workouts")
        .update(values)
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
        { ...values, trainer_id: trainer.id }
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
      sets: "",
      reps: "",
      load: "",
      rest: "",
    });
  };

  const addRecommendedExercises = (recommended: {exerciseRecommendations: string, explanation: string}) => {
     const names = recommended.exerciseRecommendations.split(',').map(e => e.trim().toLowerCase());
     const exercisesToAdd = exercises.filter(e => names.includes(e.name.toLowerCase()));
     exercisesToAdd.forEach(addExercise);
     toast({
       title: "Recomendações da IA adicionadas",
       description: "Os exercícios foram adicionados ao plano. Revise e ajuste os detalhes.",
     })
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
                      <FormControl><Textarea placeholder="Notas opcionais para o treino" {...field} /></FormControl>
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
                      <FormControl><Textarea placeholder="Descreva as orientações da dieta. Ex: Café da manhã: Ovos mexidos. Almoço: Frango grelhado com salada." rows={5} {...field} /></FormControl>
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
                    <h4 className="font-semibold">{field.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Input {...form.register(`exercises.${index}.sets`)} placeholder="Séries" />
                        <Input {...form.register(`exercises.${index}.reps`)} placeholder="Reps" />
                        <Input {...form.register(`exercises.${index}.load`)} placeholder="Carga (kg)" />
                        <Input {...form.register(`exercises.${index}.rest`)} placeholder="Descanso (s)" />
                    </div>
                     <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                 {fields.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum exercício adicionado ainda.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
             <AiAssistant onAddExercises={addRecommendedExercises} studentId={form.watch('student_id')} />
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
