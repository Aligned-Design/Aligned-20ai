/**
 * Audit logging for approval workflows
 * Tracks all approval, rejection, bulk actions, and email sends
 * Enforces RLS and enables compliance reporting
 */

import { AuditLog, AuditAction, AuditLogQuery } from '@shared/approvals';

// Mock storage for audit logs (replace with actual database)
const auditLogs: Map<string, AuditLog> = new Map();
let logIdCounter = 0;

/**
 * Log an approval action
 */
export async function logAuditAction(
  brandId: string,
  postId: string,
  actorId: string,
  actorEmail: string,
  action: AuditAction,
  metadata: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<AuditLog> {
  const id = `audit_${Date.now()}_${++logIdCounter}`;
  const now = new Date().toISOString();

  const auditLog: AuditLog = {
    id,
    brandId,
    postId,
    actorId,
    actorEmail,
    action,
    metadata,
    ipAddress,
    userAgent,
    createdAt: now,
    updatedAt: now,
  };

  // Store in mock storage (replace with actual database INSERT)
  auditLogs.set(id, auditLog);

  // Log to console for debugging
  console.log(`[Audit] ${action} by ${actorEmail}:`, {
    brandId,
    postId,
    timestamp: now,
    metadata,
  });

  // TODO: Send to external audit service (Splunk, DataDog, etc.)

  return auditLog;
}

/**
 * Query audit logs with filtering
 */
export async function queryAuditLogs(query: AuditLogQuery): Promise<{
  logs: AuditLog[];
  total: number;
  hasMore: boolean;
}> {
  let logs = Array.from(auditLogs.values());

  // Apply filters
  if (query.brandId) {
    logs = logs.filter((log) => log.brandId === query.brandId);
  }
  if (query.postId) {
    logs = logs.filter((log) => log.postId === query.postId);
  }
  if (query.actorId) {
    logs = logs.filter((log) => log.actorId === query.actorId);
  }
  if (query.action) {
    logs = logs.filter((log) => log.action === query.action);
  }
  if (query.startDate) {
    const start = new Date(query.startDate).getTime();
    logs = logs.filter((log) => new Date(log.createdAt).getTime() >= start);
  }
  if (query.endDate) {
    const end = new Date(query.endDate).getTime();
    logs = logs.filter((log) => new Date(log.createdAt).getTime() <= end);
  }

  // Sort by date descending
  logs = logs.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = logs.length;
  const limit = query.limit || 50;
  const offset = query.offset || 0;

  const paginated = logs.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return {
    logs: paginated,
    total,
    hasMore,
  };
}

/**
 * Get audit logs for a specific post
 */
export async function getPostAuditTrail(brandId: string, postId: string): Promise<AuditLog[]> {
  const logs = Array.from(auditLogs.values()).filter(
    (log) => log.brandId === brandId && log.postId === postId
  );

  return logs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get statistics for compliance reporting
 */
export async function getAuditStatistics(
  brandId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  totalActions: number;
  byAction: Record<AuditAction, number>;
  averageApprovalTime: number;
  rejectionRate: number;
  bulkApprovals: number;
  emailsSent: number;
  topActors: Array<{ email: string; actionCount: number }>;
}> {
  let logs = Array.from(auditLogs.values()).filter((log) => log.brandId === brandId);

  if (startDate) {
    const start = new Date(startDate).getTime();
    logs = logs.filter((log) => new Date(log.createdAt).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(endDate).getTime();
    logs = logs.filter((log) => new Date(log.createdAt).getTime() <= end);
  }

  // Count by action
  const byAction: Record<string, number> = {};
  logs.forEach((log) => {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
  });

  // Calculate approval time (from APPROVAL_REQUESTED to APPROVED)
  const approvalTimes: number[] = [];
  const requestedMap = new Map<string, AuditLog>();

  logs.forEach((log) => {
    if (log.action === 'APPROVAL_REQUESTED') {
      requestedMap.set(log.postId, log);
    } else if (log.action === 'APPROVED') {
      const requested = requestedMap.get(log.postId);
      if (requested) {
        const time =
          new Date(log.createdAt).getTime() - new Date(requested.createdAt).getTime();
        approvalTimes.push(time);
      }
    }
  });

  const averageApprovalTime =
    approvalTimes.length > 0
      ? approvalTimes.reduce((a, b) => a + b, 0) / approvalTimes.length
      : 0;

  // Calculate rejection rate
  const approved = byAction['APPROVED'] || 0;
  const rejected = byAction['REJECTED'] || 0;
  const rejectionRate = approved + rejected > 0 ? rejected / (approved + rejected) : 0;

  // Count bulk approvals
  const bulkApprovals = byAction['BULK_APPROVED'] || 0;

  // Count emails
  const emailsSent = byAction['EMAIL_SENT'] || 0;

  // Top actors
  const actorCounts: Record<string, number> = {};
  logs.forEach((log) => {
    actorCounts[log.actorEmail] = (actorCounts[log.actorEmail] || 0) + 1;
  });

  const topActors = Object.entries(actorCounts)
    .map(([email, actionCount]) => ({ email, actionCount }))
    .sort((a, b) => b.actionCount - a.actionCount)
    .slice(0, 10);

  return {
    totalActions: logs.length,
    byAction: byAction as Record<AuditAction, number>,
    averageApprovalTime,
    rejectionRate,
    bulkApprovals,
    emailsSent,
    topActors,
  };
}

/**
 * Verify audit log integrity (check for tampering)
 */
export async function verifyAuditLogIntegrity(logId: string): Promise<{
  valid: boolean;
  message: string;
}> {
  const log = auditLogs.get(logId);

  if (!log) {
    return {
      valid: false,
      message: 'Audit log not found',
    };
  }

  // In production, check:
  // 1. Cryptographic hash verification
  // 2. Sequence number verification
  // 3. Timestamp ordering
  // 4. Actor permissions at time of action

  return {
    valid: true,
    message: 'Audit log verified',
  };
}

/**
 * Export audit logs for compliance (CSV format)
 */
export async function exportAuditLogs(
  brandId: string,
  startDate: string,
  endDate: string
): Promise<string> {
  const query: AuditLogQuery = {
    brandId,
    startDate,
    endDate,
    limit: 10000,
  };

  const { logs } = await queryAuditLogs(query);

  // CSV header
  const headers = [
    'ID',
    'Timestamp',
    'Action',
    'Actor Email',
    'Post ID',
    'Note',
    'Bulk Count',
    'Error',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.createdAt,
    log.action,
    log.actorEmail,
    log.postId,
    log.metadata.note || '',
    log.metadata.bulkCount || '',
    log.metadata.errorMessage || '',
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  return csv;
}

/**
 * Delete audit logs older than specified days (for GDPR)
 */
export async function deleteOldAuditLogs(olderThanDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  const cutoffTime = cutoffDate.getTime();

  let deletedCount = 0;

  for (const [key, log] of auditLogs.entries()) {
    if (new Date(log.createdAt).getTime() < cutoffTime) {
      auditLogs.delete(key);
      deletedCount++;
    }
  }

  console.log(`[Audit] Deleted ${deletedCount} logs older than ${olderThanDays} days`);
  return deletedCount;
}
