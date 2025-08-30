import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

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

interface CommentItemProps {
  comment: Comment;
  onLike?: (commentId: string) => Promise<void>;
  onReply?: (commentId: string) => void;
  onViewReplies?: (commentId: string) => void;
}

export function CommentItem({ comment, onLike, onReply, onViewReplies }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = async () => {
    try {
      // Optimistic UI update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

      // Call the async like function
      await onLike?.(comment.id);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(comment.isLiked || false);
      setLikeCount(comment.likes);
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="flex gap-3 py-3">
      {/* Avatar */}
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback className="bg-gradient-to-br from-gray-500 to-cyan-500 text-white">
          {comment.author.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Comment Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-white">{comment.author.name}</span>
          <span className="text-white/60">{comment.timestamp}</span>
        </div>

        {/* Content */}
        <p className="text-white/90 text-sm leading-relaxed">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <Heart 
              className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
            />
            <span className="text-sm">{likeCount}</span>
          </button>

          {/* Reply Button */}
          <button
            onClick={() => onReply?.(comment.id)}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Reply
          </button>
        </div>

        {/* View Replies */}
        {comment.hasReplies && comment.replyCount && comment.replyCount > 0 && (
          <button
            onClick={() => onViewReplies?.(comment.id)}
            className="flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors mt-2"
          >
            <span>─────</span>
            <span>View {comment.replyCount} reply{comment.replyCount !== 1 ? '' : ''}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
