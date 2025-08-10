
"use client";

import { useState, useEffect } from "react";
import { Trainer } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminTrainerCard, AdminTrainerTableRow, AdminTrainerTableHeader } from "@/components/admin/trainer-list-components";

export default function AdminClientPage({ trainers: initialTrainers }: { trainers: Trainer[] }) {
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>(initialTrainers);
  const [isLoading, setIsLoading] = useState(false); // Set to false as data is pre-loaded
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = trainers.filter((item) => {
      return item.name.toLowerCase().includes(lowercasedFilter) ||
             item.email.toLowerCase().includes(lowercasedFilter);
    });
    setFilteredTrainers(filteredData);
  }, [searchTerm, trainers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Gerencie todos os treinadores da plataforma.</p>
        </div>
      </div>

       <div className="rounded-md border bg-card">
        <div className="p-4">
            <Input
              placeholder="Filtrar por nome ou email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="max-w-sm"
            />
        </div>

        {isLoading ? (
            <div className="p-4 space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden">
                {filteredTrainers.length > 0 ? (
                  <div className="divide-y divide-border">
                    {filteredTrainers.map((trainer) => <AdminTrainerCard key={trainer.id} trainer={trainer} />)}
                  </div>
                ) : (
                  <p className="p-4 text-center text-muted-foreground">Nenhum treinador encontrado.</p>
                )}
            </div>
            {/* Desktop View */}
            <div className="hidden md:block">
               <table className="w-full text-sm">
                  <AdminTrainerTableHeader />
                  <tbody className="divide-y divide-border">
                    {filteredTrainers.length > 0 ? (
                      filteredTrainers.map((trainer) => <AdminTrainerTableRow key={trainer.id} trainer={trainer} />)
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                          Nenhum treinador encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
