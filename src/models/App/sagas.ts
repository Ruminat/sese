import copy from "copy-to-clipboard";
import { getStorageType, STORAGE_TYPE } from "../../common/environment";
import { $Documents, Documents } from "../Document/store";
import { LocalStorage } from "../LocalStorage/store";
import { TAppState } from "./definitions";

export function getCurrentAppState(): TAppState {
  return { documents: $Documents.get() };
}

export function loadAppState(state: TAppState) {
  if (state.documents) {
    Documents.Set(state.documents);
  }
}

export function saveAppState() {
  const appState = getCurrentAppState();

  switch (getStorageType()) {
    case STORAGE_TYPE.localStorage:
      return LocalStorage.app.state.write(appState);
    case STORAGE_TYPE.s3:
      return copy(JSON.stringify(appState));
  }
}

export function updateSavedAppStateOnStoreChanges() {
  $Documents.subscribe(saveAppState);
}
