"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Users, Calendar, Sprout, Shapes, Settings, CreditCard, Shield } from "lucide-react";
import { useTrainer } from "@/hooks/use-trainer";

import { cn } from "@/lib/utils";

const trainerNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Alunos", icon: Users },
  { href: "/workouts", label: "Treinos", icon: Dumbbell },
  { href: "/templates", label: "Templates", icon: Shapes },
  { href: "/schedule", label: "Agenda", icon: Calendar },
  { href: "/exercises", label: "Exercícios", icon: Sprout },
];

const adminNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Shield },
    { href: "/trainers", label: "Treinadores", icon: Users },
]

const secondaryNavItems = [
    { href: "/billing", label: "Planos e Preços", icon: CreditCard },
    { href: "/settings", label: "Configurações", icon: Settings },
]

export function NavContent() {
  const pathname = usePathname();
  const { trainer } = useTrainer();
  const isAdmin = trainer?.role === 'admin';

  const primaryNavItems = isAdmin ? adminNavItems : trainerNavItems;

  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 font-semibold font-headline">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="">FitFlow</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
          {primaryNavItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                pathname.startsWith(href) && "bg-muted text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
       <div className="mt-auto p-4">
         <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            {secondaryNavItems.map(({ href, label, icon: Icon }) => {
                // Hide billing for admins
                if (isAdmin && href === '/billing') return null;

                return (
                 <Link
                    key={href}
                    href={href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                        pathname.startsWith(href) && "bg-muted text-primary"
                    )}
                    >
                    <Icon className="h-4 w-4" />
                    {label}
                    </Link>
                )
            })}
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
