import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Download,
  ArrowUpRight,
} from "lucide-react";

interface BillingData {
  subscription: {
    plan: string;
    status: "active" | "past_due" | "canceled";
    currentPeriodEnd: string;
    price: number;
    brands: number;
  };
  usage: {
    contentGenerated: number;
    postsScheduled: number;
    analyticsViews: number;
    limits: {
      contentGenerated: number;
      postsScheduled: number;
      analyticsViews: number;
    };
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: "paid" | "pending" | "failed";
    downloadUrl?: string;
  }>;
}

export default function Billing() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: BillingData = {
        subscription: {
          plan: "Growth Plan",
          status: "active",
          currentPeriodEnd: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          price: 149,
          brands: 10,
        },
        usage: {
          contentGenerated: 245,
          postsScheduled: 89,
          analyticsViews: 1250,
          limits: {
            contentGenerated: 1000,
            postsScheduled: 500,
            analyticsViews: 5000,
          },
        },
        invoices: [
          {
            id: "inv_001",
            date: new Date().toISOString(),
            amount: 149,
            status: "paid",
          },
          {
            id: "inv_002",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 149,
            status: "paid",
          },
          {
            id: "inv_003",
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 149,
            status: "paid",
          },
        ],
      };
      setData(mockData);
    } catch (error) {
      console.error("Failed to load billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: BillingData["subscription"]["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "past_due":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInvoiceStatusColor = (
    status: BillingData["invoices"][0]["status"],
  ) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load billing data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Billing & Subscription
          </h1>
          <p className="text-gray-600">
            Manage your subscription and billing information
          </p>
        </div>
        <Button className="gap-2">
          <ArrowUpRight className="h-4 w-4" />
          Upgrade Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{data.subscription.plan}</h3>
                <p className="text-gray-600">
                  {formatCurrency(data.subscription.price)}/month
                </p>
              </div>
              <Badge className={getStatusColor(data.subscription.status)}>
                {data.subscription.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Brands included</span>
                <span className="font-medium">{data.subscription.brands}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Next billing date</span>
                <span className="font-medium">
                  {new Date(
                    data.subscription.currentPeriodEnd,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Change Plan
                </Button>
                <Button variant="outline" className="flex-1">
                  Update Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Content Generated</span>
                <span>
                  {data.usage.contentGenerated} /{" "}
                  {data.usage.limits.contentGenerated}
                </span>
              </div>
              <Progress
                value={calculateUsagePercentage(
                  data.usage.contentGenerated,
                  data.usage.limits.contentGenerated,
                )}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Posts Scheduled</span>
                <span>
                  {data.usage.postsScheduled} /{" "}
                  {data.usage.limits.postsScheduled}
                </span>
              </div>
              <Progress
                value={calculateUsagePercentage(
                  data.usage.postsScheduled,
                  data.usage.limits.postsScheduled,
                )}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analytics Views</span>
                <span>
                  {data.usage.analyticsViews} /{" "}
                  {data.usage.limits.analyticsViews}
                </span>
              </div>
              <Progress
                value={calculateUsagePercentage(
                  data.usage.analyticsViews,
                  data.usage.limits.analyticsViews,
                )}
                className="h-2"
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Usage resets on{" "}
                {new Date(
                  data.subscription.currentPeriodEnd,
                ).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing History</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.invoices.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                getStatusColor={getInvoiceStatusColor}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/26</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceRow({
  invoice,
  getStatusColor,
  formatCurrency,
}: {
  invoice: BillingData["invoices"][0];
  getStatusColor: (status: BillingData["invoices"][0]["status"]) => string;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Calendar className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium">Invoice #{invoice.id}</p>
          <p className="text-sm text-gray-600">
            {new Date(invoice.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium">{formatCurrency(invoice.amount)}</p>
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
        </div>

        {invoice.status === "paid" && (
          <Button variant="ghost" size="sm" className="gap-1">
            <Download className="h-3 w-3" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
