"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/lib/definitions";
import React from "react";


export const columns: ColumnDef<Exercise>[] = [
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
     cell: ({ row }) => {
        return <div className="pl-4 font-medium">{row.getValue("name")}</div>
     },
  },
  {
    accessorKey: "muscle_groups",
    header: "Grupos Musculares",
    cell: ({ row }) => {
      const groups = row.getValue("muscle_groups") as string[];
      if (!groups || groups.length === 0) return <div className="text-muted-foreground">-</div>;
      return (
        <div className="flex flex-wrap gap-1">
          {groups.map((group, index) => (
            <Badge key={index} variant="secondary">{group}</Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "equipment",
    header: "Equipamento",
     cell: ({ row }) => {
        const equipment = row.getValue("equipment") as string;
        return equipment || <div className="text-muted-foreground">-</div>;
     }
  },
];
