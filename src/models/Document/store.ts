import { atom } from "nanostores";
import { TDocument } from "./definitions";

export const $Documents = atom<TDocument[]>([]);
export const $SelectedDocument = atom<TDocument | undefined>(undefined);

export const Documents = {
  Select: (document: TDocument | undefined) => {
    $SelectedDocument.set(document);
  },
  Set: (documents: TDocument[]) => {
    $Documents.set(documents);
    $SelectedDocument.set(undefined);
  },
  Add: (document: TDocument) => {
    $Documents.set([document, ...$Documents.get()]);
  },
  Update: (code: TDocument["code"], updated: Partial<TDocument>) => {
    const currentDocuments = $Documents.get();
    const newDocuments = currentDocuments.map((document) =>
      document.code === code ? { ...document, ...updated } : document
    );
    $Documents.set(newDocuments);
  },
  Remove: (document: TDocument) => {
    const selected = $SelectedDocument.get();
    if (selected && document.code === selected.code) {
      $SelectedDocument.set(undefined);
    }

    $Documents.set($Documents.get().filter(({ code }) => code !== document.code));
  },
};
