import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CalendarView } from "@/components/schedule/calendar-view";
import { createClient } from "@/lib/supabase/server";

async function getAppointments() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }
    
    const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    if (!trainer) {
        return [];
    }

    const { data, error } = await supabase
        .from('appointments')
        .select('*, students(name)')
        .eq('trainer_id', trainer.id);

    if (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
    return data;
}

export default async function SchedulePage() {
    const appointments = await getAppointments();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-headline">Agenda</h1>
                <Button className="ripple">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Agendamento
                </Button>
            </div>
            <div className="rounded-md border bg-card p-4">
              <CalendarView appointments={appointments as any[]} />
            </div>
        </div>
    );
}
