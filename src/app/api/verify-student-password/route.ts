
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    const cookieStore = cookies();
    // Usar o cliente admin para buscar a senha do aluno no servidor
    const supabase = createClient(cookieStore, { isAdmin: true });

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
            return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
        }

        // Compara a senha fornecida com a senha armazenada (de forma segura)
        // Esta é uma comparação simples. Para produção, use um sistema de hash como bcrypt.
        const isMatch = data.access_password === password;

        if (isMatch) {
            return NextResponse.json({ success: true, message: "Autenticado com sucesso." });
        } else {
            return NextResponse.json({ error: "Senha do portal incorreta." }, { status: 401 });
        }

    } catch (error: any) {
        console.error("API Verify Password Error:", error);
        return NextResponse.json({ error: "Ocorreu um erro interno no servidor." }, { status: 500 });
    }
}
