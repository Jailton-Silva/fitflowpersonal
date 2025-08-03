
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { StudentPasswordForm } from "@/components/students/student-password-form";

async function getStudent(studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('id', studentId)
        .single();

    if (error || !data) {
        notFound();
    }
    return data;
}

export default async function PublicStudentPasswordPage({ params }: { params: { id: string } }) {
    await getStudent(params.id); // Ensure student exists

    const cookieStore = cookies();
    const authCookie = cookieStore.get(`student_auth_${params.id}`);

    if (authCookie?.value === 'true') {
        redirect(`/public/student/${params.id}/portal`);
    }

    return <StudentPasswordForm studentId={params.id} />;
}
