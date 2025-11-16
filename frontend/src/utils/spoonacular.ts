// src/utils/spoonacular.ts
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

if (!API_KEY) {
  console.warn("VITE_SPOONACULAR_API_KEY is not set");
}

export interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  extendedIngredients?: Array<{ original: string; name: string }>;
  analyzedInstructions?: Array<{ steps: Array<{ step: string }> }>;
  usedIngredients?: Array<{ original: string }>;
  healthScore?: number;
  nutrition?: {
    nutrients?: Array<{ name: string; amount: number; unit: string }>;
  };
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
}

/**
 * Search recipes by ingredients with optional filters
 */
export async function searchRecipes(
  includeIngredients: string[] = [],
  excludeIngredients: string[] = [],
  cuisine?: string,
  diet?: string,
  number: number = 10
): Promise<RecipeDetails[]> {
  if (!API_KEY) return [];

  // Manually join ingredients with comma (not URL-encoded)
  let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=${number}&addRecipeInformation=true`;

  if (includeIngredients.length > 0) {
    url += `&includeIngredients=${includeIngredients.join(",")}`;
  }
  if (excludeIngredients.length > 0) {
    url += `&excludeIngredients=${excludeIngredients.join(",")}`;
  }
  if (cuisine) url += `&cuisine=${cuisine}`;
  if (diet) url += `&diet=${diet}`;

  console.log("Fetching URL:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error("Error fetching recipes:", err);
    return [];
  }
}

/**
 * Get full recipe information by ID
 */
export async function getRecipeInformation(
  id: number
): Promise<RecipeDetails | null> {
  if (!API_KEY) {
    console.error("API key is not set");
    return null;
  }

  try {
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;
    console.log(`Fetching recipe info from URL: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      title: data.title,
      image: data.image || "",
      readyInMinutes: data.readyInMinutes,
      servings: data.servings,
      extendedIngredients: data.extendedIngredients || [],
      analyzedInstructions: data.analyzedInstructions || [],
      healthScore: data.healthScore,
      nutrition: data.nutrition,
      vegetarian: data.vegetarian,
      vegan: data.vegan,
      glutenFree: data.glutenFree,
      dairyFree: data.dairyFree,
    };
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    return null;
  }
}

/**
 * Search recipes by query text
 */
export async function searchRecipesByQuery(
  query: string,
  number: number = 10
): Promise<RecipeDetails[]> {
  if (!API_KEY) {
    console.error("API key is not set");
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: query,
      number: number.toString(),
      apiKey: API_KEY,
    });

    const url = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
    console.log("Fetching URL:", url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    const detailedRecipes = await Promise.all(
      data.results.slice(0, number).map(async (recipe: any) => {
        return await getRecipeInformation(recipe.id);
      })
    );

    return detailedRecipes.filter((r): r is RecipeDetails => r !== null);
  } catch (error) {
    console.error("Error searching by query:", error);
    return [];
  }
}
