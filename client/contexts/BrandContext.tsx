import { createContext, useContext, useEffect, useState } from "react";
import { supabase, Brand } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

type BrandContextType = {
  brands: Brand[];
  currentBrand: Brand | null;
  setCurrentBrand: (brand: Brand | null) => void;
  loading: boolean;
  refreshBrands: () => Promise<void>;
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

// Default brand when no brands are available
const DEFAULT_BRAND: Brand = {
  id: "default-brand",
  name: "Aligned by Design",
  slug: "aligned-by-design",
  logo_url: null,
  website_url: "https://aligned-bydesign.com",
  industry: "Marketing",
  primary_color: "#8B5CF6",
  secondary_color: null,
  accent_color: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    if (!user) {
      // Set default brand for logged-in users without brand data
      setBrands([DEFAULT_BRAND]);
      setCurrentBrand(DEFAULT_BRAND);
      setLoading(false);
      return;
    }

    try {
      const { data: memberData } = await supabase
        .from("brand_members")
        .select("brand_id")
        .eq("user_id", user.id);

      if (!memberData || memberData.length === 0) {
        // No brands found - use default
        setBrands([DEFAULT_BRAND]);
        setCurrentBrand(DEFAULT_BRAND);
        setLoading(false);
        return;
      }

      const brandIds = memberData.map((m) => m.brand_id);
      const { data: brandsData } = await supabase
        .from("brands")
        .select("*")
        .in("id", brandIds)
        .order("name");

      setBrands(brandsData || [DEFAULT_BRAND]);
      if (brandsData && brandsData.length > 0 && !currentBrand) {
        setCurrentBrand(brandsData[0]);
      } else if (!brandsData || brandsData.length === 0) {
        setCurrentBrand(DEFAULT_BRAND);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      // On error, fallback to default brand
      setBrands([DEFAULT_BRAND]);
      setCurrentBrand(DEFAULT_BRAND);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [user]);

  // Inject brand primary color into CSS variables for dynamic theming
  useEffect(() => {
    if (currentBrand?.primary_color) {
      document.documentElement.style.setProperty(
        "--brand-primary",
        currentBrand.primary_color,
      );
    } else {
      // Reset to default primary color when no brand is selected
      document.documentElement.style.setProperty("--brand-primary", "#8B5CF6");
    }
  }, [currentBrand]);

  return (
    <BrandContext.Provider
      value={{
        brands,
        currentBrand,
        setCurrentBrand,
        loading,
        refreshBrands: fetchBrands,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
