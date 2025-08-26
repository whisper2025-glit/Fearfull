import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PersonaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonaSave?: (persona: PersonaData) => void;
}

interface PersonaData {
  name: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  description: string;
  applyToNewChats: boolean;
}

export function PersonaModal({ open, onOpenChange, onPersonaSave }: PersonaModalProps) {
  const [name, setName] = useState("");
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | 'Non-binary'>('Male');
  const [description, setDescription] = useState("");
  const [applyToNewChats, setApplyToNewChats] = useState(false);

  const handleSave = () => {
    const personaData: PersonaData = {
      name,
      gender: selectedGender,
      description,
      applyToNewChats
    };
    onPersonaSave?.(personaData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setName("");
    setSelectedGender('Male');
    setDescription("");
    setApplyToNewChats(false);
    onOpenChange(false);
  };

  const isFormValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden [&>button]:hidden">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-4 py-3 flex-shrink-0 border-b border-[#2d2e3e]">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white text-sm p-0"
                style={{ fontSize: '14px' }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <DialogTitle className="text-lg font-bold text-white" style={{ fontSize: '14px' }}>
                Create Persona
              </DialogTitle>
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white text-sm p-0"
                style={{ fontSize: '14px' }}
                onClick={handleSave}
                disabled={!isFormValid}
              >
                Save
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-4 py-4 flex-1 overflow-y-auto min-h-0 space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <Input
                placeholder="Type your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#2d2e3e] border-[#3d3e4e] text-white placeholder-gray-400 text-xs"
                style={{ fontSize: '12px' }}
                maxLength={30}
              />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                  Your name in the conversation
                </span>
                <span className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                  {name.length}/30
                </span>
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-3">
              <h3 className="text-white font-medium" style={{ fontSize: '14px' }}>
                Gender
              </h3>
              <div className="flex gap-2">
                {(['Male', 'Female', 'Non-binary'] as const).map((gender) => (
                  <Button
                    key={gender}
                    variant={selectedGender === gender ? 'default' : 'outline'}
                    className={`flex-1 rounded-2xl py-2 border-0 text-xs font-medium ${
                      selectedGender === gender
                        ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                        : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a] border-[#3d3e4e]'
                    }`}
                    style={{ fontSize: '12px' }}
                    onClick={() => setSelectedGender(gender)}
                  >
                    {gender}
                  </Button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-white font-medium" style={{ fontSize: '14px' }}>
                Description
              </h3>
              <Textarea
                placeholder="e.g. I'm an 18-year-old college student and {{char}} is my best friend."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#2d2e3e] border-[#3d3e4e] text-white placeholder-gray-400 min-h-[120px] resize-none text-xs"
                style={{ fontSize: '12px' }}
                maxLength={1500}
              />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                  Describe your identity, background, or relationship to the character.
                </span>
                <span className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                  {description.length}/1500
                </span>
              </div>
            </div>

            {/* Apply to new chats toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-white font-medium" style={{ fontSize: '14px' }}>
                    Apply to new chats
                  </h3>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                      Set as default for new chats.
                    </p>
                    <p className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                      Bot will recognize your persona if allowed in its description.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={applyToNewChats}
                  onCheckedChange={setApplyToNewChats}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
