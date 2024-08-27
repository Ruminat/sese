import { FloppyDisk, Plus } from "@gravity-ui/icons";
import { Button, Flex, Icon } from "@gravity-ui/uikit";
import { useFn } from "@shreklabs/ui";
import { memo } from "react";
import { saveAppState } from "../../models/App/sagas";
import { openCreateDocumentDialog } from "../DocumentDialog";

export const AppActions = memo(function AppActions({ loaded }: { loaded: boolean }) {
  const onSave = useFn(() => {
    saveAppState();
  });

  return (
    <Flex gap={2}>
      <Button disabled={!loaded} onClick={() => openCreateDocumentDialog()}>
        <Icon data={Plus} />
        Document
      </Button>
      <Button view='action' disabled={!loaded} onClick={onSave}>
        <Icon data={FloppyDisk} />
        Save
      </Button>
    </Flex>
  );
});
