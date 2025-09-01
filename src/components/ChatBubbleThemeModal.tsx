import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type ChatBubbleTheme = 'default' | 'dark' | 'blackPink' | 'seaSaltCheese' | 'glass' | 'rounded';

interface ChatBubbleThemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ChatBubbleTheme;
  onSelect: (theme: ChatBubbleTheme) => void;
}

const ThemeCard: React.FC<{
  label: string;
  vip?: boolean;
  selected?: boolean;
  onClick: () => void;
  preview: React.ReactNode;
}> = ({ label, vip, selected, onClick, preview }) => (
  <button
    onClick={onClick}
    className={`relative rounded-xl p-2 w-full h-28 border transition-colors text-left ${
      selected ? 'border-pink-500 ring-2 ring-pink-500/40' : 'border-[#2d2e3e]'
    } bg-[#232438] hover:border-pink-500/60`}
  >
    <div className="h-12 mb-2 flex items-center justify-between gap-2">
      {preview}
    </div>
    <div className="flex items-center justify-between">
      <span className="text-white text-sm font-medium">{label}</span>
      {vip && (
        <Badge className="bg-lime-500 text-black text-[10px]">VIP</Badge>
      )}
    </div>
    {selected && (
      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white">✓</div>
    )}
  </button>
);

export function ChatBubbleThemeModal({ open, onOpenChange, value, onSelect }: ChatBubbleThemeModalProps) {
  const PreviewDefault = (
    <div className="flex w-full gap-2">
      <div className="h-6 w-14 rounded-xl bg-black/60" />
      <div className="h-6 w-16 rounded-xl bg-purple-900/70 ml-auto" />
    </div>
  );
  const PreviewDark = (
    <div className="flex w-full gap-2">
      <div className="h-6 w-14 rounded-xl bg-gray-700" />
      <div className="h-6 w-16 rounded-xl bg-black ml-auto" />
    </div>
  );
  const PreviewBlackPink = (
    <div className="flex w-full gap-2">
      <div className="h-6 w-14 rounded-xl bg-pink-500" />
      <div className="h-6 w-16 rounded-xl bg-gray-700 ml-auto" />
    </div>
  );
  const PreviewSeaSalt = (
    <div className="flex w-full gap-2">
      <div className="h-6 w-14 rounded-xl bg-sky-400/70" />
      <div className="h-6 w-16 rounded-xl bg-amber-200 ml-auto" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[70vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-4 py-3 flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-white text-center">Bubble Theme</DialogTitle>
          </DialogHeader>

          <div className="px-4 pb-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <ThemeCard label="Default Theme" selected={value==='default'} onClick={() => onSelect('default')} preview={PreviewDefault} />
              <ThemeCard label="Dark" selected={value==='dark'} onClick={() => onSelect('dark')} preview={PreviewDark} />
              <ThemeCard label="Black Pink" vip selected={value==='blackPink'} onClick={() => onSelect('blackPink')} preview={PreviewBlackPink} />
              <ThemeCard label="Sea Salt Cheese" vip selected={value==='seaSaltCheese'} onClick={() => onSelect('seaSaltCheese')} preview={PreviewSeaSalt} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
