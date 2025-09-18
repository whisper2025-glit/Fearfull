import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createConversation, deleteConversation, clearMessagesForConversation, clearMessagesForUserCharacter } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface StartNewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  characterId: string;
  currentConversationId?: string | null;
  personaId?: string | null;
  onStarted?: (newConversationId: string) => void;
}

export const StartNewChatModal = ({
  open,
  onOpenChange,
  userId,
  characterId,
  currentConversationId,
  personaId,
  onStarted,
}: StartNewChatModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const start = async (opts: { deleteOld: boolean }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (opts.deleteOld && currentConversationId) {
        try {
          await deleteConversation(currentConversationId, userId);
        } catch (e) {
          // Non-blocking
          console.warn('Could not delete previous conversation', e);
        }
      }

      const conversation = await createConversation(userId, characterId, personaId ?? null, null, null);

      onOpenChange(false);
      if (conversation?.id) {
        navigate(`/chat/${characterId}?conversation=${conversation.id}`, { replace: true });
        onStarted?.(conversation.id);
      }
    } catch (err) {
      console.error('Failed to start new chat', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111216] text-white border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Start a new conversation?</DialogTitle>
          <DialogDescription className="text-gray-300">
            If you initiate a new chat, the previous chat history will be lost. Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button disabled={isSubmitting} className="bg-pink-500 hover:bg-pink-600 text-white w-full h-12 rounded-full" onClick={() => start({ deleteOld: true })}>
            Delete and start new chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartNewChatModal;
