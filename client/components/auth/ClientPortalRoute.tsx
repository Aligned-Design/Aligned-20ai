/**
 * ClientPortalRoute Guard
 * Protects client portal routes with token-based authentication
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  validateClientToken,
  storeClientToken,
  getStoredClientToken,
  clearClientToken,
  type ClientPortalToken,
} from "@/lib/client-portal-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, Shield, Mail } from "lucide-react";

interface ClientPortalRouteProps {
  children: React.ReactNode;
}

export function ClientPortalRoute({ children }: ClientPortalRouteProps) {
  const { token: urlToken } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [validating, setValidating] = useState(true);
  const [tokenData, setTokenData] = useState<ClientPortalToken | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateAccess();
  }, [urlToken]);

  const validateAccess = async () => {
    setValidating(true);
    setError(null);

    // Check for stored token first
    const storedToken = getStoredClientToken();

    if (storedToken) {
      // Already have a valid token in session
      setTokenData(storedToken);
      setValidating(false);
      return;
    }

    // If URL has a token, validate it
    if (urlToken) {
      const result = await validateClientToken(urlToken);

      if (result.valid && result.token) {
        // Token is valid, store it
        storeClientToken(result.token);
        setTokenData(result.token);
        setValidating(false);

        // Remove token from URL for security
        navigate("/client-portal", { replace: true });
      } else {
        // Token is invalid or expired
        setError(result.error || "invalid");
        setValidating(false);
      }
    } else {
      // No token in URL and no stored token
      setError("missing");
      setValidating(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Validating access...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error) {
    return <ClientPortalErrorState error={error} onRetry={validateAccess} />;
  }

  // Valid token - render portal
  if (tokenData) {
    return <>{children}</>;
  }

  // Fallback - shouldn't reach here
  return <ClientPortalErrorState error="unknown" onRetry={validateAccess} />;
}

/**
 * Error state component for invalid/expired tokens
 */
function ClientPortalErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const getErrorConfig = () => {
    switch (error) {
      case "expired":
        return {
          icon: <Clock className="h-16 w-16 text-orange-500 mb-4" />,
          title: "Access Link Expired",
          message:
            "This portal link has expired for security reasons. Please request a new access link from your agency.",
          action: "Request New Link",
          actionEmail: true,
        };
      case "invalid":
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-500 mb-4" />,
          title: "Invalid Access Link",
          message:
            "This portal link is not valid. Please check your email for the correct link or request a new one.",
          action: "Request New Link",
          actionEmail: true,
        };
      case "missing":
        return {
          icon: <Shield className="h-16 w-16 text-gray-500 mb-4" />,
          title: "Access Required",
          message:
            "You need a special access link to view this portal. Please check your email or contact your agency.",
          action: "Request Access",
          actionEmail: true,
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-gray-500 mb-4" />,
          title: "Access Error",
          message:
            "Unable to validate your access. Please try again or contact your agency.",
          action: "Try Again",
          actionEmail: false,
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            {config.icon}
            <CardTitle className="text-2xl font-bold text-gray-900">
              {config.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription className="text-center">
              {config.message}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {config.actionEmail ? (
              <a
                href="mailto:support@aligned.ai?subject=Client Portal Access Request"
                className="w-full"
              >
                <Button className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  {config.action}
                </Button>
              </a>
            ) : (
              <Button onClick={onRetry} className="w-full">
                {config.action}
              </Button>
            )}

            <p className="text-sm text-gray-600 text-center">
              Need help?{" "}
              <a
                href="mailto:support@aligned.ai"
                className="text-primary hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>
                This portal uses secure token-based authentication to protect
                your content.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
