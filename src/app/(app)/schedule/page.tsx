import { createClient } from "@/lib/supabase/server";
import { Appointment, Student } from "@/lib/definitions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthView } from "@/components/schedule/month-view";
import { WeekView } from "@/components/schedule/week-view";
import { ScheduleFilters } from "@/components/schedule/schedule-filters";

async function getScheduleData(studentId?: string, status?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { appointments: [], students: [] };
    
    const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    if (!trainer) return { appointments: [], students: [] };

    let appointmentQuery = supabase
        .from('appointments')
        .select('*, students(id, name)')
        .eq('trainer_id', trainer.id);

    if (studentId) {
        appointmentQuery = appointmentQuery.eq('student_id', studentId);
    }
    if (status) {
        appointmentQuery = appointmentQuery.eq('status', status);
    }

    const studentsQuery = supabase
        .from('students')
        .select('id, name')
        .eq('trainer_id', trainer.id)
        .order('name', { ascending: true });

    const [
        { data: appointments, error: appointmentsError },
        { data: students, error: studentsError }
    ] = await Promise.all([appointmentQuery, studentsQuery]);

    if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
    }
     if (studentsError) {
        console.error("Error fetching students:", studentsError);
    }

    return { 
        appointments: (appointments as Appointment[]) ?? [],
        students: (students as Pick<Student, 'id' | 'name'>[]) ?? []
    };
}


export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { view?: string; student?: string; status?: string };
}) {
    const { appointments, students } = await getScheduleData(searchParams.student, searchParams.status);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold font-headline">Agenda</h1>
                <ScheduleFilters students={students} />
            </div>
            <Tabs defaultValue={searchParams.view || "month"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
                    <TabsTrigger value="month">Mês</TabsTrigger>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                </TabsList>
                <TabsContent value="month">
                    <div className="rounded-md border bg-card p-2 sm:p-4">
                        <MonthView appointments={appointments} students={students} />
                    </div>
                </TabsContent>
                <TabsContent value="week">
                    <div className="rounded-md border bg-card p-2 sm:p-4">
                        <WeekView appointments={appointments} students={students} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
