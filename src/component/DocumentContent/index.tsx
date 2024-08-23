import { Xmark } from "@gravity-ui/icons";
import { Button, Flex, Icon, TextArea } from "@gravity-ui/uikit";
import { delay } from "@shreklabs/core";
import { useCloseOnEsc, useFn } from "@shreklabs/ui";
import { memo, useEffect, useMemo, useRef } from "react";
import { TDocument } from "../../models/Document/definitions";
import { Documents } from "../../models/Document/store";
import cls from "./style.module.scss";
import { useDocumentContentActions } from "./hooks";

type TProps = {
  document: TDocument;
};

export const DocumentContent = memo(function DocumentContent(props: TProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;

    delay(10).then(() => {
      container?.classList.add(cls.visible);
    });

    return () => {
      container?.classList.remove(cls.visible);
    };
  }, []);

  const { renderedEdit, actions } = useDocumentContentActions(props.document);

  const onClose = useFn(() => {
    Documents.Select(undefined);
  });

  useCloseOnEsc(onClose);

  const exit = useMemo(
    () => (
      <Flex className={cls.close}>
        <Button view='flat' onClick={onClose}>
          <Icon data={Xmark} />
        </Button>
      </Flex>
    ),
    [onClose]
  );

  return (
    <Flex className={cls.container} ref={ref} alignItems='center' justifyContent='center'>
      <Flex gap={4}>
        {renderedEdit ?? <div className={cls.content}>{props.document.content}</div>}
        <Flex className={cls.actions} direction='column' justifyContent='center' gap={2}>
          {actions}
        </Flex>
      </Flex>
      {exit}
    </Flex>
  );
});
