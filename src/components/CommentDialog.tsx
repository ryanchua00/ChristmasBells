"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Comment, CreateCommentData, Item } from "../types";
import toast from "react-hot-toast";

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  currentUser: string;
  onCommentAdded?: () => void;
}

export default function CommentDialog({
  isOpen,
  onClose,
  item,
  currentUser,
  onCommentAdded,
}: CommentDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetchComments();
      setExpanded(false);
    }
  }, [isOpen, item]);

  const fetchComments = async () => {
    if (!item) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/items/${item.id}/comments`);
      const data = await response.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/items/${item.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: newComment.trim(),
          author_name: currentUser,
        }),
      });

      const result = await response.json();

      if (response.ok && result.comment) {
        setComments([...comments, result.comment]);
        setNewComment("");
        toast.success("💬 Comment added!");
        onCommentAdded?.(); // Notify parent component
      } else {
        toast.error(result.error || "Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="christmas-card p-4 sm:p-6 w-full max-w-md max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-christmas-green flex items-center">
            <MessageCircle className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
            Comments
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800">{item.item_name}</h3>
          <p className="text-sm text-gray-600">by {item.author?.name}</p>
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">
              Comments ({comments.length})
            </span>
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 max-h-48 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">
                  <div className="text-2xl">💭</div>
                  <p className="text-sm text-gray-500">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-2xl">💬</div>
                  <p className="text-sm text-gray-500">No comments yet</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <p className="text-gray-800 text-sm">
                      {comment.comment_text}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Anonymous •{" "}
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Comment Form - Only show if not the item owner */}
        {item.author?.name !== currentUser && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a comment or question
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-gold/20 focus:border-christmas-gold transition-all duration-300 resize-none"
                rows={3}
                placeholder="Ask for clarification, suggest alternatives, etc..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[48px] text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex flex-row items-center text-center justify-center christmas-button-secondary flex-1 min-h-[48px] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        )}

        {/* View-only message for item owners */}
        {item.author?.name === currentUser && (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              This is your item. You can view comments but cannot add new ones.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
