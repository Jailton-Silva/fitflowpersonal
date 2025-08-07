
"use client";

import Link from "next/link";
import { Dumbbell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutStudent } from "@/app/public/student/[id]/actions";
import { useRouter } from "next/navigation";

export default function PublicHeader({ studentId }: { studentId?: string }) {
  const router = useRouter();
  
  const handleLogout = async () => {
    if (!studentId) return;
    await logoutStudent(studentId);
    router.push(`/public/student/${studentId}`);
    router.refresh();
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 no-print">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <Link href={studentId ? `/public/student/${studentId}/portal` : `/`} className="flex items-center gap-2" prefetch={false}>
          <Dumbbell className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow Portal</h1>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {studentId && (
            <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sair</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
