import React, { createContext, useContext, useState, useEffect } from "react";

export interface OnboardingUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "agency" | "single_business";
  accountType?: string;
  workspaceName?: string;
  clientCount?: number;
  teamMembers?: string[];
  whiteLabel?: boolean;
  businessName?: string;
  website?: string;
  industry?: string;
  connectedPlatforms?: string[];
  goal?: {
    type: "engagement" | "followers" | "leads";
    target: number;
  };
}

export interface BrandSnapshot {
  name?: string;
  voice: string;
  tone: string[];
  audience: string;
  goal: string;
  colors: string[];
  logo?: string;
  industry?: string;
  extractedMetadata?: {
    keywords: string[];
    coreMessaging: string[];
    dos: string[];
    donts: string[];
  };
}

export type OnboardingStep = 1 | 2 | 3 | 3.5 | 4 | 4.5 | 5 | null;

export interface AuthContextType {
  user: OnboardingUser | null;
  brandSnapshot: BrandSnapshot | null;
  onboardingStep: OnboardingStep;
  isAuthenticated: boolean;
  signUp: (user: Partial<OnboardingUser>) => void;
  updateUser: (updates: Partial<OnboardingUser>) => void;
  setBrandSnapshot: (snapshot: BrandSnapshot) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<OnboardingUser | null>(null);
  const [brandSnapshot, setBrandSnapshot] = useState<BrandSnapshot | null>(
    null,
  );
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);

  // Load from localStorage on mount (defensive parsing to avoid crashes from corrupted values)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aligned_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (err) {
          console.warn(
            "Failed to parse aligned_user, clearing corrupted localStorage key",
            err,
          );
          localStorage.removeItem("aligned_user");
        }
      }

      const storedBrand = localStorage.getItem("aligned_brand");
      if (storedBrand) {
        try {
          setBrandSnapshot(JSON.parse(storedBrand));
        } catch (err) {
          console.warn(
            "Failed to parse aligned_brand, clearing corrupted key",
            err,
          );
          localStorage.removeItem("aligned_brand");
        }
      }

      const storedStep = localStorage.getItem("aligned_onboarding_step");
      if (storedStep) {
        try {
          setOnboardingStep(JSON.parse(storedStep));
        } catch (err) {
          console.warn(
            "Failed to parse aligned_onboarding_step, clearing corrupted key",
            err,
          );
          localStorage.removeItem("aligned_onboarding_step");
        }
      }
    } catch (err) {
      console.error("Error reading auth localStorage", err);
    }
  }, []);

  const signUp = (newUser: Partial<OnboardingUser>) => {
    const user: OnboardingUser = {
      id: `user-${Date.now()}`,
      name: newUser.name || "",
      email: newUser.email || "",
      password: newUser.password || "",
      role: newUser.role || "single_business",
      ...newUser,
    };
    setUser(user);
    localStorage.setItem("aligned_user", JSON.stringify(user));
    setOnboardingStep(1);
    localStorage.setItem("aligned_onboarding_step", "1");
  };

  const updateUser = (updates: Partial<OnboardingUser>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem("aligned_user", JSON.stringify(updated));
    }
  };

  const handleSetBrandSnapshot = (snapshot: BrandSnapshot) => {
    setBrandSnapshot(snapshot);
    localStorage.setItem("aligned_brand", JSON.stringify(snapshot));
  };

  const handleSetOnboardingStep = (step: OnboardingStep) => {
    setOnboardingStep(step);
    if (step) {
      localStorage.setItem("aligned_onboarding_step", JSON.stringify(step));
    } else {
      localStorage.removeItem("aligned_onboarding_step");
    }
  };

  const completeOnboarding = () => {
    setOnboardingStep(null);
    localStorage.removeItem("aligned_onboarding_step");
  };

  const logout = () => {
    setUser(null);
    setBrandSnapshot(null);
    setOnboardingStep(null);
    localStorage.removeItem("aligned_user");
    localStorage.removeItem("aligned_brand");
    localStorage.removeItem("aligned_onboarding_step");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        brandSnapshot,
        onboardingStep,
        isAuthenticated: !!user,
        signUp,
        updateUser,
        setBrandSnapshot: handleSetBrandSnapshot,
        setOnboardingStep: handleSetOnboardingStep,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
