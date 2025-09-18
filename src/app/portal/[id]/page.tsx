
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Student, Workout } from "@/lib/definitions";
import { cookies } from "next/headers";
import StudentDetailClient from "./student-detail-client";

async function getPortalData(studentId: string) {
    const supabase = await createClient();
    
    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

    if (studentError || !student || student.status !== 'active') {
        if (studentError) console.error("Portal Error (Student Fetch):", studentError.message);
        notFound();
    }

    const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('student_id', studentId)
        .in('status', ['active', 'not-started'])
        .order('created_at', { ascending: false });
    
    if (workoutsError) {
        console.error("Portal Error (Workouts Fetch):", workoutsError.message);
    }

    return {
        student: student as Student,
        workouts: (workouts as Workout[]) || [],
    };
}

export default async function StudentPortalPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    
    const studentId = params.id;
    if (!studentId) {
        notFound();
    }

    const sessionCookie = cookieStore.get(`portal-session-${studentId}`);
    if (!sessionCookie) {
        redirect('/portal');
    }

    const { student, workouts } = await getPortalData(studentId);

    return <StudentDetailClient student={student} workouts={workouts} />;
}
