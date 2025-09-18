
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { portalLogin } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';

export default function PortalLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const response = await portalLogin(email, password);

        if (response.success && response.studentId) {
            // Redireciona para o portal do aluno em caso de sucesso
            router.push(`/portal/${response.studentId}`);
        } else {
            // Exibe a mensagem de erro retornada pela server action
            setError(response.error || "Ocorreu um erro desconhecido.");
        }

        setIsLoading(false);
    };

    return (
        <div className="container mx-auto max-w-sm py-12 px-4">
            <Card className="shadow-lg">
                 <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-center text-2xl font-bold font-headline flex items-center justify-center gap-2">
                           <LogIn className="h-6 w-6" />
                            Acesso ao Portal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Falha no Login</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email">E-mail</label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password">Senha do Portal</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
             <footer className="text-center text-xs text-muted-foreground mt-8"><p>&copy; {new Date().getFullYear()} FitFlow. Todos os direitos reservados.</p></footer>
        </div>
    );
}
