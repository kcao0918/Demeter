import { useState, useEffect } from "react";
import { getStorage, ref, list } from "firebase/storage";
import { auth, FirebaseApp } from "../firebaseConfig";

import OnboardingScreen from "../components/OnboardingScreen";
import HealthProfileSetup from "../components/HealthProfileSetup";
import Dashboard from "../components/Dashboard";
import ReceiptScanScreen from "../components/ReceiptScanScreen";
import ReceiptConfirmScreen from "../components/ReceiptConfirmScreen";
import RecipesScreen from "../components/RecipesScreen";
import HealthPlanScreen from "../components/HealthPlanScreen";
import ProfileScreen from "../components/ProfileScreen";
import BottomNav from "../components/BottomNav";
import { MealPrepPlan } from "./FavoriteRecipes";

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<string>("onboarding");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // Check if user folder exists
  // -------------------------------
  async function checkIfUserFolderExists(uid: string): Promise<boolean> {
    const storage = getStorage();
    const folderRef = ref(storage, `${uid}/`);

    try {
      const result = await list(folderRef, { maxResults: 1 });
      return result.items.length > 0 || result.prefixes.length > 0;
    } catch (error) {
      console.error("Error checking folder:", error);
      return false;
    }
  }

  // -------------------------------
  // Wait for Firebase Auth to load
  // -------------------------------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const exists = await checkIfUserFolderExists(user.uid);
        if (exists) {
          // Folder exists → skip onboarding
          setCurrentScreen("home");
        }
      } else {
        // No user → you may want to redirect to login
        console.log("No user logged in");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // -------------------------------
  // Handlers
  // -------------------------------
  const handleOnboardingNext = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setCurrentScreen("profile-setup");
    }
  };

  const handleProfileComplete = () => {
    setCurrentScreen("home");
  };

  const handleScanComplete = (items: string[]) => {
    setScannedItems(items);
    setCurrentScreen("receipt-confirm");
  };

  const handleReceiptConfirm = () => {
    setCurrentScreen("home");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "onboarding":
        return (
          <OnboardingScreen
            step={onboardingStep}
            onNext={handleOnboardingNext}
          />
        );
      case "profile-setup":
        return <HealthProfileSetup onComplete={handleProfileComplete} />;
      case "home":
        return <Dashboard onNavigate={setCurrentScreen} />;
      case "scan":
        return (
          <ReceiptScanScreen
            onScanComplete={handleScanComplete}
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "receipt-confirm":
        return (
          <ReceiptConfirmScreen
            items={scannedItems}
            onConfirm={handleReceiptConfirm}
            onBack={() => setCurrentScreen("scan")}
          />
        );
      case "recipes":
        return <RecipesScreen onNavigate={setCurrentScreen} />;
      case "meal-prep":
        return <MealPrepPlan onBack={() => setCurrentScreen("recipes")} />;
      case "health-plan":
        return <HealthPlanScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  const showBottomNav = ![
    "onboarding",
    "profile-setup",
    "scan",
    "receipt-confirm",
  ].includes(currentScreen);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="relative w-full max-w-[390px] h-screen bg-white shadow-2xl overflow-hidden">
        {renderScreen()}
        {showBottomNav && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
          />
        )}
      </div>
    </div>
  );
};

export default App;
