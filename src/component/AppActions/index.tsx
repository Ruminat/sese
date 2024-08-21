import { FloppyDisk, Plus } from "@gravity-ui/icons";
import { Button, Flex, Icon } from "@gravity-ui/uikit";
import { useStore } from "@nanostores/react";
import { useFn } from "@shreklabs/ui";
import copy from "copy-to-clipboard";
import { memo } from "react";
import { $Documents } from "../../models/Document/store";
import { openCreateDocumentDialog } from "../DocumentDialog";

export const AppActions = memo(function AppActions({ loaded }: { loaded: boolean }) {
  const documents = useStore($Documents);

  const onSave = useFn(() => {
    const content = JSON.stringify({ documents });

    copy(content);
  });

  return (
    <Flex gap={2}>
      <Button
        disabled={!!loaded}
        onClick={() => {
          console.log("CLICKED");
          openCreateDocumentDialog();
        }}
      >
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
