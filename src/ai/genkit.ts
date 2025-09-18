/**
 * @fileOverview Configures and initializes the Genkit AI framework for the application.
 *
 * - ai: The main entry point for defining AI prompts and flows.
 * - googleAI: The provider for Google's AI models (e.g., Gemini).
 */

import {configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = configureGenkit({
  plugins: [googleAI({apiVersion: 'v1beta'})],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
