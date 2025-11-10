import { useAuth } from "@/contexts/AuthContext";
import Screen1SignUp from "./onboarding/Screen1SignUp";
import Screen2RoleSetup from "./onboarding/Screen2RoleSetup";
import Screen3BrandIntake from "./onboarding/Screen3BrandIntake";
import Screen35ConnectAccounts from "./onboarding/Screen35ConnectAccounts";
import Screen4BrandSnapshot from "./onboarding/Screen4BrandSnapshot";
import Screen45SetGoal from "./onboarding/Screen45SetGoal";
import Screen5GuidedTour from "./onboarding/Screen5GuidedTour";

export default function Onboarding() {
  const { onboardingStep } = useAuth();

  const screens: Record<number | string, React.ComponentType> = {
    1: Screen1SignUp,
    2: Screen2RoleSetup,
    3: Screen3BrandIntake,
    "3.5": Screen35ConnectAccounts,
    4: Screen4BrandSnapshot,
    "4.5": Screen45SetGoal,
    5: Screen5GuidedTour,
  };

  const CurrentScreen = screens[onboardingStep || 1] || Screen1SignUp;

  return <CurrentScreen />;
}
