import { noop } from "@shreklabs/core";
import { useFn } from "@shreklabs/ui";
import { useEffect, useRef, useState } from "react";

export function createDialog<TProps>() {
  let openDialog = (props: TProps) => noop();

  function useDialog() {
    const [open, setOpen] = useState(false);
    const propsRef = useRef<TProps | undefined>(undefined);

    const onOpen = useFn((props: TProps) => {
      propsRef.current = props;
      setOpen(true);
    });
    const onClose = useFn(() => setOpen(false));

    useEffect(() => {
      openDialog = (props) => {
        onOpen(props);
      };

      return () => {
        openDialog = noop;
      };
    }, [onOpen]);

    return { open, propsRef, onOpen, onClose };
  }

  return { openDialog: (props: TProps) => openDialog(props), useDialog };
}
