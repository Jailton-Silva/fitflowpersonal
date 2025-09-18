
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // A função createClient é assíncrona e deve ser chamada com await.
    // As credenciais de ANOM KEY usadas aqui devem ter as permissões de RLS
    // no Supabase para ler a tabela 'students'.
    const supabase = await createClient();

    try {
        const { studentId, password } = await req.json();

        if (!studentId || !password) {
            return NextResponse.json({ error: "ID do aluno e senha são obrigatórios." }, { status: 400 });
        }

        // Busca apenas a senha do aluno no banco
        const { data, error } = await supabase
            .from('students')
            .select('access_password')
            .eq('id', studentId)
            .single();

        if (error || !data) {
            console.error("API Verify Password - Student not found:", error);
            return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
        }

        // Compara a senha fornecida com a senha armazenada
        // NOTA: Esta é uma comparação simples. Em um ambiente de produção real, 
        // a senha deve ser armazenada como um hash (ex: usando bcrypt) e a comparação
        // deve ser feita com a função apropriada do bcrypt.
        const isMatch = data.access_password === password;

        if (isMatch) {
            return NextResponse.json({ success: true, message: "Autenticado com sucesso." });
        } else {
            return NextResponse.json({ error: "Senha do portal incorreta." }, { status: 401 });
        }

    } catch (error: any) {
        console.error("API Verify Password - Internal Error:", error);
        return NextResponse.json({ error: "Ocorreu um erro interno no servidor." }, { status: 500 });
    }
}
