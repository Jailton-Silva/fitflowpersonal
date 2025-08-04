
"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPageHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link href="#" className="flex items-center justify-center" prefetch={false}>
        <Dumbbell className="h-6 w-6 text-primary" />
        <span className="sr-only">FitFlow</span>
      </Link>
      <h1 className="ml-2 text-2xl font-headline font-bold text-primary">FitFlow</h1>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <ThemeToggle />
        <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          Entrar
        </Link>
        <Button asChild className="ripple">
          <Link href="/signup" prefetch={false}>
            Cadastre-se Grátis
          </Link>
        </Button>
      </nav>
    </header>
  );
}
