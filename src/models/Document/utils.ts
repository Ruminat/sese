import { TDocument } from "./definitions";

export function createEmptyDocument(): TDocument {
  return {
    secret: true,
    name: "",
    code: "",
    content: "",
    createdAt: Date.now(),
  };
}
