import { Flex, Loader, Text, ThemeProvider } from "@gravity-ui/uikit";
import { useStore } from "@nanostores/react";
import { Layout } from "@shreklabs/ui";
import { useEffect, useState } from "react";
import { getStorageType, STORAGE_TYPE } from "./common/environment";
import { AppActions } from "./component/AppActions";
import { DocumentContentDialog } from "./component/DocumentContent";
import { DocumentDialog } from "./component/DocumentDialog";
import { DocumentItem } from "./component/DocumentItem";
import { loadAppState, updateSavedAppStateOnStoreChanges } from "./models/App/sagas";
import { $Documents } from "./models/Document/store";
import { useHotkeys } from "./models/Hotkey/hooks";
import { LocalStorage } from "./models/LocalStorage/store";
import cls from "./style.module.scss";

function App() {
  const [loaded, setLoaded] = useState(false);
  const documents = useStore($Documents);

  useHotkeys();

  useEffect(() => {
    const abortController = new AbortController();

    if (getStorageType() === STORAGE_TYPE.localStorage) {
      const state = LocalStorage.app.state.read();

      loadAppState(state);
      setLoaded(true);
      updateSavedAppStateOnStoreChanges();

      return;
    }

    fetch("https://storage.yandexcloud.net/sese/data", { mode: "cors" })
      .then((result) => result.json())
      .then((result) => {
        loadAppState(result);
      })
      .catch((error) => {
        console.log("Main saga error", error);
      })
      .finally(() => {
        setLoaded(true);
      });

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <ThemeProvider theme='system'>
      <Layout>
        <Flex className={cls.page} direction='column' gap={4}>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text variant='header-2'>Documents</Text>
            <AppActions loaded={loaded} />
          </Flex>

          {loaded
            ? documents.map((document) => <DocumentItem key={document.code} document={document} />)
            : renderLoading()}
        </Flex>

        <DocumentDialog />
        <DocumentContentDialog />
      </Layout>
    </ThemeProvider>
  );
}

function renderLoading() {
  return (
    <Flex className={cls.empty} alignItems='center' justifyContent='center'>
      <Loader size='l' />
    </Flex>
  );
}

export default App;
