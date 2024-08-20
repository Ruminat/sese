import { Button, Flex, Text, ThemeProvider } from "@gravity-ui/uikit";
import { useStore } from "@nanostores/react";
import { Layout, useFn } from "@shreklabs/ui";
import { DocumentItem } from "./component/DocumentItem";
import { TDocument } from "./models/Document/definitions";
import { $documents } from "./models/Document/store";
import cls from "./style.module.scss";

function App() {
  const onSelect = useFn((document: TDocument) => {
    console.log("SELECTED", document);
  });

  const documents = useStore($documents);

  return (
    <ThemeProvider theme='system'>
      <Layout>
        <Flex className={cls.page} direction='column' gap={4}>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text variant='header-2'>Documents</Text>
            <Button view='action' disabled>
              Persist changes
            </Button>
          </Flex>
          {documents.map((document) => (
            <DocumentItem key={document.code} document={document} onSelect={onSelect} />
          ))}
        </Flex>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
