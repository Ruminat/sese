import { logError } from "@shreklabs/core";

export function readFromLocalStorage(key: string): unknown {
  try {
    const value = localStorage.getItem(key);

    if (typeof value !== "string") return null;

    return JSON.parse(value);
  } catch (error) {
    logError(error, "LocalStorage error (read)");
    return null;
  }
}

export function writeToLocalStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logError(error, "LocalStorage error (write)");
  }
}
