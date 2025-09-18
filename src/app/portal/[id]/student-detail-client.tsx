
"use client";

import { useState } from "react";
import { Student, Workout, StudentMeasurement, WorkoutSession } from "@/lib/definitions";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dumbbell, Lock, User, Edit, Phone, Check, X, LogOut, Moon, Sun, Laptop, Info, Cake, Flag, Activity, Scale, BarChart3, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { updateStudentProfile } from "@/app/portal/actions";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";


interface StudentPortalPageProps {
    student: Student;
    workouts: Workout[];
    measurements: StudentMeasurement[];
    sessions: (WorkoutSession & { workouts: { name: string } | null })[];
}

// --- Funções Auxiliares de Formatação ---

const formatSafeDate = (dateStr: string | null | undefined, includeTime = false) => {
    if (!dateStr) return "Não informado";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Data inválida";

    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

    const formatString = includeTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
    return format(adjustedDate, formatString, { locale: ptBR });
};

const formatSessionStatus = (status: string | null) => {
    switch (status) {
        case 'completed':
            return <Badge variant="default">Finalizado</Badge>;
        case 'in-progress':
            return <Badge variant="secondary">Em Andamento</Badge>;
        default:
            return <Badge variant="outline">Não Iniciado</Badge>;
    }
}

// --- Componentes de Card (Histórico e Gráfico) ---

const MeasurementsHistoryCard = ({ measurements }: { measurements: StudentMeasurement[] }) => {
    if (measurements.length === 0) return null; // Não renderiza se não houver dados

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Scale /> Histórico de Medições</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Peso</TableHead>
                            <TableHead className="text-right">Altura</TableHead>
                            <TableHead className="text-right">Gordura %</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {measurements.map((m) => (
                            <TableRow key={m.id}>
                                <TableCell>{formatSafeDate(m.created_at)}</TableCell>
                                <TableCell className="text-right">{m.weight || '-'} kg</TableCell>
                                <TableCell className="text-right">{m.height || '-'} cm</TableCell>
                                <TableCell className="text-right">{m.body_fat_percentage || '-'} %</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

/*
const EvolutionChartCard = ({ measurements }: { measurements: StudentMeasurement[] }) => {
    if (measurements.length < 2) return null; // Gráfico precisa de pelo menos 2 pontos

    const chartData = measurements
        .map(m => ({
            date: formatSafeDate(m.created_at),
            Peso: m.weight,
            "Gordura Corporal (%|)": m.body_fat_percentage,
        }))
        .reverse(); // Recharts precisa dos dados em ordem cronológica

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 /> Gráfico de Evolução Física</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis yAxisId="left" stroke="hsl(var(--primary))" label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--primary))' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--secondary-foreground))" label={{ value: 'Gordura (%)', angle: -90, position: 'insideRight', fill: 'hsl(var(--secondary-foreground))' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="Peso" stroke="hsl(var(--primary))" strokeWidth={2} name="Peso (kg)" />
                        <Line yAxisId="right" type="monotone" dataKey="Gordura Corporal (%)" stroke="hsl(var(--secondary-foreground))" strokeWidth={2} name="Gordura Corporal (%)" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
*/

const SessionsHistoryCard = ({ sessions }: { sessions: (WorkoutSession & { workouts: { name: string } | null })[] }) => {
    if (sessions.length === 0) return null;

    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> Histórico de Sessões de Treino</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Treino</TableHead>
                            <TableHead>Data de Início</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>{s.workouts?.name || 'Treino Avulso'}</TableCell>
                                <TableCell>{formatSafeDate(s.start_time, true)}</TableCell>
                                <TableCell>{formatSessionStatus(s.status)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


// --- Componente Principal da Página ---

export default function StudentDetailClient({ student, workouts, measurements, sessions }: StudentPortalPageProps) {
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
        await updateStudentProfile(student.id, { theme_preference: theme });
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
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Alterar tema</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleThemeChange('light')}>Claro</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleThemeChange('dark')}>Escuro</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleThemeChange('system')}>Sistema</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline"><LogOut className="h-4 w-4 mr-2"/>Sair</Button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Coluna da Esquerda: Informações Pessoais */}
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
                </div>

                {/* Coluna da Direita: Conteúdo Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Dumbbell/> Meus Planos de Treino</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {workouts.length > 0 ? (
                                workouts.map((workout) => (
                                    <Link key={workout.id} href={`/portal/${student.id}/workout/${workout.id}`} className="block w-full text-left p-4 rounded-lg transition-colors hover:bg-muted border flex items-center justify-between">
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

                    {/* Novos componentes de histórico e gráfico renderizados aqui */}
                    <MeasurementsHistoryCard measurements={measurements} />
                    {/* <EvolutionChartCard measurements={measurements} /> */}
                </div>

                {/* Linha de Baixo: Histórico de Sessões */}
                <SessionsHistoryCard sessions={sessions} />
            </main>
            
            <footer className="text-center text-xs text-muted-foreground"><p>&copy; {new Date().getFullYear()} FitFlow. Todos os direitos reservados.</p></footer>
        </div>
    );
}
