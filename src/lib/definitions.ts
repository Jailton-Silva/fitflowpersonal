
import { User as SupabaseUser } from '@supabase/supabase-js';

// Re-exporting SupabaseUser to be used in client components
export type User = SupabaseUser;

export type Trainer = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  plan: 'Free' | 'Start' | 'Pro' | 'Elite';
  billing_cycle_end: string;
  status: 'active' | 'inactive' | 'banned';
  role: 'admin' | 'trainer';
  // Campos do Stripe
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status: 'inactive' | 'active' | 'past_due' | 'canceled' | 'unpaid';
};

export type Student = {
  id: string;
  trainer_id: string;
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: 'masculino' | 'feminino' | 'outro';
  height?: number;
  weight?: number;
  body_fat?: number;
  goals?: string;
  medical_conditions?: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
  access_password?: string | null;
  created_at: string;
  updated_at: string;
};

export type Exercise = {
  id: string;
  trainer_id?: string;
  name: string;
  description?: string;
  muscle_groups?: string[];
  equipment?: string;
  video_url?: string;
  instructions?: string;
  created_at: string;
};

export type WorkoutExercise = {
  exercise_id: string;
  name: string;
  video_url?: string; // Add video_url here for UI purposes
  sets?: string;
  reps?: string;
  load?: string;
  rest?: string;
};

export type Workout = {
  id: string;
  trainer_id: string;
  student_id: string | null;
  name: string;
  description?: string;
  diet_plan?: string;
  exercises: WorkoutExercise[];
  access_password?: string | null;
  status: 'active' | 'inactive' | 'not-started' | 'completed';
  created_at: string;
  updated_at: string;
  students: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
};

export type Appointment = {
  id: string;
  trainer_id: string;
  student_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  students: {
    id: string;
    name: string;
  } | null;
};

export type Measurement = {
  id: string;
  student_id: string;
  created_at: string;
  weight: number;
  height: number;
  body_fat?: number;
  notes?: string;
}

export type WorkoutSession = {
    id: string;
    workout_id: string;
    student_id: string;
    started_at: string;
    completed_at?: string | null;
    completed_exercises: string[]; // Array of exercise_id
}
