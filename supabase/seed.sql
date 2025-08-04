-- Remove todas as políticas existentes para um início limpo
DROP POLICY IF EXISTS "Enable public read access for all students" ON public.students;
DROP POLICY IF EXISTS "Students belong to trainer" ON public.students;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to their own files" ON storage.objects;

-- 1. Políticas para a tabela `students`
-- Permite que treinadores logados (authenticated) façam tudo (SELECT, INSERT, UPDATE, DELETE)
-- apenas para os alunos que estão associados ao seu ID de treinador.
CREATE POLICY "Trainers can manage their own students"
ON public.students
FOR ALL
TO authenticated
USING (
  (EXISTS ( SELECT 1
           FROM trainers
          WHERE ((trainers.user_id = auth.uid()) AND (trainers.id = students.trainer_id))))
)
WITH CHECK (
  (EXISTS ( SELECT 1
           FROM trainers
          WHERE ((trainers.user_id = auth.uid()) AND (trainers.id = students.trainer_id))))
);

-- 2. Políticas para o bucket de storage `avatars`
-- Permite que qualquer pessoa (public) faça upload (INSERT) na pasta com o seu student_id.
-- A validação de que o student_id é correto será feita na Server Action.
CREATE POLICY "Allow public uploads for student avatars"
ON storage.objects
FOR INSERT
TO public
WITH CHECK ( bucket_id = 'avatars' );

-- Permite que qualquer pessoa (public) leia (SELECT) os avatares.
CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'avatars' );
