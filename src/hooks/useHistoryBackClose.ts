import { useEffect, useRef } from "react";

/**
 * Syncs an "open" state (modal/sheet/drawer) with browser history so that:
 * - Opening pushes a history entry
 * - Hardware/browser back closes it instead of exiting the tab
 * - Manually closing consumes the pushed history entry
 *
 * Important: Do not navigate when the component unmounts. That can cause
 * unexpected route changes if a modal is open during navigation.
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
      // Close the modal and clean up listener when user presses back
      pushedRef.current = false;
      try {
        window.removeEventListener("popstate", onPopState);
      } catch {
        // no-op
      }
      onOpenChange(false);
    };

    if (open && !pushedRef.current) {
      // Push a new state so back will close the modal instead of leaving the page
      try {
        window.history.pushState({ __modal__: idRef.current, t: Date.now() }, "");
        pushedRef.current = true;
        window.addEventListener("popstate", onPopState);
      } catch {
        // no-op
      }
    }

    // When closing via UI, consume the pushed history entry only if it is ours
    if (!open && pushedRef.current) {
      const state = window.history.state as any;
      pushedRef.current = false;
      try {
        window.removeEventListener("popstate", onPopState);
        if (state && state.__modal__ === idRef.current) {
          window.history.back();
        }
      } catch {
        // no-op
      }
    }

    return () => {
      // On unmount just clean up listeners; do not mutate history
      try {
        window.removeEventListener("popstate", onPopState);
      } catch {
        // no-op
      }
      pushedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onOpenChange]);
}
