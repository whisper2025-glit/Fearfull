import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChatPageSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatPageSettingsModal({ open, onOpenChange }: ChatPageSettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center">
              <DialogTitle className="text-lg font-bold text-cyan-400" style={{ fontSize: '18px' }}>
                Customize Chat Page
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-4 pb-4 flex-1 overflow-y-auto min-h-0">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ffc6075193f494d3bb6a492134653a1aa%2F0549f882248b40ada94beaba94fc44eb?format=webp&width=800"
                alt="Customize Chat Page settings screenshot"
                className="max-w-full max-h-full rounded-xl object-contain shadow"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
