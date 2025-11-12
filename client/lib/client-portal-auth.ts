/**
 * Client Portal Token Authentication
 * Handles token-based access for white-label client portal
 */

export interface ClientPortalToken {
  token: string;
  brandId: string;
  brandName: string;
  clientId: string;
  clientEmail: string;
  expiresAt: string;
  permissions: string[];
}

export interface TokenValidationResponse {
  valid: boolean;
  token?: ClientPortalToken;
  error?: string;
}

/**
 * Validate client portal access token
 */
export async function validateClientToken(
  token: string
): Promise<TokenValidationResponse> {
  try {
    const response = await fetch(`/api/client-portal/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          valid: false,
          error: 'expired',
        };
      }
      if (response.status === 404) {
        return {
          valid: false,
          error: 'invalid',
        };
      }
      return {
        valid: false,
        error: 'server_error',
      };
    }

    const data = await response.json();
    return {
      valid: true,
      token: data.token,
    };
  } catch (error) {
    console.error('Token validation failed:', error);
    return {
      valid: false,
      error: 'network_error',
    };
  }
}

/**
 * Store token in sessionStorage (not localStorage for security)
 */
export function storeClientToken(token: ClientPortalToken): void {
  sessionStorage.setItem('client_portal_token', JSON.stringify(token));
}

/**
 * Get stored token
 */
export function getStoredClientToken(): ClientPortalToken | null {
  const stored = sessionStorage.getItem('client_portal_token');
  if (!stored) return null;

  try {
    const token = JSON.parse(stored) as ClientPortalToken;

    // Check if expired
    const expiresAt = new Date(token.expiresAt);
    if (expiresAt < new Date()) {
      clearClientToken();
      return null;
    }

    return token;
  } catch {
    clearClientToken();
    return null;
  }
}

/**
 * Clear stored token
 */
export function clearClientToken(): void {
  sessionStorage.removeItem('client_portal_token');
}

/**
 * Check if user has a valid client token
 */
export function hasValidClientToken(): boolean {
  const token = getStoredClientToken();
  return token !== null;
}

/**
 * Get brand ID from stored token
 */
export function getBrandIdFromToken(): string | null {
  const token = getStoredClientToken();
  return token?.brandId || null;
}
