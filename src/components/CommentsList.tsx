import { useState } from "react";
import { useUser } from "@/lib/fake-clerk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CommentItem } from "./CommentItem";
import { CommentWithAuthor } from "@/lib/supabase";

// Updated to match our database schema
interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  hasReplies?: boolean;
  replyCount?: number;
}

interface CommentsListProps {
  comments: CommentWithAuthor[];
  onAddComment?: (content: string) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  onReplyToComment?: (commentId: string) => void;
  isLoading?: boolean;
  characterId?: string;
}

// Helper function to transform CommentWithAuthor to our UI Comment interface
const transformComment = (dbComment: CommentWithAuthor): Comment => {
  return {
    id: dbComment.id,
    author: {
      name: dbComment.users?.full_name || dbComment.users?.username || 'Anonymous',
      avatar: dbComment.users?.avatar_url || undefined
    },
    content: dbComment.content,
    timestamp: new Date(dbComment.created_at).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }),
    likes: dbComment.likes_count,
    isLiked: dbComment.is_liked || false,
    hasReplies: dbComment.reply_count > 0,
    replyCount: dbComment.reply_count
  };
};

export function CommentsList({
  comments = [],
  onAddComment,
  onLikeComment,
  onReplyToComment,
  isLoading = false,
  characterId
}: CommentsListProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    try {
      await onAddComment?.(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // Transform database comments to UI format
  const uiComments = comments.map(transformComment);

  return (
    <div className="flex flex-col h-full">
      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner size="md" className="mx-auto mb-4" />
              <p className="text-white/60">Loading comments...</p>
            </div>
          </div>
        ) : uiComments.length > 0 ? (
          <div className="px-4 py-4">
            {uiComments.map((comment, index) => (
              <div key={comment.id} className={index < uiComments.length - 1 ? "border-b border-white/5 pb-4 mb-4" : ""}>
                <CommentItem
                  comment={comment}
                  onLike={onLikeComment}
                  onReply={onReplyToComment}
                  onViewReplies={(id) => console.log("View replies for:", id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-white/60">No comments yet</p>
              <p className="text-white/40 text-sm mt-1">Be the first to comment!</p>
            </div>
          </div>
        )}
      </div>

      {/* Comment Input Footer - Fixed at bottom */}
      <div className="border-t border-white/10 p-4 bg-[#111216]/60 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-gradient-to-br from-gray-500 to-cyan-500 text-white text-sm">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={user ? "Leave your comment..." : "Sign in to comment"}
              disabled={isSubmitting || !user}
              className="flex-1 bg-card/50 border-border resize-none min-h-[40px] max-h-[120px] text-sm text-white placeholder:text-white/50 pr-12"
              rows={1}
            />

            {/* Send Button */}
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting || !user}
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
