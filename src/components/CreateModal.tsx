import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Compass } from "lucide-react";

interface CreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateModal({ open, onOpenChange }: CreateModalProps) {
  const navigate = useNavigate();

  const handleCreateCharacter = () => {
    onOpenChange(false);
    navigate('/create');
  };

  const handleCreateAdventure = () => {
    onOpenChange(false);
    // TODO: Navigate to adventure creation page when implemented
    // navigate('/create-adventure');
    console.log('Adventure creation will be implemented');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold text-center">
            Create
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* Create Character Option */}
          <Button
            onClick={handleCreateCharacter}
            variant="ghost"
            className="w-full h-auto p-4 flex items-center justify-between hover:bg-accent/50 border border-border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Create Character</h3>
                <p className="text-sm text-muted-foreground">Craft your own unique character</p>
              </div>
            </div>
          </Button>

          {/* Create Adventure Play Option */}
          <Button
            onClick={handleCreateAdventure}
            variant="ghost"
            className="w-full h-auto p-4 flex items-center justify-between hover:bg-accent/50 border border-border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Create Adventure Play</h3>
                <p className="text-sm text-muted-foreground">Set up an adventure scenario</p>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
