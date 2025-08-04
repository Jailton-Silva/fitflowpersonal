
"use client";

import Link from "next/link";
import { Student } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import StudentForm from "./student-form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Action for Deleting a Student
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
        toast({ title: "Sucesso!", description: "Aluno excluído com sucesso." });
        router.refresh();
      },
      (error) => {
        toast({ title: "Erro ao excluir aluno", description: error.message, variant: "destructive" });
      }
    );
  };

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
  );
}

// Reusable Actions Dropdown
function StudentActions({ student }: { student: Student }) {
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
}

// Component for Mobile Card View
export function StudentCard({ student }: { student: Student }) {
    const statusText = student.status === 'active' ? 'Ativo' : 'Inativo';
    return (
        <div className="p-4 flex items-center gap-4">
             <Avatar className="h-12 w-12">
                <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <Link href={`/students/${student.id}`} className="font-medium text-primary hover:underline pr-4">
                        {student.name}
                    </Link>
                    <StudentActions student={student} />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>{student.email}</p>
                    <Badge variant={student.status === "active" ? "default" : "secondary"}>
                        {statusText}
                    </Badge>
                </div>
            </div>
        </div>
    )
}

// Component for Desktop Table Row
export function StudentTableRow({ student }: { student: Student }) {
  const statusText = student.status === 'active' ? 'Ativo' : 'Inativo';
  return (
    <tr className="hover:bg-muted/50">
      <td className="p-4">
        <Avatar>
            <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </td>
      <td className="p-4 font-medium">
         <Link href={`/students/${student.id}`} className="text-primary hover:underline">
            {student.name}
          </Link>
      </td>
      <td className="p-4 text-muted-foreground">{student.email}</td>
      <td className="p-4">
        <Badge variant={student.status === "active" ? "default" : "secondary"}>
          {statusText}
        </Badge>
      </td>
      <td className="p-4 text-muted-foreground truncate max-w-xs">{student.goals}</td>
      <td className="p-4 text-right">
        <StudentActions student={student} />
      </td>
    </tr>
  );
}

// Component for Desktop Table Header
export function StudentTableHeader() {
  return (
    <thead className="border-b">
      <tr className="text-left text-muted-foreground">
        <th className="p-4 font-medium w-16">Foto</th>
        <th className="p-4 font-medium">Nome</th>
        <th className="p-4 font-medium">Email</th>
        <th className="p-4 font-medium">Status</th>
        <th className="p-4 font-medium">Objetivos</th>
        <th className="p-4 font-medium text-right">Ações</th>
      </tr>
    </thead>
  );
}
