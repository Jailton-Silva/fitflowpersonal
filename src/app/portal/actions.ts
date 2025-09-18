
"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Busca por alunos ativos cujo nome corresponda à consulta.
 * @param query O nome ou parte do nome a ser buscado.
 * @returns Uma lista de alunos contendo id e nome.
 */
export async function searchStudents(query: string) {
    // Impede o cache dos resultados da busca
    noStore();
    const supabase = await createClient();

    if (!query) {
        return [];
    }

    // Busca na tabela 'students' por nomes que contenham a query (case-insensitive)
    // e que tenham o status 'active'. Limita a 10 resultados.
    const { data, error } = await supabase
        .from('students')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .eq('status', 'active')
        .limit(10);

    if (error) {
        console.error('Error searching students:', error);
        return [];
    }

    return data;
}
