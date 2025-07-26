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
import { Badge } from "@/components/ui/badge";
import { Student } from "@/lib/definitions";
import StudentForm from "./student-form";

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
            <StudentForm student={student}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </StudentForm>
        </div>
      );
    },
  },
];
