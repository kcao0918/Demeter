import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Heart, ShieldCheck, Sparkles, ArrowRight, Link2 } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [healthProfile, setHealthProfile] = useState({
    diabetes: false,
    highBloodPressure: false,
    highCholesterol: false,
    allergies: '',
    dietaryRestrictions: [] as string[],
  });

  const welcomeScreens = [
    {
      icon: <Heart className="w-16 h-16 text-emerald-500" />,
      title: "Welcome to NutriHealth",
      description: "Your personal health and nutrition companion that learns from your grocery shopping habits."
    },
    {
      icon: <Sparkles className="w-16 h-16 text-emerald-500" />,
      title: "Smart Recipe Suggestions",
      description: "Get personalized meal recommendations based on what you buy and your health needs."
    },
    {
      icon: <ShieldCheck className="w-16 h-16 text-emerald-500" />,
      title: "Personalized Health Plan",
      description: "Receive tailored nutrition guidance designed specifically for your medical conditions."
    }
  ];

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];

  const handleDietaryToggle = (option: string) => {
    setHealthProfile(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(option)
        ? prev.dietaryRestrictions.filter(d => d !== option)
        : [...prev.dietaryRestrictions, option]
    }));
  };

  const renderWelcomeScreen = () => {
    const screen = welcomeScreens[step];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50 to-white">
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
          {screen.icon}
          <h1 className="mt-8 text-center">{screen.title}</h1>
          <p className="mt-4 text-center text-gray-600">{screen.description}</p>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <div className="flex gap-2 justify-center mb-6">
            {welcomeScreens.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={() => step === welcomeScreens.length - 1 ? setStep(3) : setStep(step + 1)}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            {step === welcomeScreens.length - 1 ? "Get Started" : "Continue"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          
          {step < welcomeScreens.length - 1 && (
            <Button
              variant="ghost"
              onClick={() => setStep(3)}
              className="w-full"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderHealthProfileSetup = () => {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="mb-2">Health Profile Setup</h1>
            <p className="text-gray-600">Help us personalize your experience by sharing your health information.</p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4">Medical Conditions</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="diabetes"
                    checked={healthProfile.diabetes}
                    onCheckedChange={(checked) => 
                      setHealthProfile(prev => ({ ...prev, diabetes: checked as boolean }))
                    }
                  />
                  <Label htmlFor="diabetes" className="cursor-pointer">Diabetes</Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="bloodPressure"
                    checked={healthProfile.highBloodPressure}
                    onCheckedChange={(checked) => 
                      setHealthProfile(prev => ({ ...prev, highBloodPressure: checked as boolean }))
                    }
                  />
                  <Label htmlFor="bloodPressure" className="cursor-pointer">High Blood Pressure</Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="cholesterol"
                    checked={healthProfile.highCholesterol}
                    onCheckedChange={(checked) => 
                      setHealthProfile(prev => ({ ...prev, highCholesterol: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cholesterol" className="cursor-pointer">High Cholesterol</Label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Allergies</h3>
              <Input
                placeholder="e.g., Peanuts, Shellfish, Eggs"
                value={healthProfile.allergies}
                onChange={(e) => setHealthProfile(prev => ({ ...prev, allergies: e.target.value }))}
              />
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Dietary Restrictions</h3>
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleDietaryToggle(option)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      healthProfile.dietaryRestrictions.includes(option)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-blue-900 mb-1">Connect Health Records</h3>
                  <p className="text-blue-700">Securely import your medical data for better personalization.</p>
                  <Button variant="outline" className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100">
                    Connect Records
                  </Button>
                </div>
              </div>
            </Card>

            <Button
              onClick={onComplete}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              Complete Setup
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (step < 3) {
    return renderWelcomeScreen();
  }

  return renderHealthProfileSetup();
}
