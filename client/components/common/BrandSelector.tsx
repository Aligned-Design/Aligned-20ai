/**
 * BrandSelector Component
 *
 * Brand/workspace switcher for dashboards.
 * Syncs selected brand across dashboard views.
 */

import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
}

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrandId?: string;
  onSelect: (brandId: string) => void;
  className?: string;
}

export function BrandSelector({
  brands,
  selectedBrandId,
  onSelect,
  className,
}: BrandSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-w-[200px]", className)}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedBrand?.logoUrl && (
              <img
                src={selectedBrand.logoUrl}
                alt=""
                className="w-5 h-5 rounded object-cover"
              />
            )}
            <span className="truncate">
              {selectedBrand?.name || "Select brand..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search brands..." />
          <CommandEmpty>No brand found.</CommandEmpty>
          <CommandGroup>
            {brands.map((brand) => (
              <CommandItem
                key={brand.id}
                value={brand.name}
                onSelect={() => {
                  onSelect(brand.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedBrandId === brand.id ? "opacity-100" : "opacity-0",
                  )}
                />
                <div className="flex items-center gap-2">
                  {brand.logoUrl && (
                    <img
                      src={brand.logoUrl}
                      alt=""
                      className="w-5 h-5 rounded object-cover"
                    />
                  )}
                  <span className="truncate">{brand.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
