import { useFn } from "@shreklabs/ui";
import { useEffect } from "react";

export function useHotkeys() {
  const handler = useFn((event: KeyboardEvent) => {
    if (Math.random() > 1) {
      console.log("keyboard", event);
    }
  });

  useEffect(() => {
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [handler]);
}
