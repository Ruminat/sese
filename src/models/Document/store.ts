import { atom } from "nanostores";
import { DOCUMENTS } from "../../documents";
import { TDocument } from "./definitions";

export const $documents = atom<TDocument[]>(DOCUMENTS);

export const Document = {
  Add: (document: TDocument) => {
    $documents.set([document, ...$documents.get()]);
  },
  Remove: (document: TDocument) => {
    $documents.set($documents.get().filter(({ code }) => code !== document.code));
  },
};
