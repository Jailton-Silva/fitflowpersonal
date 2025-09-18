
-- Adiciona novas colunas à tabela de alunos para paridade de informação com a visão do personal.
-- Altera a coluna de tema para suportar os modos claro/escuro.

ALTER TABLE students
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS goals TEXT,
ADD COLUMN IF NOT EXISTS observations TEXT;

-- Remove o valor padrão antigo e altera o tipo se necessário.
-- Define um novo padrão 'system' que é útil para a biblioteca next-themes.
ALTER TABLE students
ALTER COLUMN theme_preference SET DEFAULT 'system',
ALTER COLUMN theme_preference TYPE TEXT;

