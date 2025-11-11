/**
 * Hook for managing Paid Ads across Meta, Google, LinkedIn, and TikTok
 * Handles fetching campaigns, performance data, and generating insights
 */

import { useState, useCallback, useEffect } from "react";
import {
  AdAccount,
  AdCampaign,
  AdInsight,
  AdPlatform,
  FetchCampaignsResponse,
  FetchInsightsResponse,
} from "@shared/paid-ads-types";
import { useLogger } from "./use-logger";

interface UsePaidAdsOptions {
  accountId?: string;
  platform?: AdPlatform;
  autoFetch?: boolean;
}

export function usePaidAds(options: UsePaidAdsOptions = {}) {
  const logger = useLogger("PaidAds");
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ads/accounts");
      if (!response.ok) {
        throw new Error(`Failed to fetch ad accounts: ${response.statusText}`);
      }
      const data = (await response.json()) as { accounts: AdAccount[] };
      setAccounts(data.accounts);
      logger.info("Fetched ad accounts", {
        accountCount: data.accounts.length,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error("Failed to fetch ad accounts", error);
    } finally {
      setLoading(false);
    }
  }, [logger]);

  const fetchCampaigns = useCallback(
    async (accountId?: string, platform?: AdPlatform) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (accountId || options.accountId) {
          params.append("accountId", accountId || options.accountId || "");
        }
        if (platform || options.platform) {
          params.append("platform", platform || options.platform || "");
        }

        const response = await fetch(`/api/ads/campaigns?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
        }
        const data = (await response.json()) as FetchCampaignsResponse;
        setCampaigns(data.campaigns);
        logger.info("Fetched ad campaigns", {
          campaignCount: data.campaigns.length,
          accountId,
          platform,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        logger.error("Failed to fetch campaigns", error, { accountId, platform });
      } finally {
        setLoading(false);
      }
    },
    [logger, options.accountId, options.platform]
  );

  const fetchInsights = useCallback(
    async (campaignId: string) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/ads/insights/${campaignId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch insights: ${response.statusText}`);
        }
        const data = (await response.json()) as FetchInsightsResponse;
        setInsights(data.insights);
        logger.info("Fetched ad insights", {
          insightCount: data.insights.length,
          campaignId,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        logger.error("Failed to fetch insights", error, { campaignId });
      } finally {
        setLoading(false);
      }
    },
    [logger]
  );

  const pauseCampaign = useCallback(
    async (campaignId: string) => {
      try {
        const response = await fetch(`/api/ads/campaigns/${campaignId}/pause`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error(`Failed to pause campaign: ${response.statusText}`);
        }
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, status: "paused" } : c
          )
        );
        logger.info("Paused campaign", { campaignId });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        logger.error("Failed to pause campaign", error, { campaignId });
        throw error;
      }
    },
    [logger]
  );

  const resumeCampaign = useCallback(
    async (campaignId: string) => {
      try {
        const response = await fetch(`/api/ads/campaigns/${campaignId}/resume`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error(`Failed to resume campaign: ${response.statusText}`);
        }
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, status: "active" } : c
          )
        );
        logger.info("Resumed campaign", { campaignId });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        logger.error("Failed to resume campaign", error, { campaignId });
        throw error;
      }
    },
    [logger]
  );

  const updateBudget = useCallback(
    async (campaignId: string, newBudget: number) => {
      try {
        const response = await fetch(`/api/ads/campaigns/${campaignId}/budget`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ budget: newBudget }),
        });
        if (!response.ok) {
          throw new Error(`Failed to update budget: ${response.statusText}`);
        }
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, budget: newBudget } : c
          )
        );
        logger.info("Updated campaign budget", { campaignId, newBudget });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        logger.error("Failed to update budget", error, { campaignId, newBudget });
        throw error;
      }
    },
    [logger]
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch) {
      fetchAccounts();
      if (options.accountId) {
        fetchCampaigns(options.accountId, options.platform);
      }
    }
  }, [options.autoFetch, options.accountId, options.platform, fetchAccounts, fetchCampaigns]);

  return {
    accounts,
    campaigns,
    insights,
    loading,
    error,
    fetchAccounts,
    fetchCampaigns,
    fetchInsights,
    pauseCampaign,
    resumeCampaign,
    updateBudget,
  };
}
