import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Settings,
  BarChart3,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useBrand } from "@/contexts/BrandContext";

interface Brand {
  id: string;
  name: string;
  logo: string;
  status: "active" | "paused" | "setup";
  platforms: string[];
  lastActivity: string;
  contentCount: number;
  engagement: number;
}

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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      // Mock data - replace with actual API call
      const mockBrands: Brand[] = [
        {
          id: "1",
          name: "Nike",
          logo: "👟",
          status: "active",
          platforms: ["Instagram", "Facebook", "Twitter"],
          lastActivity: new Date().toISOString(),
          contentCount: 24,
          engagement: 4.2,
        },
        {
          id: "2",
          name: "Apple",
          logo: "🍎",
          status: "active",
          platforms: ["Instagram", "LinkedIn"],
          lastActivity: new Date(Date.now() - 86400000).toISOString(),
          contentCount: 18,
          engagement: 3.8,
        },
        {
          id: "3",
          name: "Tesla",
          logo: "🚗",
          status: "setup",
          platforms: ["Twitter"],
          lastActivity: new Date(Date.now() - 172800000).toISOString(),
          contentCount: 5,
          engagement: 0,
        },
      ];
      setBrands(mockBrands);
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600">
            Manage your client brands and their social media presence
          </p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      {/* Create Brand Dialog */}
      {open && (
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
      )}
    </div>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  const getStatusColor = (status: Brand["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "setup":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{brand.logo}</div>
            <div>
              <CardTitle className="text-lg">{brand.name}</CardTitle>
              <Badge className={getStatusColor(brand.status)}>
                {brand.status}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Connected Platforms</p>
          <div className="flex flex-wrap gap-1">
            {brand.platforms.map((platform) => (
              <Badge key={platform} variant="outline" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Content</p>
            <p className="font-semibold">{brand.contentCount} posts</p>
          </div>
          <div>
            <p className="text-gray-600">Engagement</p>
            <p className="font-semibold">{brand.engagement}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1">
            <BarChart3 className="h-3 w-3" />
            Analytics
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1">
            <Calendar className="h-3 w-3" />
            Calendar
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Last activity:{" "}
          {new Date(brand.lastActivity).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
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

function BrandCard({ brand }: { brand: Brand }) {
  const getStatusColor = (status: Brand["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "setup":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{brand.logo}</div>
            <div>
              <CardTitle className="text-lg">{brand.name}</CardTitle>
              <Badge className={getStatusColor(brand.status)}>
                {brand.status}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Connected Platforms</p>
          <div className="flex flex-wrap gap-1">
            {brand.platforms.map((platform) => (
              <Badge key={platform} variant="outline" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Content</p>
            <p className="font-semibold">{brand.contentCount} posts</p>
          </div>
          <div>
            <p className="text-gray-600">Engagement</p>
            <p className="font-semibold">{brand.engagement}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1">
            <BarChart3 className="h-3 w-3" />
            Analytics
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1">
            <Calendar className="h-3 w-3" />
            Calendar
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Last activity:{" "}
          {new Date(brand.lastActivity).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
