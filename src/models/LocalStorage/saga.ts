import { isEmpty } from "@shreklabs/core";
import { $LocalStorage, localStorageKeys } from "./store";
import { readFromLocalStorage } from "./utils";
import { mergeObjectsOnly } from "../../lib/lodash/mergeObjects";

export function localStorageSaga() {
  loadLocalStorageIntoStore();
}

function loadLocalStorageIntoStore() {
  const savedValues: Record<string, unknown> = {};

  for (const key of localStorageKeys) {
    const value = readFromLocalStorage(key);
    if (isEmpty(value)) continue;
    savedValues[key] = value;
  }

  if (Object.values(savedValues).length === 0) {
    return;
  }

  const oldValues = $LocalStorage.get();

  $LocalStorage.set(mergeObjectsOnly(oldValues, savedValues));
}
