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
import { Student } from "@/lib/definitions";
import StudentForm from "./student-form";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React from "react";


async function deleteStudent(studentId: string, onComplete: () => void, onError: (error: any) => void) {
  const supabase = createClient();
  const { error } = await supabase.from("students").delete().eq("id", studentId);

  if (error) {
    onError(error);
  } else {
    onComplete();
  }
}

function DeleteStudentAction({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = () => {
    deleteStudent(
      studentId,
      () => {
        toast({
          title: "Sucesso!",
          description: "Aluno excluído com sucesso.",
        });
        router.refresh();
      },
      (error) => {
         toast({
          title: "Erro ao excluir aluno",
          description: error.message,
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
          Excluir Aluno
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o
            aluno e removerá seus dados de nossos servidores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Sim, excluir aluno
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export const columns: ColumnDef<Student>[] = [
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
     cell: ({ row }) => <div className="pl-4">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusText = status === 'active' ? 'Ativo' : 'Inativo';
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {statusText}
        </Badge>
      );
    },
  },
  {
    accessorKey: "goals",
    header: "Objetivos",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;

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
              <StudentForm student={student}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Editar Aluno
                </DropdownMenuItem>
              </StudentForm>
              <DropdownMenuSeparator />
              <DeleteStudentAction studentId={student.id} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];