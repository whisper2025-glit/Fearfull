import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { CommentItem } from "./CommentItem";

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
  comments: Comment[];
  onAddComment?: (content: string) => Promise<void>;
  onLikeComment?: (commentId: string) => void;
  onReplyToComment?: (commentId: string) => void;
  isLoading?: boolean;
}

// Sample comments matching the screenshot
const sampleComments: Comment[] = [
  {
    id: "1",
    author: {
      name: "snoop91",
      avatar: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png"
    },
    content: "pls do part 2 of her mom",
    timestamp: "08/10/2025",
    likes: 4,
    isLiked: false
  },
  {
    id: "2",
    author: {
      name: "Dean|",
      avatar: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png"
    },
    content: "9/10 would chat again",
    timestamp: "08/10/2025",
    likes: 0,
    isLiked: false
  },
  {
    id: "3",
    author: {
      name: "Mr. Dinglenut",
      avatar: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png"
    },
    content: "My dihh is crying white tears❤️🍆",
    timestamp: "08/10/2025",
    likes: 3,
    isLiked: false,
    hasReplies: true,
    replyCount: 1
  },
  {
    id: "4",
    author: {
      name: "Andrea_q",
      avatar: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png"
    },
    content: "my gosh this is so good that i am so horny<3",
    timestamp: "08/08/2025",
    likes: 1,
    isLiked: false
  },
  {
    id: "5",
    author: {
      name: "R10cxi",
      avatar: "/lovable-uploads/3eab3055-d06f-48a5-9790-123de7769f97.png"
    },
    content: "my dihh got snapped in half 🍆❤️",
    timestamp: "08/07/2025",
    likes: 4,
    isLiked: false
  }
];

export function CommentsList({ 
  comments = sampleComments, 
  onAddComment, 
  onLikeComment, 
  onReplyToComment,
  isLoading = false 
}: CommentsListProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

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

  return (
    <div className="flex flex-col h-full">
      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
        {comments.length > 0 ? (
          <div className="px-4 py-4">
            {comments.map((comment, index) => (
              <div key={comment.id} className={index < comments.length - 1 ? "border-b border-white/5 pb-4 mb-4" : ""}>
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
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Leave your comment..."
              disabled={isSubmitting}
              className="flex-1 bg-card/50 border-border resize-none min-h-[40px] max-h-[120px] text-sm text-white placeholder:text-white/50 pr-12"
              rows={1}
            />

            {/* Send Button */}
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
