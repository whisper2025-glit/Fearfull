import { useEffect, useRef } from "react";

/**
 * Syncs an "open" state (modal/sheet/drawer) with browser history so that:
 * - Opening pushes a history entry
 * - Hardware/browser back closes it instead of exiting the tab
 * - Manually closing consumes the pushed history entry
 */
export function useHistoryBackClose(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  id: string = "modal"
) {
  const pushedRef = useRef(false);
  const idRef = useRef(id);

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (!pushedRef.current) return;
      // Close the modal and mark that our entry has been consumed
      pushedRef.current = false;
      onOpenChange(false);
    };

    if (open && !pushedRef.current) {
      // Push a new state so back will close the modal instead of the tab
      try {
        window.history.pushState({ __modal__: idRef.current, t: Date.now() }, "");
        pushedRef.current = true;
        window.addEventListener("popstate", onPopState);
      } catch {
        // no-op
      }
    }

    // When closing via UI, consume the pushed history entry so the stack stays clean
    if (!open && pushedRef.current) {
      pushedRef.current = false;
      try {
        window.removeEventListener("popstate", onPopState);
        window.history.back();
      } catch {
        // no-op
      }
    }

    return () => {
      // Cleanup if the component unmounts while open
      if (pushedRef.current) {
        pushedRef.current = false;
        try {
          window.removeEventListener("popstate", onPopState);
          window.history.back();
        } catch {
          // no-op
        }
      } else {
        window.removeEventListener("popstate", onPopState);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onOpenChange]);
}
