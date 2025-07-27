'use server';

/**
 * @fileOverview Provides AI-powered exercise and diet recommendations based on a student's profile and goals.
 *
 * - getExerciseRecommendations - A function that handles the exercise recommendation process.
 * - ExerciseRecommendationsInput - The input type for the getExerciseRecommendations function.
 * - ExerciseRecommendationsOutput - The return type for the getExerciseRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExerciseRecommendationsInputSchema = z.object({
  studentProfile: z
    .string()
    .describe('O perfil do aluno, incluindo objetivos, condições médicas e nível de condicionamento físico atual.'),
  workoutHistory: z
    .string()
    .describe('O histórico de treinos do aluno, incluindo exercícios realizados e resultados.'),
  trainerPreferences: z
    .string()
    .describe('As preferências do treinador, incluindo exercícios preferidos e estilos de treinamento.'),
  availableExercises: z
    .string()
    .describe('Uma lista de exercícios disponíveis na academia, separados por vírgula.'),
});
export type ExerciseRecommendationsInput = z.infer<typeof ExerciseRecommendationsInputSchema>;

const ExerciseRecommendationsOutputSchema = z.object({
  exerciseRecommendations: z
    .string()
    .describe('Uma lista de nomes de exercícios recomendados, separados por vírgulas e em português, selecionados a partir da lista de exercícios disponíveis.'),
  explanation: z
    .string()
    .describe('Uma explicação em português do motivo pelo qual os exercícios são recomendados, com base no perfil do aluno, histórico de treinos e preferências do treinador.'),
  dietPlan: z
    .string()
    .describe('Um plano de dieta sugerido em português, com base no perfil e nos objetivos do aluno.'),
});
export type ExerciseRecommendationsOutput = z.infer<typeof ExerciseRecommendationsOutputSchema>;

export async function getExerciseRecommendations(input: ExerciseRecommendationsInput): Promise<ExerciseRecommendationsOutput> {
  return exerciseRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exerciseRecommendationsPrompt',
  input: {schema: ExerciseRecommendationsInputSchema},
  output: {schema: ExerciseRecommendationsOutputSchema},
  prompt: `Você é um personal trainer e nutricionista especialista em recomendações de exercícios e dieta para o público brasileiro. Responda sempre em português do Brasil.

  Com base no perfil do aluno, histórico de treinos e preferências do treinador fornecidos, gere uma lista de nomes de exercícios recomendados.
  
  CRÍTICO: Você DEVE escolher os exercícios EXCLUSIVAMENTE da lista de "Exercícios Disponíveis" fornecida abaixo. Não invente ou sugira exercícios que não estão nesta lista.
  A sua recomendação em 'exerciseRecommendations' deve ser uma string com os nomes dos exercícios da lista, separados por vírgula.

  Além disso, crie um plano de dieta sugerido e explique por que os exercícios são recomendados, com base nos dados fornecidos.

  IMPORTANTE: A sua resposta deve ser em texto plano (plain text). NÃO use Markdown, HTML, ou qualquer outra linguagem de marcação. Por exemplo, em vez de usar '**Café da manhã:**', use 'Café da manhã:'.

  Perfil do Aluno: {{{studentProfile}}}
  Histórico de Treinos: {{{workoutHistory}}}
  Preferências do Treinador: {{{trainerPreferences}}}
  Exercícios Disponíveis: {{{availableExercises}}}
  `,
});

const exerciseRecommendationsFlow = ai.defineFlow(
  {
    name: 'exerciseRecommendationsFlow',
    inputSchema: ExerciseRecommendationsInputSchema,
    outputSchema: ExerciseRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
