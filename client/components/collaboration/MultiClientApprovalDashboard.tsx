import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  X,
  Clock,
  MessageSquare,
  Eye,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalCard {
  id: string;
  clientName: string;
  clientAvatar: string;
  brandName: string;
  postPreview: {
    thumbnail?: string;
    caption: string;
    platform: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  timePending: number; // hours
  slaHours: number;
}

type ColumnType = 'pending' | 'approved' | 'rejected';

interface MultiClientApprovalDashboardProps {
  className?: string;
}

export function MultiClientApprovalDashboard({ className }: MultiClientApprovalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all');

  const [approvals, setApprovals] = useState<ApprovalCard[]>([
    {
      id: '1',
      clientName: 'Acme Corp',
      clientAvatar: '🏢',
      brandName: 'Acme Products',
      postPreview: {
        thumbnail: '/placeholder.svg',
        caption: 'New product launch coming next week! Stay tuned...',
        platform: 'Instagram',
      },
      status: 'pending',
      timePending: 28,
      slaHours: 24,
    },
    {
      id: '2',
      clientName: 'TechStart Inc',
      clientAvatar: '💻',
      brandName: 'TechStart',
      postPreview: {
        thumbnail: '/placeholder.svg',
        caption: 'Join us for our webinar on AI trends in 2025',
        platform: 'LinkedIn',
      },
      status: 'pending',
      timePending: 6,
      slaHours: 24,
    },
    {
      id: '3',
      clientName: 'FoodCo',
      clientAvatar: '🍔',
      brandName: 'FoodCo Restaurants',
      postPreview: {
        thumbnail: '/placeholder.svg',
        caption: "Today's special: Our famous burger with house sauce!",
        platform: 'Facebook',
      },
      status: 'approved',
      timePending: 2,
      slaHours: 24,
    },
  ]);

  const clients = Array.from(new Set(approvals.map(a => a.clientName)));

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      approval.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.postPreview.caption.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClient = filterClient === 'all' || approval.clientName === filterClient;

    const matchesTime =
      filterTime === 'all' ||
      (filterTime === '24h' && approval.timePending > 24) ||
      (filterTime === '48h' && approval.timePending > 48);

    return matchesSearch && matchesClient && matchesTime;
  });

  const columns: { type: ColumnType; title: string; icon: React.ReactNode }[] = [
    {
      type: 'pending',
      title: 'Pending Approval',
      icon: <Clock className="h-4 w-4" />,
    },
    {
      type: 'approved',
      title: 'Approved',
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      type: 'rejected',
      title: 'Rejected',
      icon: <X className="h-4 w-4" />,
    },
  ];

  const moveCard = (cardId: string, newStatus: ColumnType) => {
    setApprovals(
      approvals.map((approval) =>
        approval.id === cardId ? { ...approval, status: newStatus } : approval
      )
    );
  };

  const handleBulkApprove = () => {
    const pendingIds = filteredApprovals.filter(a => a.status === 'pending').map(a => a.id);
    setApprovals(
      approvals.map((approval) =>
        pendingIds.includes(approval.id) ? { ...approval, status: 'approved' } : approval
      )
    );

    // Track analytics
    if (window.posthog) {
      window.posthog.capture('bulk_approve', { count: pendingIds.length });
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Multi-Client Approvals
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage all client approvals in one place
          </p>
        </div>
        <Button
          onClick={handleBulkApprove}
          className="gap-2"
          disabled={filteredApprovals.filter(a => a.status === 'pending').length === 0}
        >
          <CheckCircle className="h-4 w-4" />
          Auto-Approve All Pending
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client, brand, or content..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Client Filter */}
            <div>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Filter */}
            <div>
              <Select value={filterTime} onValueChange={setFilterTime}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">&gt; 24 hours</SelectItem>
                  <SelectItem value="48h">&gt; 48 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnApprovals = filteredApprovals.filter(
            (a) => a.status === column.type
          );

          return (
            <div key={column.type} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {column.icon}
                    <h3 className="font-bold text-slate-900">{column.title}</h3>
                  </div>
                  <Badge variant="secondary">{columnApprovals.length}</Badge>
                </div>
                <div className="h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-3">
                {columnApprovals.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">No items</p>
                  </div>
                ) : (
                  columnApprovals.map((approval) => (
                    <ApprovalCardComponent
                      key={approval.id}
                      approval={approval}
                      onMove={moveCard}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ApprovalCardComponentProps {
  approval: ApprovalCard;
  onMove: (cardId: string, newStatus: ColumnType) => void;
}

function ApprovalCardComponent({ approval, onMove }: ApprovalCardComponentProps) {
  const isOverdue = approval.timePending > approval.slaHours;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        isOverdue && 'border-red-300 bg-red-50'
      )}
    >
      <CardContent className="p-4">
        {/* Client Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
            {approval.clientAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm">
              {approval.clientName}
            </p>
            <p className="text-xs text-slate-600">{approval.brandName}</p>
          </div>
        </div>

        {/* Post Preview */}
        <div className="mb-3">
          {approval.postPreview.thumbnail && (
            <div className="w-full h-24 bg-slate-200 rounded-lg mb-2 overflow-hidden">
              <img
                src={approval.postPreview.thumbnail}
                alt="Post preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <Badge variant="outline" className="mb-2 text-xs">
            {approval.postPreview.platform}
          </Badge>
          <p className="text-sm text-slate-700 line-clamp-2">
            {approval.postPreview.caption}
          </p>
        </div>

        {/* Time Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant={isOverdue ? 'destructive' : 'secondary'}
            className="gap-1 text-xs"
          >
            {isOverdue && <AlertTriangle className="h-3 w-3" />}
            <Clock className="h-3 w-3" />
            {approval.timePending}h pending
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {approval.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onMove(approval.id, 'approved')}
                className="flex-1 gap-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-3 w-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = `/client-portal/${approval.id}`}
                className="gap-1"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            </>
          )}
          {approval.status !== 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = `/client-portal/${approval.id}`}
              className="w-full gap-1"
            >
              <Eye className="h-3 w-3" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
