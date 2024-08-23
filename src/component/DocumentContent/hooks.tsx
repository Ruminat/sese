import { FloppyDisk, Pencil } from "@gravity-ui/icons";
import { Button, Icon, TextArea } from "@gravity-ui/uikit";
import { useFn } from "@shreklabs/ui";
import { useMemo, useState } from "react";
import cls from "./style.module.scss";
import { TDocument } from "../../models/Document/definitions";
import { Documents } from "../../models/Document/store";

export function useDocumentContentActions(document: TDocument) {
  const [edit, setEdit] = useState(false);
  const [content, setContent] = useState(document.content);

  const onEdit = useFn(() => setEdit(true));
  const onSave = useFn(() => {
    Documents.Update(document.code, { content });
  });

  const readonlyActions = useMemo(
    () => (
      <>
        <Button className={cls.actionButton} view='action' onClick={onEdit}>
          <Icon data={Pencil} />
          Edit
        </Button>
      </>
    ),
    [onEdit]
  );

  const editActions = useMemo(
    () => (
      <>
        <Button className={cls.actionButton} view='action'>
          <Icon data={FloppyDisk} />
          Save
        </Button>
      </>
    ),
    []
  );

  const actions = edit ? editActions : readonlyActions;

  const renderedEdit = <TextArea className={cls.content} value={content} onUpdate={setContent} />;

  return { renderedEdit: edit ? renderedEdit : null, actions };
}
