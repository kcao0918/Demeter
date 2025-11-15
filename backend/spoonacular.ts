import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.SPOONACULAR_API_KEY;
if (!API_KEY) throw new Error("SPOONACULAR_API_KEY not set in .env");

export interface RecipeBasic {
    id: number;
    title: string;
    image?: string;
}

export interface RecipeIngredient extends RecipeBasic {
    usedIngredients?: { original: string }[];
    missedIngredients?: { original: string }[];
    usedIngredientCount?: number;
    missedIngredientCount?: number;
}

export interface RecipeDetails {
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    extendedIngredients: { original: string }[];
    analyzedInstructions: { steps: { step: string }[] }[];
}

/**
 * Search recipes by a text query (supports diet/cuisine filters)
 */
export async function searchRecipes(
    query: string,
    diet?: string,
    cuisine?: string,
    number: number = 5
): Promise<RecipeBasic[]> {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}${diet ? `&diet=${encodeURIComponent(diet)}` : ''}${cuisine ? `&cuisine=${encodeURIComponent(cuisine)}` : ''}&number=${number}&apiKey=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();
    return data.results ?? [];
}

/**
 * Search recipes by ingredients (ignores diet/cuisine filters)
 */
export async function searchByIngredients(
    ingredients: string,
    number: number = 6
): Promise<RecipeIngredient[]> {
    // sanitize input
    const sanitized = ingredients.replace(/\s*,\s*/g, ",").replace(/\s+/g, ",").replace(/,+/g, ",");

    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(sanitized)}&number=${number}&apiKey=${API_KEY}`;
    const res = await fetch(url);
    return await res.json();
}

/**
 * Get detailed recipe information by ID
 */
export async function getRecipeInformation(id: number): Promise<RecipeDetails> {
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;
    const res = await fetch(url);
    return await res.json();
}
