import { TDocument } from "./definitions";

export function createEmptyDocument(): TDocument {
  return {
    secret: true,
    title: "",
    code: "",
    content: "",
    createdAt: Date.now(),
  };
}
