/**
 * OAuth State Cache
 *
 * Securely manages OAuth state parameters with TTL to prevent CSRF attacks.
 * States expire after 10 minutes and cannot be reused.
 */

interface OAuthStateData {
  state: string;
  brandId: string;
  platform: string;
  codeVerifier: string;
  createdAt: number;
  expiresAt: number;
  ttlSeconds?: number;
}

class OAuthStateCache {
  private states = new Map<string, OAuthStateData>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start cleanup job to remove expired states every 5 minutes
    this.startCleanupJob();
  }

  /**
   * Store OAuth state with expiration
   * @param state - Random state token
   * @param brandId - Brand identifier
   * @param platform - Social platform
   * @param codeVerifier - PKCE code verifier
   * @param ttlSeconds - Time to live (default 10 minutes)
   */
  store(
    state: string,
    brandId: string,
    platform: string,
    codeVerifier: string,
    ttlSeconds: number = 10 * 60
  ): void {
    const now = Date.now();

    this.states.set(state, {
      state,
      brandId,
      platform,
      codeVerifier,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000,
      ttlSeconds
    });

    console.log(`✅ OAuth state stored: ${state.substring(0, 8)}... for platform ${platform}`);
  }

  /**
   * Retrieve and validate OAuth state
   * @param state - State token from callback
   * @returns State data if valid, null if invalid/expired
   */
  retrieve(state: string): OAuthStateData | null {
    const stateData = this.states.get(state);

    if (!stateData) {
      console.warn(`❌ OAuth state not found: ${state.substring(0, 8)}...`);
      return null;
    }

    const now = Date.now();
    // Small grace window (ms) to tolerate timing resolution in tests/environments
    const GRACE_MS = 50;
    if (now > stateData.expiresAt + GRACE_MS) {
      console.warn(`❌ OAuth state expired: ${state.substring(0, 8)}...`);
      this.states.delete(state);
      return null;
    }

    // Delete state to prevent replay attacks
    this.states.delete(state);
    console.log(`✅ OAuth state validated and consumed: ${state.substring(0, 8)}...`);

    return stateData;
  }

  /**
   * Validate state format and existence
   * @param state - State to validate
   * @returns true if valid and not expired
   */
  validate(state: string): boolean {
    if (!state || typeof state !== 'string' || state.length < 32) {
      return false;
    }

    const stateData = this.states.get(state);
    if (!stateData) {
      return false;
    }

    // Allow small grace window to account for timing resolution
    const now = Date.now();
    const GRACE_MS = 50;
    return now <= stateData.expiresAt + GRACE_MS;
  }

  /**
   * Get code verifier for PKCE verification
   * @param state - State token
   * @returns Code verifier or null if state invalid
   */
  getCodeVerifier(state: string): string | null {
    const stateData = this.states.get(state);
    const now = Date.now();
    const GRACE_MS = 50;
    if (!stateData || now > stateData.expiresAt + GRACE_MS) {
      return null;
    }
    return stateData.codeVerifier;
  }

  /**
   * Remove expired states manually
   */
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [state, data] of this.states.entries()) {
      if (now > data.expiresAt) {
        this.states.delete(state);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired OAuth states`);
    }
  }

  /**
   * Start periodic cleanup job
   */
  private startCleanupJob(): void {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    // Allow process to exit even if interval is running
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop cleanup job (useful for testing)
   */
  stopCleanupJob(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getStats(): {
    totalStates: number;
    expiredCount: number;
  } {
    const now = Date.now();
    let expiredCount = 0;

    for (const data of this.states.values()) {
      if (now > data.expiresAt) {
        expiredCount++;
      }
    }

    return {
      totalStates: this.states.size,
      expiredCount
    };
  }

  /**
   * Clear all states (useful for testing)
   */
  clear(): void {
    this.states.clear();
    console.log('🧹 OAuth state cache cleared');
  }
}

// Factory to create isolated cache instances (useful for testing)
export function createOAuthStateCache() {
  return new OAuthStateCache();
}

// Default singleton instance for runtime
export const oauthStateCache = createOAuthStateCache();

export type { OAuthStateData };
