export type Trainer = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
};

export type Exercise = {
  id: string;
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
  sets?: string;
  reps?: string;
  load?: string;
  rest?: string;
};

export type Workout = {
  id: string;
  trainer_id: string;
  student_id: string;
  name: string;
  description?: string;
  diet_plan?: string;
  exercises: WorkoutExercise[] | any[];
  created_at: string;
  updated_at: string;
  students: any;
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
