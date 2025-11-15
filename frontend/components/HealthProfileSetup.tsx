import { useState } from 'react';
import { Activity, AlertCircle, Pill, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface HealthProfileSetupProps {
  onComplete: () => void;
}

export default function HealthProfileSetup({ onComplete }: HealthProfileSetupProps) {
  const [conditions, setConditions] = useState({
    diabetes: false,
    highBP: false,
    highCholesterol: false,
  });

  const [allergies, setAllergies] = useState({
    nuts: false,
    dairy: false,
    gluten: false,
    shellfish: false,
  });

  const [dietary, setDietary] = useState({
    vegetarian: false,
    vegan: false,
    lowSodium: false,
    lowCarb: false,
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-6 border-b">
        <h1 className="text-gray-900">Health Profile</h1>
        <p className="text-gray-600 mt-1">Help us personalize your experience</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Medical Conditions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600" size={20} />
            <h3 className="text-gray-900">Medical Conditions</h3>
          </div>
          <div className="space-y-3 pl-7">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="diabetes"
                checked={conditions.diabetes}
                onCheckedChange={(checked) =>
                  setConditions({ ...conditions, diabetes: checked as boolean })
                }
              />
              <Label htmlFor="diabetes" className="text-gray-700">
                Diabetes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="highBP"
                checked={conditions.highBP}
                onCheckedChange={(checked) =>
                  setConditions({ ...conditions, highBP: checked as boolean })
                }
              />
              <Label htmlFor="highBP" className="text-gray-700">
                High Blood Pressure
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="highCholesterol"
                checked={conditions.highCholesterol}
                onCheckedChange={(checked) =>
                  setConditions({ ...conditions, highCholesterol: checked as boolean })
                }
              />
              <Label htmlFor="highCholesterol" className="text-gray-700">
                High Cholesterol
              </Label>
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <h3 className="text-gray-900">Allergies</h3>
          </div>
          <div className="space-y-3 pl-7">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nuts"
                checked={allergies.nuts}
                onCheckedChange={(checked) =>
                  setAllergies({ ...allergies, nuts: checked as boolean })
                }
              />
              <Label htmlFor="nuts" className="text-gray-700">
                Tree Nuts & Peanuts
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dairy"
                checked={allergies.dairy}
                onCheckedChange={(checked) =>
                  setAllergies({ ...allergies, dairy: checked as boolean })
                }
              />
              <Label htmlFor="dairy" className="text-gray-700">
                Dairy
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gluten"
                checked={allergies.gluten}
                onCheckedChange={(checked) =>
                  setAllergies({ ...allergies, gluten: checked as boolean })
                }
              />
              <Label htmlFor="gluten" className="text-gray-700">
                Gluten
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shellfish"
                checked={allergies.shellfish}
                onCheckedChange={(checked) =>
                  setAllergies({ ...allergies, shellfish: checked as boolean })
                }
              />
              <Label htmlFor="shellfish" className="text-gray-700">
                Shellfish
              </Label>
            </div>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="text-green-600" size={20} />
            <h3 className="text-gray-900">Dietary Preferences</h3>
          </div>
          <div className="space-y-3 pl-7">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vegetarian"
                checked={dietary.vegetarian}
                onCheckedChange={(checked) =>
                  setDietary({ ...dietary, vegetarian: checked as boolean })
                }
              />
              <Label htmlFor="vegetarian" className="text-gray-700">
                Vegetarian
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vegan"
                checked={dietary.vegan}
                onCheckedChange={(checked) =>
                  setDietary({ ...dietary, vegan: checked as boolean })
                }
              />
              <Label htmlFor="vegan" className="text-gray-700">
                Vegan
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowSodium"
                checked={dietary.lowSodium}
                onCheckedChange={(checked) =>
                  setDietary({ ...dietary, lowSodium: checked as boolean })
                }
              />
              <Label htmlFor="lowSodium" className="text-gray-700">
                Low Sodium
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowCarb"
                checked={dietary.lowCarb}
                onCheckedChange={(checked) =>
                  setDietary({ ...dietary, lowCarb: checked as boolean })
                }
              />
              <Label htmlFor="lowCarb" className="text-gray-700">
                Low Carb
              </Label>
            </div>
          </div>
        </div>

        {/* Connect Health Records */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-start gap-3">
            <Pill className="text-blue-600 mt-1" size={20} />
            <div>
              <h4 className="text-gray-900 mb-1">Connect Health Records</h4>
              <p className="text-gray-600 mb-3">
                Sync with your electronic health records for automatic updates
              </p>
              <Button variant="outline" size="sm">
                Connect Records
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 border-t bg-white">
        <Button onClick={onComplete} className="w-full">
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
