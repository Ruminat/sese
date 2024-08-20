import { getGloballyUniqueId } from "@shreklabs/core";
import { TDocument } from "./models/Document/definitions";
import { createEmptyDocument } from "./models/Document/utils";

export const DOCUMENTS: TDocument[] = Array.from({ length: 3 }).map((_, i) => ({
  ...createEmptyDocument(),
  title: `Super mega awesome title ${i + 1}`,
  code: getGloballyUniqueId(),
}));
