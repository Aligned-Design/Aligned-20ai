/**
 * Comment Thread Panel
 * Real-time collaborative comments on designs
 */

import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  designId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  elementId?: string;
  parentId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommentThreadPanelProps {
  designId: string;
  onAddComment: (text: string, elementId?: string, parentId?: string) => void;
  className?: string;
}

export function CommentThreadPanel({
  designId,
  onAddComment,
  className = "",
}: CommentThreadPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Mock comments - in production, fetch from API
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: "comment-1",
        designId,
        userId: "user-1",
        userName: "Sarah Johnson",
        userAvatar: "SJ",
        text: "Love the color scheme! Very on-brand.",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "comment-2",
        designId,
        userId: "user-2",
        userName: "Mike Chen",
        userAvatar: "MC",
        text: "Could we make the headline a bit larger?",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
    setComments(mockComments);
  }, [designId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment(newComment, undefined, replyingTo || undefined);

    // Add comment to local state (optimistic update)
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      designId,
      userId: "current-user",
      userName: "You",
      text: newComment,
      parentId: replyingTo || undefined,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    setReplyingTo(null);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Organize comments into threads
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parentId === commentId);

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {rootComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No comments yet</p>
            <p className="text-xs text-slate-400">Be the first to comment!</p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Main Comment */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-purple-700">
                    {comment.userAvatar || <User className="w-4 h-4" />}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900">
                      {comment.userName}
                    </p>
                    <span className="text-xs text-slate-500">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 break-words">
                    {comment.text}
                  </p>
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold mt-1 flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </button>
                </div>
              </div>

              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="flex gap-3 ml-11">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-600">
                      {reply.userAvatar || <User className="w-3 h-3" />}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-900">
                        {reply.userName}
                      </p>
                      <span className="text-xs text-slate-500">
                        {formatTimestamp(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 break-words">
                      {reply.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="p-4 border-t border-slate-200">
        {replyingTo && (
          <div className="mb-2 text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Reply className="w-3 h-3" />
              Replying to {comments.find((c) => c.id === replyingTo)?.userName}
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
