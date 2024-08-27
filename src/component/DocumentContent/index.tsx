import { Dialog, Flex, TextArea } from "@gravity-ui/uikit";
import { useCloseOnEsc, useFn } from "@shreklabs/ui";
import { memo, useState } from "react";
import { TDocument } from "../../models/Document/definitions";
import { Documents } from "../../models/Document/store";
import { createDialog } from "../Dialog";
import cls from "./style.module.scss";

type TProps = {
  document: TDocument;
};

type TDialogProps = {
  onClose: () => void;
} & TProps;

const { openDialog, useDialog } = createDialog<TProps>();

export const openDocumentContentDialog = openDialog;

export const DocumentContentDialog = memo(function DocumentDialog() {
  const { open, propsRef, onClose } = useDialog();

  return open ? <DocumentContentDialogComponent {...(propsRef.current as TProps)} onClose={onClose} /> : null;
});

const DocumentContentDialogComponent = memo(function DocumentContentDialogComponent(props: TDialogProps) {
  const [content, setContent] = useState(props.document.content);

  const onClose = useFn(() => {
    if (content !== props.document.content) {
      Documents.Update(props.document.code, { content });
    }

    props.onClose();

    Documents.Select(undefined);
  });

  useCloseOnEsc(onClose);

  return (
    <Dialog className={cls.dialog} open={true} onClose={onClose} disableAutoFocus={true}>
      <Dialog.Header caption='New document' />
      <Dialog.Body className={cls.body}>
        <Flex gap={4}>
          {
            <TextArea
              className={cls.content}
              value={content}
              onUpdate={setContent}
              autoFocus={true}
              controlProps={{ spellCheck: false }}
            />
          }
        </Flex>
      </Dialog.Body>
      <Dialog.Footer textButtonCancel='Close' onClickButtonCancel={onClose} />
    </Dialog>
  );
});
