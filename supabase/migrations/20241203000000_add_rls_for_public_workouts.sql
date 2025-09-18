-- supabase/migrations/20241203000000_add_rls_for_public_workouts.sql

-- 1. Habilitar a Row Level Security (RLS) na tabela de treinos, caso ainda não esteja habilitada.
-- A RLS é a camada de segurança que nos permite definir quem pode acessar quais linhas.
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- 2. Criar uma política de segurança para permitir acesso público a treinos ativos.
-- Esta política permite que qualquer pessoa (anônima ou autenticada) execute uma operação SELECT (leitura)
-- em uma linha da tabela `workouts` se o status daquela linha for 'active'.

-- Remove a política se ela já existir para evitar erros em execuções repetidas.
DROP POLICY IF EXISTS "Allow public read access to active workouts" ON public.workouts;

-- Cria a política.
CREATE POLICY "Allow public read access to active workouts"
ON public.workouts
FOR SELECT
USING (status = 'active');

-- Mensagem de log (comentário SQL)
-- SELECT 'Política de RLS para acesso público a treinos ativos foi criada com sucesso.';
