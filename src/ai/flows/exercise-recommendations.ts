'use server';

/**
 * @fileOverview Provides AI-powered exercise and diet recommendations based on a student's profile and goals.
 *
 * - getExerciseRecommendations - A function that handles the exercise recommendation process.
 * - ExerciseRecommendationsInput - The input type for the getExerciseRecommendations function.
 * - ExerciseRecommendationsOutput - The return type for the getExerciseRecommendations function.
 */

// Tipos de entrada e saída mantidos para compatibilidade com o resto do código.
// Nenhuma importação ou dependência do Genkit é necessária aqui.

export type ExerciseRecommendationsInput = {
  studentProfile: string;
  workoutHistory: string;
  trainerPreferences: string;
  availableExercises: string;
};

export type ExerciseRecommendationsOutput = {
  exerciseRecommendations: string;
  explanation: string;
  dietPlan: string;
};

/**
 * Esta função foi temporariamente desativada para resolver problemas de build.
 * Ela retorna um objeto vazio para garantir que as partes do aplicativo que a chamam
 * não quebrem, mas nenhuma recomendação de IA será gerada.
 */
export async function getExerciseRecommendations(
  input: ExerciseRecommendationsInput
): Promise<ExerciseRecommendationsOutput> {
  console.log("A função getExerciseRecommendations foi chamada, mas está temporariamente desativada.");
  
  // Retorna uma resposta padrão e vazia.
  return {
    exerciseRecommendations: '',
    explanation: 'A funcionalidade de recomendação de exercícios está temporariamente desativada.',
    dietPlan: 'A funcionalidade de plano de dieta está temporariamente desativada.',
  };
}
