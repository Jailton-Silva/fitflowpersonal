
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Users, Calendar, Sprout, Shapes, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Alunos", icon: Users },
  { href: "/workouts", label: "Treinos", icon: Dumbbell },
  { href: "/templates", label: "Templates", icon: Shapes },
  { href: "/schedule", label: "Agenda", icon: Calendar },
  { href: "/exercises", label: "Exercícios", icon: Sprout },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function NavContent() {
  const pathname = usePathname();
  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="">FitFlow</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                (pathname === href || (href !== "/dashboard" && pathname.startsWith(href))) && "bg-muted text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export function Sidebar() {
  return (
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
            <NavContent />
        </div>
      </div>
  );
}
