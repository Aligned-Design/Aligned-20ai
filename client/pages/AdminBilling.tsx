import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  TrendingDown,
  Calendar,
  Search,
} from "lucide-react";
import { isFeatureEnabled } from "@/lib/featureFlags";
import {
  DashboardShell,
  KpiCard,
  TableCard,
  FilterBar,
  type ActiveFilter,
} from "@/components/DashboardSystem";

interface AdminBillingData {
  summary: {
    activeUsers: number;
    pastDueUsers: number;
    archivedUsers: number;
    totalRevenue: number;
    lostRevenue: number;
  };
  users: Array<{
    id: string;
    email: string;
    name: string;
    planStatus: "active" | "past_due" | "archived";
    brandCount: number;
    monthlyValue: number;
    daysPastDue: number;
    retryAttemptsRemaining: number;
    lastPaymentAttempt?: string;
    nextRetryDate?: string;
  }>;
}

export default function AdminBilling() {
  const unifiedDashEnabled = isFeatureEnabled("unified_dash");

  if (unifiedDashEnabled) {
    return <UnifiedAdminBilling />;
  }

  return <LegacyAdminBilling />;
}

// ============================================================================
// NEW: Unified Dashboard System Version
// ============================================================================

function UnifiedAdminBilling() {
  const [data, setData] = useState<AdminBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call to /api/admin/billing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData: AdminBillingData = {
        summary: {
          activeUsers: 145,
          pastDueUsers: 12,
          archivedUsers: 3,
          totalRevenue: 28800,
          lostRevenue: 2400,
        },
        users: [
          {
            id: "1",
            email: "john@example.com",
            name: "John Doe",
            planStatus: "past_due",
            brandCount: 3,
            monthlyValue: 597,
            daysPastDue: 8,
            retryAttemptsRemaining: 1,
            lastPaymentAttempt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            nextRetryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            email: "sarah@agency.com",
            name: "Sarah Agency",
            planStatus: "past_due",
            brandCount: 7,
            monthlyValue: 693,
            daysPastDue: 15,
            retryAttemptsRemaining: 0,
          },
          {
            id: "3",
            email: "archived@example.com",
            name: "Archived User",
            planStatus: "archived",
            brandCount: 2,
            monthlyValue: 398,
            daysPastDue: 35,
            retryAttemptsRemaining: 0,
          },
        ],
      };
      setData(mockData);
      setError(null);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendGrace = async (userId: string, days: number) => {
    console.log(`Extending grace period for ${userId} by ${days} days`);
    // Call API: POST /api/billing/extend-grace-period
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Build active filters for FilterBar
  const activeFilters: ActiveFilter[] = [];
  if (filter !== "all") {
    activeFilters.push({
      type: "status",
      value: filter,
      label: filter === "past_due" ? "Past Due" : "Archived",
    });
  }
  if (searchQuery) {
    activeFilters.push({
      type: "search",
      value: searchQuery,
      label: `Search: ${searchQuery}`,
    });
  }

  const handleRemoveFilter = (filterToRemove: ActiveFilter) => {
    if (filterToRemove.type === "status") {
      setFilter("all");
    } else if (filterToRemove.type === "search") {
      setSearchQuery("");
    }
  };

  const handleClearAll = () => {
    setFilter("all");
    setSearchQuery("");
  };

  const filteredUsers = data?.users.filter((user) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "past_due" && user.planStatus === "past_due") ||
      (filter === "archived" && user.planStatus === "archived");

    const matchesSearch =
      searchQuery === "" ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardShell
      title="Billing Dashboard"
      subtitle="Monitor payment status, revenue, and account health"
      filterBar={
        <FilterBar
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAll}
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="past_due">Past Due Only</SelectItem>
              <SelectItem value="archived">Archived Only</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
      }
    >
      {/* KPI Cards */}
      <KpiCard
        title="Active Users"
        value={data?.summary.activeUsers || 0}
        icon={CheckCircle}
      />

      <KpiCard
        title="Past Due"
        value={data?.summary.pastDueUsers || 0}
        icon={AlertTriangle}
      />

      <KpiCard
        title="Archived"
        value={data?.summary.archivedUsers || 0}
        icon={XCircle}
      />

      <KpiCard
        title="Total Revenue"
        value={formatCurrency(data?.summary.totalRevenue || 0)}
        description="Monthly recurring"
        icon={DollarSign}
      />

      <KpiCard
        title="Lost Revenue"
        value={formatCurrency(data?.summary.lostRevenue || 0)}
        description="From past due/archived"
        icon={TrendingDown}
      />

      {/* User Table */}
      <TableCard
        title="User Accounts"
        isLoading={loading}
        error={error}
        isEmpty={!filteredUsers || filteredUsers.length === 0}
        emptyMessage="No users found matching your filters"
        onRetry={loadAdminData}
      >
        <div className="space-y-4">
          {filteredUsers?.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onExtendGrace={handleExtendGrace}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      </TableCard>
    </DashboardShell>
  );
}

// ============================================================================
// LEGACY: Original Implementation (kept for rollback)
// ============================================================================

function LegacyAdminBilling() {
  const [data, setData] = useState<AdminBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Mock data - replace with actual API call to /api/admin/billing
      const mockData: AdminBillingData = {
        summary: {
          activeUsers: 145,
          pastDueUsers: 12,
          archivedUsers: 3,
          totalRevenue: 28800,
          lostRevenue: 2400,
        },
        users: [
          {
            id: "1",
            email: "john@example.com",
            name: "John Doe",
            planStatus: "past_due",
            brandCount: 3,
            monthlyValue: 597,
            daysPastDue: 8,
            retryAttemptsRemaining: 1,
            lastPaymentAttempt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            nextRetryDate: new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
          {
            id: "2",
            email: "sarah@agency.com",
            name: "Sarah Agency",
            planStatus: "past_due",
            brandCount: 7,
            monthlyValue: 693,
            daysPastDue: 15,
            retryAttemptsRemaining: 0,
          },
          {
            id: "3",
            email: "archived@example.com",
            name: "Archived User",
            planStatus: "archived",
            brandCount: 2,
            monthlyValue: 398,
            daysPastDue: 35,
            retryAttemptsRemaining: 0,
          },
        ],
      };
      setData(mockData);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendGrace = async (userId: string, days: number) => {
    console.log(`Extending grace period for ${userId} by ${days} days`);
    // Call API: POST /api/billing/extend-grace-period
  };

  const getStatusColor = (
    status: "active" | "past_due" | "archived",
  ): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "past_due":
        return "bg-orange-100 text-orange-800";
      case "archived":
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

  const filteredUsers = data?.users.filter((user) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "past_due" && user.planStatus === "past_due") ||
      (filter === "archived" && user.planStatus === "archived");

    const matchesSearch =
      searchQuery === "" ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load admin data</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
        <p className="text-gray-600">
          Monitor payment status, revenue, and account health
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {data.summary.activeUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Past Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {data.summary.pastDueUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Archived
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {data.summary.archivedUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(data.summary.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Monthly recurring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Lost Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(data.summary.lostRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">From past due/archived</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>User Accounts</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="past_due">Past Due Only</SelectItem>
                  <SelectItem value="archived">Archived Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onExtendGrace={handleExtendGrace}
                  getStatusColor={getStatusColor}
                  formatCurrency={formatCurrency}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No users found matching your filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Shared User Row Component
// ============================================================================

function UserRow({
  user,
  onExtendGrace,
  getStatusColor,
  formatCurrency,
}: {
  user: AdminBillingData["users"][0];
  onExtendGrace: (userId: string, days: number) => void;
  getStatusColor?: (status: "active" | "past_due" | "archived") => string;
  formatCurrency: (amount: number) => string;
}) {
  const defaultGetStatusColor = (status: "active" | "past_due" | "archived"): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "past_due":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const colorFn = getStatusColor || defaultGetStatusColor;

  return (
    <div className="flex items-center justify-between p-4 border border-[var(--color-border)] dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <p className="font-medium text-gray-900 dark:text-slate-100">{user.name}</p>
            <Badge className={colorFn(user.planStatus)}>
              {user.planStatus}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400">{user.email}</p>

          {user.planStatus !== "active" && (
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-slate-500">
              <span>Days past due: {user.daysPastDue}</span>
              <span>•</span>
              <span>Retries left: {user.retryAttemptsRemaining}</span>
              {user.nextRetryDate && (
                <>
                  <span>•</span>
                  <span>
                    Next retry:{" "}
                    {new Date(user.nextRetryDate).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-slate-400">Monthly Value</p>
          <p className="font-bold text-gray-900 dark:text-slate-100">
            {formatCurrency(user.monthlyValue)}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500">{user.brandCount} brands</p>
        </div>

        {user.planStatus !== "active" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExtendGrace(user.id, 7)}
            >
              <Calendar className="h-3 w-3 mr-1" />
              +7 Days
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
