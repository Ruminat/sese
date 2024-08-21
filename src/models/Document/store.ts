import { atom } from "nanostores";
import { TDocument } from "./definitions";

export const $Documents = atom<TDocument[]>([]);
export const $SelectedDocument = atom<TDocument | undefined>(undefined);

export const Document = {
  Set: (documents: TDocument[]) => {
    $Documents.set(documents);
    $SelectedDocument.set(undefined);
  },
  Add: (document: TDocument) => {
    $Documents.set([document, ...$Documents.get()]);
  },
  Remove: (document: TDocument) => {
    $Documents.set($Documents.get().filter(({ code }) => code !== document.code));

    const selected = $SelectedDocument.get();
    if (selected && document.code === selected.code) {
      $SelectedDocument.set(undefined);
    }
  },
};
