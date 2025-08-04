
import PublicHeader from "@/components/layout/public-header";
import StudentPublicPortal from "@/components/students/student-public-portal";

export default async function StudentPortalPage({ params }: { params: { id: string } }) {
  const studentId = params.id;
  
  return (
    <>
      <PublicHeader studentId={studentId} />
      <StudentPublicPortal studentId={studentId} />
    </>
  );
}
