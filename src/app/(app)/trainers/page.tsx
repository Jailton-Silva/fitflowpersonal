"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trainer } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TrainerForm } from "./_components/trainer-form";
import { Input } from "@/components/ui/input";
import { TrainerCard, TrainerTableRow, TrainerTableHeader } from "@/components/trainers/trainer-list-components";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getTrainers = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Buscar todos os treinadores
      // Primeiro verificar se o usuário é admin
      const { data: currentTrainer } = await supabase
        .from('trainers')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from("trainers")
        .select("*")
        .order("name", { ascending: true });

      // Se não for admin, só mostrar treinadores ativos
      if (currentTrainer?.role !== 'admin') {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      console.log(data);

      if (error) {
        console.error("Erro ao buscar treinadores:", error);
      } else {
        setTrainers(data as Trainer[]);
        setFilteredTrainers(data as Trainer[]);
      }
      setIsLoading(false);
    };

    getTrainers();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = trainers.filter((item) => {
      return (
        item.name.toLowerCase().includes(lowercasedFilter) ||
        item.email.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredTrainers(filteredData);
  }, [searchTerm, trainers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Treinadores</h1>
        <TrainerForm>
          <Button className="ripple">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Treinador
          </Button>
        </TrainerForm>
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
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden">
              {filteredTrainers.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredTrainers.map((trainer) => (
                    <TrainerCard key={trainer.id} trainer={trainer} />
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-muted-foreground">
                  Nenhum treinador encontrado.
                </p>
              )}
            </div>
            {/* Desktop View */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <TrainerTableHeader />
                <tbody className="divide-y divide-border">
                  {filteredTrainers.length > 0 ? (
                    filteredTrainers.map((trainer) => (
                      <TrainerTableRow key={trainer.id} trainer={trainer} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
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