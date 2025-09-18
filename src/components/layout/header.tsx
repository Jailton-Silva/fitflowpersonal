import Link from "next/link";
import { CircleUser, Settings, LogOut, Dumbbell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeToggle } from "../theme-toggle";
import { NavContent } from "./sidebar";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cookies } from "next/headers";

export async function Header() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: trainer } = user ? await supabase.from('trainers').select('avatar_url').eq('user_id', user.id).single() : { data: null };


  const signOut = async () => {
    "use server";
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
       <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar menu de navegação</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <SheetDescription className="sr-only">Navegue pelas seções da plataforma FitFlow.</SheetDescription>
            </SheetHeader>
            <NavContent />
        </SheetContent>
        </Sheet>
       <div className="w-full flex-1">
        {/* Adicione aqui qualquer elemento futuro para o header, como uma busca */}
       </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
               <Avatar className="h-8 w-8">
                  <AvatarImage src={trainer?.avatar_url || undefined} alt="Avatar do Treinador" />
                  <AvatarFallback><CircleUser className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              <span className="sr-only">Menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-headline">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <button type="submit" className="w-full">
                <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
