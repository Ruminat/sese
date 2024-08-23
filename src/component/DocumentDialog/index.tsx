import { Checkbox, Dialog, Flex, Text, TextArea, TextInput } from "@gravity-ui/uikit";
import { useFn } from "@shreklabs/ui";
import { memo, ReactNode, useState } from "react";
import { transformNameToCode } from "../../common/core/utils";
import { TDocument } from "../../models/Document/definitions";
import { createEmptyDocument } from "../../models/Document/utils";
import { createDialog } from "../Dialog";
import cls from "./style.module.scss";
import { Documents } from "../../models/Document/store";

const { openDialog, useDialog } = createDialog<void>();

export const openCreateDocumentDialog = openDialog;

export const DocumentDialog = memo(function DocumentDialog() {
  const { open, propsRef, onClose } = useDialog();

  return open ? <DocumentDialogContent {...(propsRef.current ?? {})} onClose={onClose} /> : null;
});

const DocumentDialogContent = memo(function DocumentDialogContent({ onClose }: { onClose: () => void }) {
  const [documentForm, setDocumentForm] = useState(createEmptyDocument());

  const onCreate = useFn(() => {
    Documents.Add(documentForm);
    onClose();
  });

  const updateForm = useFn((updated: Partial<TDocument>) => setDocumentForm((current) => ({ ...current, ...updated })));
  const onUpdateName = useFn((value: string) => {
    updateForm({ name: value, code: transformNameToCode(value) });
  });
  const onUpdateCode = useFn((value: string) => updateForm({ code: value }));
  const onUpdateSecret = useFn((value: boolean) => updateForm({ secret: value }));
  const onUpdateContent = useFn((value: string) => updateForm({ content: value }));

  return (
    <Dialog open={true} onClose={onClose} disableAutoFocus={true}>
      <Dialog.Header caption='New document' />
      <Dialog.Body className={cls.body}>
        <Flex direction='column' gap={4}>
          {field(
            { title: "Name" },
            <TextInput
              placeholder='Some meaningful name'
              value={documentForm.name}
              onUpdate={onUpdateName}
              autoFocus={true}
            />
          )}
          {field(
            { title: "Code" },
            <TextInput placeholder='unique-code' value={documentForm.code} onUpdate={onUpdateCode} />
          )}
          <Checkbox checked={documentForm.secret} onUpdate={onUpdateSecret}>
            Secret
          </Checkbox>
          <TextArea
            className={cls.textarea}
            controlProps={{ spellCheck: false }}
            value={documentForm.content}
            onUpdate={onUpdateContent}
            minRows={6}
            maxRows={15}
          />
        </Flex>
      </Dialog.Body>
      <Dialog.Footer textButtonApply='Create' onClickButtonApply={onCreate} />
    </Dialog>
  );
});

function field({ title }: { title: ReactNode }, content: ReactNode) {
  return (
    <Flex direction='column' gap={2}>
      <Text variant='subheader-1'>{title}</Text>
      {content}
    </Flex>
  );
}
