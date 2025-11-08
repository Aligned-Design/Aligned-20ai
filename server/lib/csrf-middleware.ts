/**
 * CSRF State Validation Middleware
 * Validates OAuth state parameters to prevent CSRF attacks
 * Ensures state parameter is present, valid, and has proper format
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "./error-middleware";
import { ErrorCode, HTTP_STATUS } from "./error-responses";

/**
 * Validate OAuth state parameter format
 * States should be hex strings (at least 64 characters for 32 bytes)
 */
function isValidStateFormat(state: string): boolean {
  // State should be at least 64 characters (32 bytes in hex)
  if (!state || state.length < 64) {
    return false;
  }

  // State should only contain hex characters (0-9, a-f)
  // Allow colons for compound states like "state:brandId"
  const validStateRegex = /^[a-f0-9:]+$/i;
  return validStateRegex.test(state);
}

/**
 * Extract raw state token from compound state (e.g., "token:brandId" -> "token")
 */
function extractRawStateToken(compoundState: string): string {
  const parts = compoundState.split(":");
  return parts[0];
}

/**
 * Middleware to validate OAuth state parameter
 * Must be applied to OAuth callback routes
 */
export function validateOAuthState(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  const state = _req.query.state as string | undefined;

  // State parameter is required
  if (!state) {
    throw new AppError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      "OAuth state parameter is required",
      HTTP_STATUS.BAD_REQUEST,
      "warning",
      undefined,
      "State parameter must be provided in the OAuth callback URL"
    );
  }

  // Validate state format
  if (!isValidStateFormat(state)) {
    throw new AppError(
      ErrorCode.INVALID_FORMAT,
      "Invalid OAuth state format",
      HTTP_STATUS.BAD_REQUEST,
      "warning",
      { state: state.substring(0, 10) + "..." },
      "State parameter appears to be corrupted or invalid"
    );
  }

  // Extract raw token from compound state if needed
  const rawStateToken = extractRawStateToken(state);
  if (!rawStateToken || rawStateToken.length < 64) {
    throw new AppError(
      ErrorCode.INVALID_FORMAT,
      "OAuth state token is too short",
      HTTP_STATUS.BAD_REQUEST,
      "warning",
      undefined,
      "State parameter must contain a valid OAuth token"
    );
  }

  // Attach validated state to request for downstream handlers
  (_req as any).validatedState = {
    fullState: state,
    rawToken: rawStateToken,
    parts: state.split(":"),
  };

  next();
}

/**
 * Middleware to validate OAuth state expiration
 * Requires validateOAuthState to be called first
 * Checks that state hasn't expired (typically 10 minutes)
 */
export function validateOAuthStateExpiration(maxAgeMs: number = 10 * 60 * 1000) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    const issuedAt = _req.query.iat as string | undefined;

    // If iat (issued at) is provided, validate it hasn't expired
    if (issuedAt) {
      const issuedAtMs = parseInt(issuedAt, 10);
      const nowMs = Date.now();
      const ageMs = nowMs - issuedAtMs;

      if (ageMs > maxAgeMs) {
        throw new AppError(
          ErrorCode.TOKEN_EXPIRED,
          "OAuth state has expired",
          HTTP_STATUS.BAD_REQUEST,
          "warning",
          { expiresIn: maxAgeMs / 1000 },
          "Authorization request has expired. Please start the OAuth flow again"
        );
      }
    }

    next();
  };
}

/**
 * Validate that state parameter matches expected format
 * Useful for enforcing branded state patterns
 */
export function validateStatePattern(pattern: RegExp) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    const state = _req.query.state as string | undefined;

    if (!state || !pattern.test(state)) {
      throw new AppError(
        ErrorCode.INVALID_FORMAT,
        "OAuth state does not match expected pattern",
        HTTP_STATUS.BAD_REQUEST,
        "warning",
        undefined,
        "State parameter format is invalid"
      );
    }

    next();
  };
}

/**
 * Compose multiple CSRF middleware validators
 */
export function composeCSRFValidation(...middleware: Array<(req: Request, res: Response, next: NextFunction) => void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let index = 0;

    const executeNext = (err?: unknown): void => {
      if (err) {
        next(err);
        return;
      }

      if (index < middleware.length) {
        const fn = middleware[index++];
        try {
          fn(req, res, executeNext);
        } catch (e) {
          next(e);
        }
      } else {
        next();
      }
    };

    executeNext();
  };
}
