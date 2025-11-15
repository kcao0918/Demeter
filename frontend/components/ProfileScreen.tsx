import { User, Heart, Bell, Lock, HelpCircle, LogOut, ChevronRight, Settings } from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';

export default function ProfileScreen() {
  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
            <span className="text-2xl">SJ</span>
          </div>
          <div>
            <h2 className="text-gray-900">Sarah Johnson</h2>
            <p className="text-gray-600">sarah.j@email.com</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Health Profile */}
        <div className="mb-4">
          <h3 className="text-gray-900 mb-3 px-2">Health Profile</h3>
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between py-3 border-b cursor-pointer">
              <div className="flex items-center gap-3">
                <Heart className="text-red-600" size={20} />
                <span className="text-gray-900">Medical Conditions</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <div className="py-3">
              <p className="text-gray-600 mb-2">Active Conditions:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
                  High Blood Pressure
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                  High Cholesterol
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings */}
        <div className="mb-4">
          <h3 className="text-gray-900 mb-3 px-2">Settings</h3>
          <Card className="p-4 bg-white divide-y">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell className="text-blue-600" size={20} />
                <span className="text-gray-900">Notifications</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell className="text-blue-600" size={20} />
                <span className="text-gray-900">Health Reminders</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <Lock className="text-gray-600" size={20} />
                <span className="text-gray-900">Privacy & Security</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <Settings className="text-gray-600" size={20} />
                <span className="text-gray-900">App Preferences</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </div>

        {/* Support */}
        <div className="mb-4">
          <h3 className="text-gray-900 mb-3 px-2">Support</h3>
          <Card className="p-4 bg-white divide-y">
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-green-600" size={20} />
                <span className="text-gray-900">Help Center</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <User className="text-green-600" size={20} />
                <span className="text-gray-900">Contact Support</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="p-4 bg-white mb-4">
          <button className="flex items-center gap-3 w-full py-2 text-red-600">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </Card>

        {/* App Info */}
        <div className="text-center text-gray-500 py-4">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2025 HealthNutrition App</p>
        </div>
      </div>
    </div>
  );
}
