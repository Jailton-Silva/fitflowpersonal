"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Users, Calendar, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/schedule", label: "Schedule", icon: Calendar },
];

function NavContent() {
  const pathname = usePathname();
  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="">FitFlow</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map(({ href, label, icon: Icon }) => (
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
    </>
  )
}

export function Sidebar() {
  return (
    <>
      <div className="hidden border-r bg-card md:block w-64">
        <div className="flex h-full max-h-screen flex-col">
            <NavContent />
        </div>
      </div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
             <Button variant="outline" size="icon" className="shrink-0 md:hidden m-4">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-64">
             <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
