import { File, Lock, TrashBin } from "@gravity-ui/icons";
import { Button, Flex, Icon, Popup, Text, Tooltip } from "@gravity-ui/uikit";
import { useFn } from "@shreklabs/ui";
import dayjs from "dayjs";
import { memo, MouseEventHandler, useMemo, useRef, useState } from "react";
import { TDocument } from "../../models/Document/definitions";
import { $SelectedDocument, Documents } from "../../models/Document/store";
import cls from "./style.module.scss";

type TProps = {
  document: TDocument;
};

export const DocumentItem = memo(function DocumentItem(props: TProps) {
  const { secret, code, name: title, createdAt } = props.document;

  const icon = useMemo(() => {
    const content = (
      <span>
        <Icon data={secret ? Lock : File} />
      </span>
    );

    return secret ? (
      <Tooltip
        content={
          <>
            A secret document <br /> Protected by encryption
          </>
        }
      >
        {content}
      </Tooltip>
    ) : (
      content
    );
  }, [secret]);

  const metaInfo = useMemo(
    () => (
      <Flex direction='column'>
        <Text>{title}</Text>
        <Text variant='code-2' color='secondary'>
          {code} — {dayjs(createdAt).format("DD.MM.YYYY")}
        </Text>
      </Flex>
    ),
    [code, title, createdAt]
  );

  const onDelete = useFn(() => Documents.Remove(props.document));

  const actions = useMemo(
    () => (
      <Flex className={cls.actions} gap={1}>
        <DocumentDeleteAction onDelete={onDelete} />
      </Flex>
    ),
    [onDelete]
  );

  const onSelect = useFn(() => $SelectedDocument.set(props.document));

  return (
    <Flex className={cls.item} alignItems='center' justifyContent='space-between' onClick={onSelect}>
      <Flex gap={4} alignItems='center'>
        {icon}
        {metaInfo}
      </Flex>
      {actions}
    </Flex>
  );
});

function DocumentDeleteAction(props: { onDelete: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);

  const onClose = useFn(() => setOpened(false));
  const onToggleOpened = useFn(() => setOpened(!opened));
  const onDelete = useFn(() => {
    onClose();
    props.onDelete();
  });
  const onClick: MouseEventHandler = useFn((event) => {
    onToggleOpened();
    event.stopPropagation();
  });

  return (
    <>
      <Button ref={ref} size='s' view='flat-danger' onClick={onClick}>
        <Icon data={TrashBin} />
      </Button>
      <Popup open={opened} autoFocus={false} anchorRef={ref} onEscapeKeyDown={onClose} onOutsideClick={onClose}>
        <Flex direction='column' gap={2} style={{ padding: "12px", textAlign: "center" }}>
          <Text>
            You're going to <Text color='danger'>delete</Text> this document!
            <br />
            Are you sure about that?
          </Text>
          <Flex justifyContent='space-between'>
            <Button size='s' onClick={onClose}>
              No
            </Button>
            <Button size='s' view='action' extraProps={{ autoFocus: true }} onClick={onDelete}>
              Yes
            </Button>
          </Flex>
        </Flex>
      </Popup>
    </>
  );
}
