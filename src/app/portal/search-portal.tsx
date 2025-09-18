
"use client";

import { useState } from 'react';
import { searchStudents } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserSearch } from 'lucide-react';

// Define o tipo para os resultados da busca
type SearchResult = {
    id: string;
    name: string;
};

export default function SearchPortal() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setHasSearched(true);
        const results = await searchStudents(searchTerm);
        setSearchResults(results);
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold font-headline flex items-center justify-center gap-2">
                        <UserSearch className="h-6 w-6" />
                        Encontre seu Portal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground mb-6">
                        Digite seu nome no campo abaixo para encontrar o link de acesso ao seu portal de treinos.
                    </p>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Seu nome completo ou parte dele"
                            className="flex-grow"
                            required
                        />
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? 'Buscando...' : 'Buscar'}
                        </Button>
                    </form>

                    {hasSearched && !isLoading && (
                        <div className="mt-8">
                            {searchResults.length > 0 ? (
                                <div className="space-y-3">
                                     <h3 className="font-semibold">Resultados da busca:</h3>
                                    {searchResults.map((student) => (
                                        <Link href={`/portal/${student.id}`} key={student.id}>
                                             <div className="block border rounded-lg p-4 hover:bg-muted transition-colors">
                                                <p className="font-medium">{student.name}</p>
                                                <span className="text-sm text-blue-500 hover:underline">Acessar portal &rarr;</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-6">
                                    Nenhum aluno encontrado com este nome.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
             <footer className="text-center text-xs text-muted-foreground mt-8"><p>&copy; {new Date().getFullYear()} FitFlow. Todos os direitos reservados.</p></footer>
        </div>
    );
}
