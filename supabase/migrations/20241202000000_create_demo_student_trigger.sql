-- supabase/migrations/20241202000000_create_demo_student_trigger.sql

-- 1. Definição da Função
-- Esta função será chamada pelo gatilho para criar o aluno de demonstração.
-- Usamos SECURITY DEFINER para que a função tenha as permissões necessárias para inserir na tabela `students`,
-- mesmo que o usuário que acionou o gatilho (o novo treinador) ainda não tenha permissões completas.

CREATE OR REPLACE FUNCTION public.create_demo_student_for_new_trainer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insere um aluno de demonstração com dados de exemplo
  INSERT INTO public.students (trainer_id, name, email, status, birth_date, height, weight, goals, medical_conditions, phone)
  VALUES (
    NEW.id, -- O ID do novo treinador que acabou de ser inserido
    'Aluno de Demonstração',
    'aluno.demo+' || NEW.id || '@fitflow.app', -- Cria um email único para o aluno de demonstração
    'active', -- Status inicial como ativo
    '1995-05-15', -- Data de nascimento de exemplo
    175, -- Altura em cm
    70, -- Peso em kg
    'Este é um aluno de exemplo para você explorar a plataforma. Você pode editar os detalhes, criar planos de treino, registrar medições e muito mais. Sinta-se à vontade para excluí-lo quando quiser.',
    'Nenhuma condição médica a ser observada.',
    '(99) 99999-9999' -- Telefone de exemplo
  );
  RETURN NEW;
END;
$$;

-- 2. Definição do Gatilho (Trigger)
-- Remove o gatilho se ele já existir para garantir que o script possa ser executado várias vezes sem erros.
DROP TRIGGER IF EXISTS on_new_trainer_create_demo_student ON public.trainers;

-- Cria o gatilho que aciona a função `create_demo_student_for_new_trainer`
-- depois que um novo registro é inserido na tabela `public.trainers`.
CREATE TRIGGER on_new_trainer_create_demo_student
  AFTER INSERT ON public.trainers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_demo_student_for_new_trainer();

-- Mensagem de log para confirmar a execução
-- (Esta linha é um comentário SQL e não será executada, mas serve como documentação)
-- SELECT 'Função e gatilho para criar aluno de demonstração foram criados com sucesso.';
