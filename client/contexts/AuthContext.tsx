import React, { createContext, useContext, useState, useEffect } from "react";

export interface OnboardingUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "agency" | "single_business";
  plan?: "trial" | "base" | "agency";
  trial_published_count?: number;
  trial_started_at?: string;
  trial_expires_at?: string;
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
          const parsedUser = JSON.parse(stored);
          // Check if user signed up with trial query param
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("trial")) {
            parsedUser.plan = "trial";
            parsedUser.trial_published_count = 0;
            const now = new Date();
            parsedUser.trial_started_at = now.toISOString();
            parsedUser.trial_expires_at = new Date(
              now.getTime() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString();
          }
          setUser(parsedUser);
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
          console.warn("Failed to parse onboarding_step, clearing key", err);
          localStorage.removeItem("aligned_onboarding_step");
        }
      }
    } catch (err) {
      console.error("Unexpected error loading auth state:", err);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("aligned_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("aligned_user");
    }
  }, [user]);

  useEffect(() => {
    if (brandSnapshot) {
      localStorage.setItem("aligned_brand", JSON.stringify(brandSnapshot));
    } else {
      localStorage.removeItem("aligned_brand");
    }
  }, [brandSnapshot]);

  useEffect(() => {
    if (onboardingStep !== null) {
      localStorage.setItem(
        "aligned_onboarding_step",
        JSON.stringify(onboardingStep),
      );
    } else {
      localStorage.removeItem("aligned_onboarding_step");
    }
  }, [onboardingStep]);

  const signUp = (newUser: Partial<OnboardingUser>) => {
    // Check for trial mode from URL
    const urlParams = new URLSearchParams(window.location.search);
    const isTrial = urlParams.get("trial") === "7";

    const userData: OnboardingUser = {
      id: Date.now().toString(),
      name: newUser.name || "",
      email: newUser.email || "",
      password: newUser.password || "",
      role: newUser.role || "single_business",
      plan: isTrial ? "trial" : "base",
      ...(isTrial && {
        trial_published_count: 0,
        trial_started_at: new Date().toISOString(),
        trial_expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      }),
      ...newUser,
    };

    setUser(userData);
    setOnboardingStep(2);
  };

  const updateUser = (updates: Partial<OnboardingUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const completeOnboarding = () => {
    setOnboardingStep(null);
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
        setBrandSnapshot,
        setOnboardingStep,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
