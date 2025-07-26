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
    .describe('The profile of the student, including goals, medical conditions, and current fitness level.'),
  workoutHistory: z
    .string()
    .describe('The workout history of the student, including exercises performed and results.'),
  trainerPreferences: z
    .string()
    .describe('The preferences of the trainer, including preferred exercises and training styles.'),
});
export type ExerciseRecommendationsInput = z.infer<typeof ExerciseRecommendationsInputSchema>;

const ExerciseRecommendationsOutputSchema = z.object({
  exerciseRecommendations: z
    .string()
    .describe('A list of exercise recommendations tailored to the student profile and goals, separated by commas.'),
  explanation: z
    .string()
    .describe('An explanation of why the exercises are recommended, based on the student profile, workout history, and trainer preferences.'),
  dietPlan: z
    .string()
    .describe('A suggested diet plan based on the student profile and goals.'),
});
export type ExerciseRecommendationsOutput = z.infer<typeof ExerciseRecommendationsOutputSchema>;

export async function getExerciseRecommendations(input: ExerciseRecommendationsInput): Promise<ExerciseRecommendationsOutput> {
  return exerciseRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exerciseRecommendationsPrompt',
  input: {schema: ExerciseRecommendationsInputSchema},
  output: {schema: ExerciseRecommendationsOutputSchema},
  prompt: `You are an expert personal trainer and nutritionist specializing in exercise and diet recommendations.

  Given the following student profile, workout history, and trainer preferences, provide a list of exercise recommendations tailored to the student profile and goals.
  Also, create a suggested diet plan based on the student's profile and goals.
  Explain why the exercises are recommended, based on the student profile, workout history, and trainer preferences.

  Student Profile: {{{studentProfile}}}
  Workout History: {{{workoutHistory}}}
  Trainer Preferences: {{{trainerPreferences}}}
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
