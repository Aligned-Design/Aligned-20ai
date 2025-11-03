import { useState } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ExternalLink, Palette } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Brands() {
  const { brands, refreshBrands, setCurrentBrand, loading } = useBrand();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    website_url: "",
    industry: "",
    description: "",
    primary_color: "#8B5CF6",
  });

  const handleCreate = async () => {
    if (!user) return;

    try {
      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .insert([
          {
            ...formData,
            slug:
              formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
          },
        ])
        .select()
        .single();

      if (brandError) throw brandError;

      await supabase.from("brand_members").insert([
        {
          brand_id: brandData.id,
          user_id: user.id,
          role: "owner",
        },
      ]);

      toast({
        title: "Brand created",
        description: `${formData.name} has been created successfully.`,
      });

      setOpen(false);
      setFormData({
        name: "",
        slug: "",
        website_url: "",
        industry: "",
        description: "",
        primary_color: "#8B5CF6",
      });
      refreshBrands();
    } catch (error: any) {
      toast({
        title: "Error creating brand",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your brands and their settings
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Brand</DialogTitle>
              <DialogDescription>
                Add a new brand to manage with Aligned AI.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="TechFlow Solutions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="techflow"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                  placeholder="https://techflow.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder="Technology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primary_color: e.target.value,
                      })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primary_color: e.target.value,
                      })
                    }
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleCreate} className="w-full">
              Create Brand
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : brands.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="group rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: brand.primary_color }}
                >
                  <Palette className="h-6 w-6 text-white" />
                </div>
                {brand.website_url && (
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-1">{brand.name}</h3>
              {brand.industry && (
                <p className="text-sm text-muted-foreground mb-2">
                  {brand.industry}
                </p>
              )}
              {brand.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {brand.description}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentBrand(brand)}
                  className="flex-1"
                >
                  Select Brand
                </Button>
                {!brand.intake_completed && (
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/brand-intake?brandId=${brand.id}`)
                    }
                    className="flex-1"
                  >
                    Complete Intake
                  </Button>
                )}
                {brand.intake_completed && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate(`/brand-snapshot?brandId=${brand.id}`)
                    }
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Palette}
          title="No brands yet"
          description="Create your first brand to unlock AI-powered content generation, automated scheduling, and intelligent analytics."
          action={{
            label: "Create Your First Brand",
            onClick: () => setOpen(true),
          }}
        />
      )}
    </div>
  );
}
