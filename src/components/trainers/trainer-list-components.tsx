import { Trainer } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrainerForm } from "@/app/(app)/trainers/_components/trainer-form";

// Card para visualização mobile
export function TrainerCard({ trainer }: { trainer: Trainer }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "banned":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Start":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Pro":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Elite":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={trainer.avatar_url} alt={trainer.name} />
          <AvatarFallback className="text-lg font-semibold">
            {trainer.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="font-semibold">{trainer.name}</h3>
          <p className="text-sm text-muted-foreground">{trainer.email}</p>
          <div className="flex gap-2">
            <Badge className={getStatusColor(trainer.status)}>
              {trainer.status === "active" ? "Ativo" : trainer.status === "inactive" ? "Inativo" : "Banido"}
            </Badge>
            <Badge className={getPlanColor(trainer.plan)}>
              {trainer.plan}
            </Badge>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </DropdownMenuItem>
          <TrainerForm trainer={trainer}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          </TrainerForm>
          <DropdownMenuItem className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Cabeçalho da tabela para desktop
export function TrainerTableHeader() {
  return (
    <thead>
      <tr className="border-b bg-muted/50">
        <th className="p-4 text-left font-medium">Treinador</th>
        <th className="p-4 text-left font-medium">Email</th>
        <th className="p-4 text-left font-medium">Telefone</th>
        <th className="p-4 text-left font-medium">Plano</th>
        <th className="p-4 text-left font-medium">Status</th>
        <th className="p-4 text-left font-medium">Data de Criação</th>
        <th className="p-4 text-left font-medium">Ações</th>
      </tr>
    </thead>
  );
}

// Linha da tabela para desktop
export function TrainerTableRow({ trainer }: { trainer: Trainer }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "banned":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Start":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Pro":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Elite":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={trainer.avatar_url} alt={trainer.name} />
            <AvatarFallback className="font-semibold">
              {trainer.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{trainer.name}</span>
        </div>
      </td>
      <td className="p-4 text-muted-foreground">{trainer.email}</td>
      <td className="p-4 text-muted-foreground">
        {trainer.phone || "Não informado"}
      </td>
      <td className="p-4">
        <Badge className={getPlanColor(trainer.plan)}>
          {trainer.plan}
        </Badge>
      </td>
      <td className="p-4">
        <Badge className={getStatusColor(trainer.status)}>
          {trainer.status === "active" ? "Ativo" : trainer.status === "inactive" ? "Inativo" : "Banido"}
        </Badge>
      </td>
      <td className="p-4 text-muted-foreground">
        {formatDate(trainer.created_at)}
      </td>
      <td className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalhes
            </DropdownMenuItem>
            <TrainerForm trainer={trainer}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            </TrainerForm>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

