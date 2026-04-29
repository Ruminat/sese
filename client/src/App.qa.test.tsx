import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { FormEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { createDocument, listDocuments, updateDocument } from "./lib/api";
import {
  decryptFromStorage,
  encryptForStorage,
  getOrCreateClientKey,
  hasPinConfig,
  setupPin,
  verifyPin,
} from "./lib/crypto";

vi.mock("./lib/api", () => ({
  createDocument: vi.fn(),
  listDocuments: vi.fn(),
  updateDocument: vi.fn(),
}));

vi.mock("./lib/crypto", () => ({
  decryptFromStorage: vi.fn(),
  encryptForStorage: vi.fn(),
  getOrCreateClientKey: vi.fn(),
  hasPinConfig: vi.fn(),
  setupPin: vi.fn(),
  verifyPin: vi.fn(),
}));

vi.mock("./components/sidebar", () => ({
  Sidebar: ({ onSettingsClick }: { onSettingsClick: () => void }) => (
    <button type="button" onClick={onSettingsClick}>
      Open settings
    </button>
  ),
}));

vi.mock("./components/settings-panel", () => ({
  SettingsPanel: ({
    open,
    onExportBackup,
  }: {
    open: boolean;
    documents: Array<{ id: string }>;
    onClose: () => void;
    onExportBackup: () => void;
  }) => (open ? <button onClick={onExportBackup}>Export backup</button> : null),
}));

vi.mock("./components/document-list", () => ({
  DocumentList: ({
    documents,
    onSelectDocument,
    onCreateDocument,
  }: {
    documents: Array<{ id: string; title: string }>;
    selectedDocumentId: string | null;
    onSelectDocument: (id: string) => void;
    onCreateDocument: () => void;
  }) => (
    <div>
      <button type="button" onClick={onCreateDocument}>
        New
      </button>
      {documents.map((document) => (
        <button key={document.id} type="button" onClick={() => onSelectDocument(document.id)}>
          {document.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("./components/markdown-editor", () => ({
  MarkdownEditor: ({
    title,
    markdownValue,
    disabled,
    statusText,
    onTitleChange,
    onMarkdownChange,
  }: {
    title: string;
    markdownValue: string;
    disabled: boolean;
    statusText: string;
    onTitleChange: (value: string) => void;
    onMarkdownChange: (value: string) => void;
    onToast: (message: string) => void;
  }) => (
    <div>
      <span>{statusText}</span>
      <input
        aria-label="title"
        value={title}
        disabled={disabled}
        onChange={(event) => onTitleChange(event.target.value)}
      />
      <textarea
        aria-label="markdown"
        value={markdownValue}
        disabled={disabled}
        onChange={(event) => onMarkdownChange(event.target.value)}
      />
    </div>
  ),
}));

vi.mock("./components/pin-modal", () => ({
  PinModal: ({
    mode,
    pinInput,
    pinConfirmInput,
    pinError,
    onPinInputChange,
    onPinConfirmInputChange,
    onSubmit,
  }: {
    mode: "setup" | "verify";
    pinInput: string;
    pinConfirmInput: string;
    pinError: string;
    onPinInputChange: (value: string) => void;
    onPinConfirmInputChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  }) => (
    <form aria-label="pin-form" onSubmit={onSubmit}>
      <p>{mode === "setup" ? "setup" : "verify"}</p>
      <input
        aria-label="pin"
        value={pinInput}
        onChange={(event) => onPinInputChange(event.target.value)}
      />
      {mode === "setup" ? (
        <input
          aria-label="pin-confirm"
          value={pinConfirmInput}
          onChange={(event) => onPinConfirmInputChange(event.target.value)}
        />
      ) : null}
      {pinError ? <p>{pinError}</p> : null}
      <button type="submit">{mode === "setup" ? "Create PIN" : "Unlock"}</button>
    </form>
  ),
}));

const CLIENT_KEY = new Uint8Array([1, 2, 3]);
const PIN_KEY = new Uint8Array([4, 5, 6]);

const BASE_DOC = {
  id: "doc-1",
  title: "Vault note",
  encryptedContent: "cipher",
  iv: "nonce",
  authTag: "tag",
  createdAt: "2026-04-27T00:00:00.000Z",
  updatedAt: "2026-04-27T00:00:00.000Z",
};

beforeEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  vi.mocked(getOrCreateClientKey).mockResolvedValue(CLIENT_KEY);
  vi.mocked(hasPinConfig).mockReturnValue(true);
  vi.mocked(verifyPin).mockResolvedValue(PIN_KEY);
  vi.mocked(setupPin).mockResolvedValue(PIN_KEY);
  vi.mocked(listDocuments).mockResolvedValue([BASE_DOC]);
  vi.mocked(decryptFromStorage).mockResolvedValue("# Vault note\nSeed content");
  vi.mocked(encryptForStorage).mockResolvedValue({
    encryptedContent: "new-cipher",
    iv: "new-nonce",
    authTag: "mac-included",
  });
  vi.mocked(updateDocument).mockResolvedValue(BASE_DOC);
  vi.mocked(createDocument).mockResolvedValue(BASE_DOC);
});

afterEach(() => {
  cleanup();
});

async function unlockVault(): Promise<void> {
  render(<App />);

  await screen.findByLabelText("pin");
  fireEvent.change(screen.getByLabelText("pin"), { target: { value: "1234" } });
  fireEvent.submit(screen.getByLabelText("pin-form"));

  await waitFor(() => expect(verifyPin).toHaveBeenCalledWith("1234"));
  await waitFor(() => expect(listDocuments).toHaveBeenCalledTimes(1));
}

describe("App UI QA flows", () => {
  it("unlocks with PIN and loads decrypted documents", async () => {
    await unlockVault();

    expect(await screen.findByText("Vault note")).toBeTruthy();
    const markdownField = screen.getByLabelText("markdown") as HTMLTextAreaElement;
    expect(markdownField.value).toBe("# Vault note\nSeed content");
  });

  it("autosaves 3 seconds after editor changes", async () => {
    await unlockVault();

    fireEvent.change(screen.getByLabelText("markdown"), {
      target: { value: "# Vault note\nUpdated content" },
    });

    await waitFor(() => expect(encryptForStorage).toHaveBeenCalledTimes(1), { timeout: 6000 });
    await waitFor(() =>
      expect(updateDocument).toHaveBeenCalledWith("doc-1", {
        title: "Vault note",
        encryptedContent: "new-cipher",
        iv: "new-nonce",
        authTag: "mac-included",
      }),
    );
  }, 15000);

  it("exports backup from settings panel", async () => {
    const createObjectUrlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:backup");
    const revokeObjectUrlSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    await unlockVault();

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    fireEvent.click(await screen.findByRole("button", { name: "Export backup" }));

    await waitFor(() => expect(createObjectUrlSpy).toHaveBeenCalledTimes(1));
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:backup");
  });
});
