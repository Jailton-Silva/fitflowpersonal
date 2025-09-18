
-- Adiciona colunas para número de contato e preferência de tema na tabela de alunos.
-- Execute este código no Editor SQL do seu projeto Supabase.

ALTER TABLE students
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'default';

-- Habilita a replicação de identidade completa para a tabela de alunos.
-- Isso é importante para que as políticas de RLS possam ler os dados atualizados,
-- especialmente após uma alteração feita pelo usuário que é dono do registro.
ALTER TABLE students REPLICA IDENTITY FULL;
