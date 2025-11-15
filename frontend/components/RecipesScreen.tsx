import { Clock, Users, Heart, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function RecipesScreen() {
  const recipes = [
    {
      id: 1,
      name: 'Grilled Salmon with Roasted Broccoli',
      time: '25 min',
      servings: 2,
      calories: 420,
      tags: ['Low Sodium', 'Heart Healthy'],
      healthNote: 'Rich in Omega-3, great for cholesterol management',
      ingredients: ['Salmon Fillet', 'Broccoli', 'Olive Oil'],
    },
    {
      id: 2,
      name: 'Mediterranean Chicken Bowl',
      time: '30 min',
      servings: 4,
      calories: 380,
      tags: ['Low Carb', 'High Protein'],
      healthNote: 'Balanced meal, supports blood pressure management',
      ingredients: ['Chicken Breast', 'Tomatoes', 'Spinach', 'Olive Oil'],
    },
    {
      id: 3,
      name: 'Greek Yogurt Parfait',
      time: '5 min',
      servings: 1,
      calories: 220,
      tags: ['Quick', 'Protein'],
      healthNote: 'Low sugar, high protein breakfast option',
      ingredients: ['Greek Yogurt', 'Eggs'],
    },
  ];

  const mealPlan = [
    { day: 'Monday', breakfast: 'Greek Yogurt Parfait', lunch: 'Mediterranean Bowl', dinner: 'Grilled Salmon' },
    { day: 'Tuesday', breakfast: 'Scrambled Eggs', lunch: 'Chicken Salad', dinner: 'Stir Fry' },
    { day: 'Wednesday', breakfast: 'Oatmeal', lunch: 'Salmon Bowl', dinner: 'Roasted Chicken' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b">
        <h2 className="text-gray-900 mb-1">Your Recipes</h2>
        <p className="text-gray-600">Personalized for your health goals</p>
      </div>

      <Tabs defaultValue="recipes" className="flex-1 flex flex-col">
        <TabsList className="mx-6 my-4 grid w-auto grid-cols-2">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="flex-1 overflow-y-auto px-4 mt-0">
          <div className="mb-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex gap-3">
                <Heart className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-gray-900 mb-1">Based on Your Groceries</h4>
                  <p className="text-gray-700">
                    These recipes use items from your recent receipt scan
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-3 pb-4">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 relative">
                  <ImageWithFallback
                    src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop`}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
                    <span className="text-gray-900">{recipe.calories} cal</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 mb-2">{recipe.name}</h3>
                  
                  <div className="flex items-center gap-4 mb-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{recipe.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{recipe.servings} servings</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {recipe.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-gray-700">{recipe.healthNote}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">View Recipe</span>
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meal-plan" className="flex-1 overflow-y-auto px-4 mt-0">
          <div className="mb-4">
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-gray-900 mb-1">This Week's Plan</h4>
                  <p className="text-gray-700">Organized meals for easy prep</p>
                </div>
                <button className="text-purple-600">Edit</button>
              </div>
            </Card>
          </div>

          <div className="space-y-3 pb-4">
            {mealPlan.map((day, index) => (
              <Card key={index} className="p-4 bg-white">
                <h4 className="text-gray-900 mb-3">{day.day}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Breakfast</span>
                    <span className="text-gray-900">{day.breakfast}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Lunch</span>
                    <span className="text-gray-900">{day.lunch}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Dinner</span>
                    <span className="text-gray-900">{day.dinner}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
