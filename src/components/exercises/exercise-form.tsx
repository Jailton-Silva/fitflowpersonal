
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Exercise } from "@/lib/definitions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional(),
  muscle_groups: z.string().optional().transform(value => value ? value.split(',').map(s => s.trim()) : []),
  equipment: z.string().optional(),
  video_url: z.string().url("URL do vídeo inválida.").optional().or(z.literal('')),
  instructions: z.string().optional(),
});

type ExerciseFormProps = {
  children: React.ReactNode;
  exercise?: Exercise;
};

export default function ExerciseForm({ children, exercise }: ExerciseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!exercise;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      muscle_groups: [],
      equipment: "",
      video_url: "",
      instructions: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditMode) {
            form.reset({
                name: exercise.name,
                description: exercise.description ?? "",
                muscle_groups: exercise.muscle_groups as any ?? "", // Will be transformed
                equipment: exercise.equipment ?? "",
                video_url: exercise.video_url ?? "",
                instructions: exercise.instructions ?? "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
                muscle_groups: [],
                equipment: "",
                video_url: "",
                instructions: "",
            });
        }
    }
  }, [isOpen, exercise, isEditMode, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const supabase = createClient();
    
    const submissionData = { 
        ...values, 
        description: values.description || null,
        muscle_groups: values.muscle_groups,
        equipment: values.equipment || null,
        video_url: values.video_url || null,
        instructions: values.instructions || null,
    };
    
    const { error } = isEditMode 
      ? await supabase.from("exercises").update(submissionData).eq("id", exercise.id)
      : await supabase.from("exercises").insert([submissionData]);

    if (error) {
      toast({
        title: `Erro ao salvar exercício`,
        description: "Verifique os dados e tente novamente. " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: `Exercício ${isEditMode ? 'atualizado' : 'criado'} com sucesso.`,
      });
      setIsOpen(false);
      router.refresh(); 
    }
    setIsSubmitting(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar Exercício' : 'Novo Exercício'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Atualize os detalhes deste exercício.' : 'Preencha os campos para adicionar um novo exercício à biblioteca.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Exercício</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supino Reto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="muscle_groups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupos Musculares</FormLabel>
                  <FormControl>
                    <Input placeholder="Peito, Tríceps, Ombro" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipamento Necessário</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Barra, Halteres" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Uma breve descrição do exercício." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções de Execução</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Passo a passo de como realizar o exercício corretamente." {...field} value={field.value ?? ''} rows={5}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit" disabled={isSubmitting} className="ripple">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Salvar Alterações' : 'Criar Exercício'}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
