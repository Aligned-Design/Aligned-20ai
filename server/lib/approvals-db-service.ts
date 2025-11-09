/**
 * Approvals Database Service
 * Handles approval workflows, requests, and audit logging
 */

import { supabase } from "./supabase";
import { AppError } from "./error-middleware";
import { ErrorCode, HTTP_STATUS } from "./error-responses";

/**
 * Approval request record in database
 */
export interface ApprovalRequestRecord {
  id: string;
  post_id: string;
  brand_id: string;
  requested_by: string;
  assigned_to: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  note?: string;
  priority: "low" | "normal" | "high";
  deadline?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Post approval status record
 */
export interface PostApprovalRecord {
  id: string;
  post_id: string;
  brand_id: string;
  status: "draft" | "in_review" | "approved" | "rejected" | "published";
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  rejection_note?: string;
  approval_date?: string;
  rejection_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Approvals Database Service Class
 */
export class ApprovalsDBService {
  /**
   * Create an approval request for a post
   */
  async createApprovalRequest(
    postId: string,
    brandId: string,
    requestedBy: string,
    assignedTo: string,
    priority: "low" | "normal" | "high" = "normal",
    deadline?: string
  ): Promise<ApprovalRequestRecord> {
    const { data, error } = await supabase
      .from("approval_requests")
      .insert({
        post_id: postId,
        brand_id: brandId,
        requested_by: requestedBy,
        assigned_to: assignedTo,
        status: "pending",
        priority,
        deadline,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to create approval request",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return data as ApprovalRequestRecord;
  }

  /**
   * Approve a post
   */
  async approvePost(
    postId: string,
    brandId: string,
    approvedBy: string,
    note?: string
  ): Promise<PostApprovalRecord> {
    // Verify post exists and belongs to brand
    const existingRecord = await this.getPostApprovalStatus(postId, brandId);
    if (!existingRecord) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        "Post not found",
        HTTP_STATUS.NOT_FOUND,
        "warning"
      );
    }

    const { data, error } = await supabase
      .from("post_approvals")
      .update({
        status: "approved",
        approved_by: approvedBy,
        approval_date: new Date().toISOString(),
      })
      .eq("post_id", postId)
      .eq("brand_id", brandId)
      .select()
      .single();

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to approve post",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return data as PostApprovalRecord;
  }

  /**
   * Reject a post
   */
  async rejectPost(
    postId: string,
    brandId: string,
    rejectedBy: string,
    reason: string,
    note?: string
  ): Promise<PostApprovalRecord> {
    // Verify post exists and belongs to brand
    const existingRecord = await this.getPostApprovalStatus(postId, brandId);
    if (!existingRecord) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        "Post not found",
        HTTP_STATUS.NOT_FOUND,
        "warning"
      );
    }

    const { data, error } = await supabase
      .from("post_approvals")
      .update({
        status: "rejected",
        rejected_by: rejectedBy,
        rejection_reason: reason,
        rejection_note: note,
        rejection_date: new Date().toISOString(),
      })
      .eq("post_id", postId)
      .eq("brand_id", brandId)
      .select()
      .single();

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to reject post",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return data as PostApprovalRecord;
  }

  /**
   * Bulk approve posts
   */
  async bulkApprovePostIds(
    postIds: string[],
    brandId: string,
    approvedBy: string
  ): Promise<PostApprovalRecord[]> {
    const { data, error } = await supabase
      .from("post_approvals")
      .update({
        status: "approved",
        approved_by: approvedBy,
        approval_date: new Date().toISOString(),
      })
      .in("post_id", postIds)
      .eq("brand_id", brandId)
      .select();

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to bulk approve posts",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return (data || []) as PostApprovalRecord[];
  }

  /**
   * Bulk reject posts
   */
  async bulkRejectPostIds(
    postIds: string[],
    brandId: string,
    rejectedBy: string,
    reason: string
  ): Promise<PostApprovalRecord[]> {
    const { data, error } = await supabase
      .from("post_approvals")
      .update({
        status: "rejected",
        rejected_by: rejectedBy,
        rejection_reason: reason,
        rejection_date: new Date().toISOString(),
      })
      .in("post_id", postIds)
      .eq("brand_id", brandId)
      .select();

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to bulk reject posts",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return (data || []) as PostApprovalRecord[];
  }

  /**
   * Get approval status for a post
   */
  async getPostApprovalStatus(
    postId: string,
    brandId: string
  ): Promise<PostApprovalRecord | null> {
    const { data, error } = await supabase
      .from("post_approvals")
      .select("*")
      .eq("post_id", postId)
      .eq("brand_id", brandId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch approval status",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return data as PostApprovalRecord | null;
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovalsForUser(
    userId: string,
    brandId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ approvals: ApprovalRequestRecord[]; total: number }> {
    let query = supabase
      .from("approval_requests")
      .select("*", { count: "exact" })
      .eq("assigned_to", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch pending approvals",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return {
      approvals: (data || []) as ApprovalRequestRecord[],
      total: count || 0,
    };
  }

  /**
   * Get approval requests for a post
   */
  async getApprovalRequestsForPost(
    postId: string,
    brandId: string
  ): Promise<ApprovalRequestRecord[]> {
    const { data, error } = await supabase
      .from("approval_requests")
      .select("*")
      .eq("post_id", postId)
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch approval requests",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return (data || []) as ApprovalRequestRecord[];
  }

  /**
   * Update approval request status
   */
  async updateApprovalRequestStatus(
    requestId: string,
    status: "pending" | "approved" | "rejected",
    note?: string
  ): Promise<ApprovalRequestRecord> {
    const { data, error } = await supabase
      .from("approval_requests")
      .update({
        status,
        note: note || null,
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to update approval request",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return data as ApprovalRequestRecord;
  }

  /**
   * Delete approval request (when post is deleted)
   */
  async deleteApprovalRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from("approval_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to delete approval request",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }
  }

  /**
   * Get approval history for a post (via audit logs)
   * Note: This would typically query an audit_logs table
   */
  async getApprovalHistory(
    postId: string,
    brandId: string
  ): Promise<Array<{
    id: string;
    action: string;
    userId: string;
    userEmail: string;
    timestamp: string;
    details: Record<string, unknown>;
  }>> {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("post_id", postId)
      .eq("brand_id", brandId)
      .in("action", ["APPROVED", "REJECTED", "APPROVAL_REQUESTED"])
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch approval history",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return (data || []).map((item: unknown) => ({
      id: item.id,
      action: item.action,
      userId: item.user_id,
      userEmail: item.user_email,
      timestamp: item.created_at,
      details: item.details || {},
    }));
  }

  /**
   * Count pending approvals for a user
   */
  async countPendingApprovalsForUser(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("approval_requests")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", userId)
      .eq("status", "pending");

    if (error) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to count pending approvals",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "critical",
        { details: error.message }
      );
    }

    return count || 0;
  }
}

/**
 * Singleton instance
 */
export const approvalsDB = new ApprovalsDBService();
