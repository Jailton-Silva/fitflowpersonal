
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { StudentPasswordForm } from '@/components/students/student-password-form';

export default async function PublicStudentPasswordPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const studentId = params.id;
    const authCookie = cookieStore.get(`student_auth_${studentId}`);

    if (authCookie?.value === 'true') {
        return redirect(`/public/student/${studentId}/portal`);
    }
    
    // We can verify if the student exists and requires a password before showing the form
    const supabase = createClient();
    const { data: student, error } = await supabase
        .from('students')
        .select('id, access_password')
        .eq('id', studentId)
        .single();
    
    if (error || !student) {
        notFound();
    }
    
    // If student exists but does not require a password, grant access
    if (student && !student.access_password) {
        cookies().set(`student_auth_${studentId}`, 'true', { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 });
        return redirect(`/public/student/${studentId}/portal`);
    }

    return <StudentPasswordForm studentId={studentId} />;
}
