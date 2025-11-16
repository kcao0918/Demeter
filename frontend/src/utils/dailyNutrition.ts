import { db } from "../../firebaseConfig";
import { collection, getDocs, setDoc, doc, updateDoc } from "firebase/firestore";

export interface PersonalInfo {
  age: number;
  weight: number; // kg
  height: number; // cm
  sex: string;
}

export interface Conditions {
  diabetes: boolean;
  highBP: boolean;
  highCholesterol: boolean;
}

export interface Dietary {
  vegetarian: boolean;
  vegan: boolean;
  lowSodium: boolean;
  lowCarb: boolean;
}

/**
 * Calculate estimated daily calorie needs based on Mifflin-St Jeor formula.
 * Assumes sedentary activity (multiply by 1.2). Returns rounded calories.
 */
export function calculateCalories(personalInfo: PersonalInfo): number {
  const { weight, height, age, sex } = personalInfo;

  const weightKg = weight * 0.453592; // convert lbs to kg

  let bmr = 0;
  if (sex === "male") {
    bmr = 10 * weightKg + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * height - 5 * age - 161;
  }

  const tdee = bmr * 1.2; // sedentary activity
  return Math.round(tdee);
}

/**
 * Calculate recommended daily sodium intake (mg) based on conditions and dietary preferences.
 * Defaults to 2300mg/day. Reduces to 1500mg if highBP or lowSodium diet.
 */
export function calculateSodium(conditions: Conditions, dietary: Dietary): number {
  let sodium = 2300; // default mg/day
  if (conditions.highBP || dietary.lowSodium) {
    sodium = 1500;
  }
  return sodium;
}

/**
 * Calculate recommended daily sugar intake (grams) based on calorie needs and conditions.
 * Base: 10% of daily calories, 1g sugar = 4 kcal.
 * Reduce by 50% for diabetes.
 */
export function calculateSugarLimit(calories: number, conditions: Conditions): number {
  let sugarCalories = calories * 0.1; // 10% of calories from sugar
  if (conditions.diabetes) sugarCalories *= 0.5; // cut by half if diabetic
  const sugarGrams = sugarCalories / 4; // convert kcal to grams
  return Math.round(sugarGrams);
}

// Example: Each recipe document has { calories, sugar, sodium, ... }
export async function updateDailyNutritionTotals(uid: string) {
  if (!uid) throw new Error("UID is required");

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  try {
    const response = await fetch(`http://localhost:8080/${uid}/recipes/saved/${dateKey}`);
    if (!response.ok) {
      console.warn(`[RECIPES] No saved recipes found for ${uid} on ${dateKey}`);
      return { calories: 0, sugar: 0, sodium: 0 };
    }

    const recipes = await response.json();

    let totalCalories = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    recipes.forEach((r: { calories?: number; sugar?: number; sodium?: number }) => {
      totalCalories += r.calories ?? 0;
      totalSugar += r.sugar ?? 0;
      totalSodium += r.sodium ?? 0;
    });

    console.log(`[RECIPES] Daily totals for ${uid} on ${dateKey}: calories=${totalCalories}, sugar=${totalSugar}, sodium=${totalSodium}`);

    return { calories: totalCalories, sugar: totalSugar, sodium: totalSodium };
  } catch (err) {
    console.error("[RECIPES] Error fetching saved recipes:", err);
    return { calories: 0, sugar: 0, sodium: 0 };
  }
}
