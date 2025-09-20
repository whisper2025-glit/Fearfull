import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { getUserInstructions, upsertUserInstructions } from "@/lib/supabase";
import { toast } from "sonner";

interface CommandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
  onSave?: (value: {
    dontRefuse: boolean;
    reduceRepetition: boolean;
    customEnabled: boolean;
    customText: string;
    makeDefault: boolean;
  }) => void;
}

const PREVIEW_IMAGES = [
  "https://cdn.builder.io/api/v1/image/assets%2Fe94115ef60444f66ad2b62a07d981ac7%2Ff826b7d98142420182119672d5a6ec49?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2Fe94115ef60444f66ad2b62a07d981ac7%2F01dfe1822c94405f9d49d305b879a99e?format=webp&width=800"
];

export function CommandModal({ open, onOpenChange, onSave, userId }: CommandModalProps) {
  const stored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("command_instructions") || "null"); } catch { return null; }
  }, []);

  // Hydrate from Supabase when opened
  const [isLoading, setIsLoading] = useState(false);
  const loadFromServer = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const row = await getUserInstructions(userId);
      if (row) {
        setDontRefuse(!!row.dont_refuse);
        setReduceRepetition(!!row.reduce_repetition);
        setCustomEnabled(!!row.custom_text);
        setCustomText(row.custom_text || "");
        // cache for AI client
        localStorage.setItem("command_instructions_server", JSON.stringify({
          dontRefuse: !!row.dont_refuse,
          reduceRepetition: !!row.reduce_repetition,
          customEnabled: !!row.custom_text,
          customText: row.custom_text || ""
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (open) {
    // simple effect-less load on open render
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadFromServer();
  }

  const [dontRefuse, setDontRefuse] = useState<boolean>(stored?.dontRefuse ?? false);
  const [reduceRepetition, setReduceRepetition] = useState<boolean>(stored?.reduceRepetition ?? false);
  const [customEnabled, setCustomEnabled] = useState<boolean>(stored?.customEnabled ?? false);
  const [customText, setCustomText] = useState<string>(stored?.customText ?? "");
  const [makeDefault, setMakeDefault] = useState<boolean>(stored?.makeDefault ?? false);

  const handleSave = async () => {
    const value = { dontRefuse, reduceRepetition, customEnabled, customText, makeDefault };
    if (makeDefault && userId) {
      const saved = await upsertUserInstructions(userId, {
        dont_refuse: dontRefuse,
        reduce_repetition: reduceRepetition,
        custom_text: customEnabled ? customText : ''
      });
      if (saved) {
        localStorage.setItem("command_instructions_server", JSON.stringify({
          dontRefuse: saved.dont_refuse,
          reduceRepetition: saved.reduce_repetition,
          customEnabled: !!saved.custom_text,
          customText: saved.custom_text || ''
        }));
        toast.success('Default instructions saved');
      } else {
        toast.error('Failed to save default instructions');
      }
    } else {
      localStorage.setItem("command_instructions", JSON.stringify(value));
    }
    onSave?.(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-background border-border p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden text-xs">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="relative w-full h-28 flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-2">
              {PREVIEW_IMAGES.map((src, i) => (
                <img key={i} src={src} alt="preview" className="w-full h-full object-cover" />
              ))}
            </div>
            <div className="absolute inset-0 bg-black/50" />
            <DialogHeader className="relative z-10 h-full flex items-center justify-center">
              <DialogTitle className="text-sm font-bold text-white">Choose Instructions</DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-4 flex-1 overflow-y-auto min-h-0 space-y-4">
            <p className="text-muted-foreground text-xs">
              Instructions help reduce certain issues during conversations. The content is integrated into the current message at the underlying level.
            </p>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Checkbox checked={dontRefuse} onCheckedChange={(v) => setDontRefuse(Boolean(v))} />
                <span className="text-foreground text-xs">Don't refuse what user said (Must not violate ToS)</span>
              </label>

              <label className="flex items-center gap-3">
                <Checkbox checked={reduceRepetition} onCheckedChange={(v) => setReduceRepetition(Boolean(v))} />
                <span className="text-foreground text-xs">Reduce repetition</span>
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <Checkbox checked={customEnabled} onCheckedChange={(v) => setCustomEnabled(Boolean(v))} />
                  <span className="text-foreground text-xs">Custom</span>
                </label>
                <div className="pl-7 space-y-1">
                  <Label htmlFor="customText" className="sr-only">Custom instruction</Label>
                  <Textarea
                    id="customText"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    disabled={!customEnabled}
                    placeholder="Enter your custom instruction here (e.g., 'Reply in English')."
                    className="bg-secondary/50 border-border min-h-[88px] text-xs"
                    maxLength={300}
                  />
                  <div className="text-right text-muted-foreground text-[10px]">{customText.length} / 300</div>
                </div>
              </div>
            </div>

            <label className="mt-2 flex items-center gap-3">
              <Checkbox checked={makeDefault} onCheckedChange={(v) => setMakeDefault(Boolean(v))} />
              <span className="text-foreground text-xs">Make it default</span>
            </label>
          </div>

          {/* Footer */}
          <DialogFooter className="p-6 pt-0 flex-shrink-0 gap-2 sm:gap-2">
            <Button variant="outline" size="sm" className="w-full" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button size="sm" className="w-full" onClick={handleSave} disabled={isLoading}>Save</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
