import { describe, it, expect } from "vitest";
import {
  BrandIdSchema,
  PlatformSchema,
  CreateIntegrationBodySchema,
  GetIntegrationsQuerySchema,
} from "../lib/validation-schemas";

describe("Validation Schemas", () => {
  describe("BrandIdSchema", () => {
    it("should accept valid brand IDs (UUIDs)", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = await BrandIdSchema.parseAsync(validUuid);
      expect(result).toBe(validUuid);
    });

    it("should reject empty brand ID", async () => {
      try {
        await BrandIdSchema.parseAsync("");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should reject invalid characters", async () => {
      try {
        await BrandIdSchema.parseAsync("brand@123!");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("PlatformSchema", () => {
    it("should accept valid platforms", async () => {
      const validPlatforms = [
        "instagram",
        "facebook",
        "linkedin",
        "twitter",
        "tiktok",
        "email",
      ];
      for (const platform of validPlatforms) {
        const result = await PlatformSchema.parseAsync(platform);
        expect(result).toBe(platform);
      }
    });

    it("should reject invalid platform", async () => {
      try {
        await PlatformSchema.parseAsync("invalid_platform");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("CreateIntegrationBodySchema", () => {
    it("should accept valid integration body", async () => {
      const body = {
        brandId: "550e8400-e29b-41d4-a716-446655440000",
        type: "instagram",
        name: "My Instagram",
        settings: {
          syncEnabled: true,
        },
      };
      const result = await CreateIntegrationBodySchema.parseAsync(body);
      expect(result.brandId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.type).toBe("instagram");
    });

    it("should reject missing required fields", async () => {
      try {
        await CreateIntegrationBodySchema.parseAsync({
          brandId: "550e8400-e29b-41d4-a716-446655440000",
          // missing type and name
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("GetIntegrationsQuerySchema", () => {
    it("should accept valid query with brandId", async () => {
      const query = {
        brandId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = await GetIntegrationsQuerySchema.parseAsync(query);
      expect(result.brandId).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should reject invalid brandId format", async () => {
      try {
        await GetIntegrationsQuerySchema.parseAsync({
          brandId: "not-a-uuid",
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
