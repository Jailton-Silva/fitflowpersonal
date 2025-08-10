
"use client";

import Link from "next/link";
import { Trainer } from "@/lib/definitions";
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
import { MoreHorizontal, Edit, Trash2, LogIn, Ban } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock actions for now
const handleDeactivate = (trainerId: string) => alert(`Desativar: ${trainerId}`);
const handleAccessAccount = (trainerId: string) => alert(`Acessar conta: ${trainerId}`);


// Reusable Actions Dropdown
function TrainerActions({ trainer }: { trainer: Trainer }) {
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
           <DropdownMenuItem onClick={() => alert(`Editar: ${trainer.id}`)}>
             <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAccessAccount(trainer.id)}>
            <LogIn className="mr-2 h-4 w-4" />
            Acessar Conta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-orange-600 focus:text-orange-600" onClick={() => handleDeactivate(trainer.id)}>
             <Ban className="mr-2 h-4 w-4" />
            Desativar Conta
          </DropdownMenuItem>
           <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => alert(`Excluir: ${trainer.id}`)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Component for Mobile Card View
export function AdminTrainerCard({ trainer }: { trainer: Trainer }) {
    const trialExpired = isPast(new Date(trainer.billing_cycle_end));
    return (
        <div className="p-4 flex items-center gap-4">
             <Avatar className="h-12 w-12">
                <AvatarImage src={trainer.avatar_url || undefined} alt={trainer.name} />
                <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <p className="font-medium text-primary pr-4">{trainer.name}</p>
                    <TrainerActions trainer={trainer} />
                </div>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                    <p>{trainer.email}</p>
                    <div className="flex flex-wrap gap-2">
                         <Badge variant={trainer.plan === "Pro" ? "default" : "secondary"}>
                            Plano: {trainer.plan}
                        </Badge>
                         <Badge variant={trialExpired ? "destructive" : "success"}>
                            {trialExpired ? "Inativo" : "Ativo"}
                        </Badge>
                    </div>
                     <p className="text-xs">Próximo Venc: {format(new Date(trainer.billing_cycle_end), "dd/MM/yyyy")}</p>
                </div>
            </div>
        </div>
    )
}

// Component for Desktop Table Row
export function AdminTrainerTableRow({ trainer }: { trainer: Trainer }) {
  const trialExpired = isPast(new Date(trainer.billing_cycle_end));
  return (
    <tr className="hover:bg-muted/50">
      <td className="p-4">
        <Avatar>
            <AvatarImage src={trainer.avatar_url || undefined} alt={trainer.name} />
            <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </td>
      <td className="p-4 font-medium">{trainer.name}</td>
      <td className="p-4 text-muted-foreground">{trainer.email}</td>
      <td className="p-4">
        <Badge variant={trialExpired ? "destructive" : "success"}>
          {trialExpired ? "Pagamento pendente" : "Em dia"}
        </Badge>
      </td>
      <td className="p-4 text-muted-foreground">{format(new Date(trainer.created_at), "dd/MM/yyyy")}</td>
      <td className="p-4 text-muted-foreground">{format(new Date(trainer.billing_cycle_end), "dd/MM/yyyy")}</td>
      <td className="p-4 text-right">
        <TrainerActions trainer={trainer} />
      </td>
    </tr>
  );
}

// Component for Desktop Table Header
export function AdminTrainerTableHeader() {
  return (
    <thead className="border-b">
      <tr className="text-left text-muted-foreground">
        <th className="p-4 font-medium w-16">Foto</th>
        <th className="p-4 font-medium">Nome</th>
        <th className="p-4 font-medium">Email</th>
        <th className="p-4 font-medium">Pagamento</th>
        <th className="p-4 font-medium">Data de Cadastro</th>
        <th className="p-4 font-medium">Próximo Vencimento</th>
        <th className="p-4 font-medium text-right">Ações</th>
      </tr>
    </thead>
  );
}
