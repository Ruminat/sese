import type { TServerDocument } from "./lib/api";

export type TLocalDocument = TServerDocument & {
  plaintext: string;
  isNew: boolean;
};

export type TSyncState = "idle" | "loading" | "encrypting" | "saving" | "saved" | "error";
