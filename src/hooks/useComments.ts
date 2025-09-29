import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/lib/fake-clerk';
import { 
  CommentWithAuthor, 
  getCommentsForCharacter, 
  addComment, 
  likeComment, 
  subscribeToComments,
  subscribeToCommentLikes 
} from '@/lib/supabase';
import { toast } from 'sonner';

export function useComments(characterId: string) {
  const { user } = useUser();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Load initial comments
  const loadComments = useCallback(async () => {
    if (!characterId) return;

    setIsLoading(true);
    try {
      const commentsData = await getCommentsForCharacter(characterId, user?.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [characterId, user?.id]);

  // Add a new comment
  const handleAddComment = useCallback(async (content: string) => {
    if (!user?.id || !characterId) {
      toast.error('Please sign in to comment');
      return;
    }

    setIsAddingComment(true);
    try {
      const newComment = await addComment(characterId, content, user.id);
      if (newComment) {
        // The real-time subscription will handle adding it to the list
        toast.success('Comment added!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  }, [characterId, user?.id]);

  // Like/unlike a comment
  const handleLikeComment = useCallback(async (commentId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      const isNowLiked = await likeComment(commentId, user.id);
      
      // Update the local state optimistically
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              is_liked: isNowLiked,
              likes_count: isNowLiked 
                ? comment.likes_count + 1 
                : comment.likes_count - 1
            };
          }
          return comment;
        })
      );

    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to update like');
    }
  }, [user?.id]);

  // Reply to a comment (placeholder for now)
  const handleReplyToComment = useCallback((commentId: string) => {
    console.log('Reply to comment:', commentId);
    toast.info('Reply feature coming soon!');
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!characterId) return;

    console.log('Setting up real-time subscriptions for character:', characterId);

    const commentsSubscription = subscribeToComments(
      characterId,
      // On comment added
      (newComment) => {
        setComments(prevComments => {
          // Check if comment already exists (to avoid duplicates)
          const exists = prevComments.some(comment => comment.id === newComment.id);
          if (exists) return prevComments;
          
          // Add new comment to the beginning if it's a top-level comment
          if (!newComment.parent_id) {
            return [newComment, ...prevComments];
          }
          
          // For replies, we'd need more sophisticated handling
          return prevComments;
        });
      },
      // On comment updated  
      (updatedComment) => {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === updatedComment.id ? updatedComment : comment
          )
        );
      },
      // On comment deleted
      (commentId) => {
        setComments(prevComments =>
          prevComments.filter(comment => comment.id !== commentId)
        );
      }
    );

    // Set up likes subscription for all current comments
    const commentIds = comments.map(c => c.id);
    const likesSubscription = commentIds.length > 0 
      ? subscribeToCommentLikes(
          commentIds,
          (commentId, newLikesCount) => {
            setComments(prevComments =>
              prevComments.map(comment =>
                comment.id === commentId 
                  ? { ...comment, likes_count: newLikesCount }
                  : comment
              )
            );
          }
        )
      : null;

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up real-time subscriptions');
      commentsSubscription.unsubscribe();
      if (likesSubscription) {
        likesSubscription.unsubscribe();
      }
    };
  }, [characterId, comments.length]); // Re-setup when comment count changes for likes subscription

  // Load comments on mount and when dependencies change
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    isLoading,
    isAddingComment,
    handleAddComment,
    handleLikeComment,
    handleReplyToComment,
    refreshComments: loadComments
  };
}
