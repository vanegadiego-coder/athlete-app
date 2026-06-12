export type RunLog = {
  id?: string;
  user_id: string;
  date: string;
  type: string;
  distance_km: number;
  duration_sec: number;
  avg_pace: string;
  avg_hr: number;
  max_hr: number;
  avg_zone: string;
  zone_distribution?: { z1: number; z2: number; z3: number; z4: number; z5: number; };
  temperature: number;
  notes?: string;
  gps_file_path?: string;
  created_at: string;
};

export type Meal = {
  id?: string;
  meal_type: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  time?: string;
  food_description: string;
  photo_url?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  estimated_by_ai: boolean;
};

export type NutritionLog = {
  id?: string;
  user_id: string;
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  magnesium_mg: number;
  notes?: string;
  meals?: Meal[];
  created_at: string;
};

export type GymLog = {
  id?: string;
  user_id: string;
  date: string;
  cycle_day: number;
  attended: boolean;
  duration_min?: number;
  notes?: string;
  created_at: string;
};

export type DaySummary = {
  date: string;
  gymToday: { cycleDay: number; name: string; attended?: boolean; };
  runToday: { type?: string; distance?: number; duration?: number; completed?: boolean; };
  nutrition: { calories: number; targetCalories: number; protein: number; targetProtein: number; percentage: number; };
  supplements: { creatineTaken: boolean; magnesiumTaken: boolean; };
  week: number;
  block: number;
  streak: number;
};
