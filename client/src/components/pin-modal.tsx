import { Lock, Shield } from "lucide-react";
import type { FormEvent } from "react";

interface TPinModalProps {
  mode: "setup" | "verify";
  pinInput: string;
  pinConfirmInput: string;
  pinError: string;
  onPinInputChange: (value: string) => void;
  onPinConfirmInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function PinModal({
  mode,
  pinInput,
  pinConfirmInput,
  pinError,
  onPinInputChange,
  onPinConfirmInputChange,
  onSubmit,
}: TPinModalProps) {
  return (
    <section className="pin-modal">
      <div className="pin-modal-card">
        <div className="pin-icon">
          {mode === "setup" ? <Shield size={20} /> : <Lock size={20} />}
        </div>
        <h1>{mode === "setup" ? "Create Your PIN" : "Enter Your PIN"}</h1>
        <p>
          {mode === "setup"
            ? "Choose a PIN to derive your encryption key."
            : "Use your PIN to unlock encrypted documents."}
        </p>
        <form onSubmit={onSubmit}>
          <label htmlFor="pin-input">PIN</label>
          <input
            id="pin-input"
            type="password"
            value={pinInput}
            autoComplete="off"
            onChange={(event) => onPinInputChange(event.target.value)}
          />
          {mode === "setup" && (
            <>
              <label htmlFor="pin-confirm">Confirm PIN</label>
              <input
                id="pin-confirm"
                type="password"
                value={pinConfirmInput}
                autoComplete="off"
                onChange={(event) => onPinConfirmInputChange(event.target.value)}
              />
            </>
          )}
          {pinError && <p className="error-text">{pinError}</p>}
          <button type="submit">{mode === "setup" ? "Create PIN" : "Unlock"}</button>
        </form>
      </div>
    </section>
  );
}
