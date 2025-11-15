import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, Activity, TrendingUp, ShieldCheck, CheckCircle2, Target, Lightbulb } from 'lucide-react';

export function HealthPlan() {
  const recommendations = [
    {
      category: 'Nutrition',
      icon: <Heart className="w-5 h-5" />,
      color: 'rose',
      items: [
        'Reduce sodium intake to under 1,500mg per day',
        'Increase omega-3 rich foods (salmon, walnuts)',
        'Add more potassium-rich vegetables (spinach, sweet potato)',
        'Limit saturated fats to 13g per day'
      ]
    },
    {
      category: 'Grocery Tips',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'amber',
      items: [
        'Choose fresh produce over canned (less sodium)',
        'Read nutrition labels for hidden sugars',
        'Buy lean proteins: chicken, fish, turkey',
        'Stock up on whole grains instead of refined'
      ]
    },
    {
      category: 'Lifestyle',
      icon: <Activity className="w-5 h-5" />,
      color: 'emerald',
      items: [
        'Walk for 30 minutes after dinner',
        'Meal prep on Sundays to reduce weekday stress',
        'Stay hydrated: 8 glasses of water daily',
        'Sleep 7-8 hours for better blood sugar control'
      ]
    }
  ];

  const goals = [
    { name: 'Maintain healthy blood pressure', progress: 85, streak: 12 },
    { name: 'Control blood sugar levels', progress: 78, streak: 8 },
    { name: 'Eat 5+ servings of vegetables daily', progress: 92, streak: 15 },
    { name: 'Limit processed foods', progress: 70, streak: 5 }
  ];

  const insights = [
    {
      title: 'Your sodium intake is improving',
      description: 'Great job! Your average daily sodium has dropped from 2,400mg to 1,800mg this month.',
      trend: 'positive'
    },
    {
      title: 'More whole grains needed',
      description: 'Try to add 2 more servings of whole grains per day to support your cholesterol goals.',
      trend: 'neutral'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white p-6">
        <h1 className="text-white">Health Plan</h1>
        <p className="mt-2 opacity-90">Your personalized wellness guidance</p>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        <Card className="p-6 mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6" />
            <div>
              <p className="opacity-90">Overall Health Score</p>
              <p className="mt-1">85/100 - Excellent</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div>
              <p className="opacity-90 text-sm">Current Streak</p>
              <p className="mt-1">15 days 🔥</p>
            </div>
            <div className="border-l border-white/30 pl-4">
              <p className="opacity-90 text-sm">This Month</p>
              <p className="mt-1">+12 points</p>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <h2 className="mb-4">Health Goals Progress</h2>
          <div className="space-y-3">
            {goals.map((goal, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <p>{goal.name}</p>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {goal.streak} day streak
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm">{goal.progress}%</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-4">Recent Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <Card
                key={idx}
                className={`p-5 ${
                  insight.trend === 'positive'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.trend === 'positive' ? (
                    <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <p className={insight.trend === 'positive' ? 'text-green-900' : 'text-blue-900'}>
                      {insight.title}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        insight.trend === 'positive' ? 'text-green-700' : 'text-blue-700'
                      }`}
                    >
                      {insight.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {recommendations.map((rec, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 bg-${rec.color}-100 rounded-lg flex items-center justify-center text-${rec.color}-600`}
                >
                  {rec.icon}
                </div>
                <h2>{rec.category} Recommendations</h2>
              </div>
              <div className="space-y-3">
                {rec.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 text-${rec.color}-500 flex-shrink-0 mt-0.5`} />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-6 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="text-purple-900">Medical Conditions</h3>
              <p className="text-sm text-purple-700 mt-1">
                Your plan is optimized for: High Blood Pressure, Diabetes
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100">
            Update Health Profile
          </Button>
        </Card>

        <div className="mt-6 pb-6">
          <Button className="w-full bg-rose-500 hover:bg-rose-600">
            Download Full Health Report
          </Button>
        </div>
      </div>
    </div>
  );
}
