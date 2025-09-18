
"use client";

import { useState } from "react";
import { Student, Workout } from "@/lib/definitions";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Lock, User, Palette, Edit, Phone, Check, X, LogOut, Moon, Sun, Laptop, Info, Cake, Flag, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { updateStudentProfile } from "@/app/portal/actions";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StudentDetailClientProps {
    student: Student;
    workouts: Workout[];
}

// Função auxiliar para formatar a data de forma segura, corrigindo o problema de fuso horário.
const formatSafeDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Não informado";
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return "Data inválida";
    }

    // SOLUÇÃO: A data do banco (ex: '1997-02-20') é interpretada pelo JS como meia-noite UTC.
    // No navegador em um fuso horário como GMT-3, isso se torna 21h do dia anterior.
    // Para corrigir, pegamos o offset do fuso do usuário e o adicionamos de volta à data,
    // efetivamente "neutralizando" o efeito do fuso horário para a formatação de dia/mês/ano.
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

    return format(adjustedDate, 'dd/MM/yyyy', { locale: ptBR });
};

export default function StudentDetailClient({ student, workouts }: StudentDetailClientProps) {
    const { toast } = useToast();
    const { setTheme } = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [contactPhone, setContactPhone] = useState(student.contact_phone || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleProfileUpdate = async () => {
        setIsSaving(true);
        const result = await updateStudentProfile(student.id, { contact_phone: contactPhone });
        setIsSaving(false);

        if (result.success) {
            toast({ title: "Contato atualizado com sucesso!" });
            setIsEditing(false);
        } else {
            toast({ title: "Erro ao atualizar o contato", description: result.error, variant: "destructive" });
        }
    };
    
    const handleThemeChange = async (theme: string) => {
        setTheme(theme);
        const result = await updateStudentProfile(student.id, { theme_preference: theme });
        if (!result.success) {
            toast({ title: "Erro ao salvar preferência de tema", variant: "destructive" });
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                        <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                        <AvatarFallback className="text-2xl">{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold font-headline">Portal de {student.name}</h1>
                        <p className="text-muted-foreground">Acompanhe sua jornada fitness.</p>
                    </div>
                </div>
                 <Button variant="outline"><LogOut className="h-4 w-4 mr-2"/>Sair</Button>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><User /> Minhas Informações</CardTitle>
                            {!isEditing ? (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4 mr-2"/>Editar</Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button disabled={isSaving} variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="h-4 w-4"/></Button>
                                    <Button disabled={isSaving} size="sm" onClick={handleProfileUpdate}><Check className="h-4 w-4"/></Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                             <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground"/>
                                <span className="font-semibold">Contato:</span>
                                {isEditing ? (
                                    <Input 
                                        type="tel"
                                        value={contactPhone}
                                        onChange={e => setContactPhone(e.target.value)}
                                        placeholder="(XX) XXXXX-XXXX"
                                        className="h-8"
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <span className="text-muted-foreground">{contactPhone || "Não informado"}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">Gênero:</span>
                                <span className="text-muted-foreground">{student.gender || "Não informado"}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Cake className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">Nascimento:</span>
                                <span className="text-muted-foreground">{formatSafeDate(student.birth_date)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Flag/> Meus Objetivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{student.goals || "Nenhum objetivo definido."}</p>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Activity/> Observações do Personal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{student.observations || "Nenhuma observação."}</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Palette/> Aparência</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-around gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleThemeChange('light')}><Sun className="h-4 w-4 mr-2"/> Claro</Button>
                            <Button size="sm" variant="outline" onClick={() => handleThemeChange('dark')}><Moon className="h-4 w-4 mr-2"/> Escuro</Button>
                            <Button size="sm" variant="outline" onClick={() => handleThemeChange('system')}><Laptop className="h-4 w-4 mr-2"/> Sistema</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Dumbbell/> Meus Treinos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {workouts.length > 0 ? (
                                workouts.map((workout) => (
                                    <Link key={workout.id} href={`/portal/${student.id}/workout/${workout.id}`} className="w-full text-left p-4 rounded-lg transition-colors hover:bg-muted border flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{workout.name}</p>
                                            <p className="text-sm text-muted-foreground">{workout.description || `${(workout.exercises as any[]).length} exercícios`}</p>
                                        </div>
                                        {workout.access_password && <Lock className="h-5 w-5 text-muted-foreground" />}
                                    </Link>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">Nenhum treino ativo foi encontrado para você no momento.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            
            <footer className="text-center text-xs text-muted-foreground"><p>&copy; {new Date().getFullYear()} FitFlow. Todos os direitos reservados.</p></footer>
        </div>
    );
}
