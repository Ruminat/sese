import { useState } from "react";
import { Check, Copy, CreditCard, Eye, EyeOff, KeyRound, Lock, StickyNote } from "lucide-react";

interface TSecureElementProps {
  value: string;
  onToast: (message: string) => void;
}

interface TFieldElementProps extends TSecureElementProps {
  label: string;
}

function useCopy(onToast: (message: string) => void) {
  const [copied, setCopied] = useState(false);

  const copyValue = async (value: string, message: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    onToast(message);
    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  return { copied, copyValue };
}

export function CardElement({ value, onToast }: TSecureElementProps) {
  const [revealed, setRevealed] = useState(false);
  const { copied, copyValue } = useCopy(onToast);
  const digits = value.trim().replace(/\s|-/g, "");
  const masked = digits.replace(/\d(?=\d{4})/g, "•");
  const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
  const maskedFormatted = masked.replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className="secure-element secure-card">
      <div>
        <p className="secure-title">
          <CreditCard size={14} /> Card
        </p>
        <p>{revealed ? formatted : maskedFormatted}</p>
      </div>
      <div className="secure-actions">
        <button type="button" onClick={() => setRevealed((prev) => !prev)}>
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button type="button" onClick={() => void copyValue(digits, "Card copied")}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <span className="secure-lock">
          <Lock size={12} />
        </span>
      </div>
    </div>
  );
}

export function PasswordElement({ value, onToast }: TSecureElementProps) {
  const [revealed, setRevealed] = useState(false);
  const { copied, copyValue } = useCopy(onToast);

  return (
    <div className="secure-element secure-password">
      <div>
        <p className="secure-title">
          <KeyRound size={14} /> Password
        </p>
        <p>{revealed ? value : "•".repeat(Math.max(8, Math.min(16, value.length)))}</p>
      </div>
      <div className="secure-actions">
        <button type="button" onClick={() => setRevealed((prev) => !prev)}>
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button type="button" onClick={() => void copyValue(value, "Password copied")}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export function NoteElement({ value, onToast }: TSecureElementProps) {
  const { copied, copyValue } = useCopy(onToast);

  return (
    <div className="secure-element secure-note">
      <div>
        <p className="secure-title">
          <StickyNote size={14} /> Secure note
        </p>
        <p>{value}</p>
      </div>
      <div className="secure-actions">
        <button type="button" onClick={() => void copyValue(value, "Note copied")}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export function FieldElement({ label, value, onToast }: TFieldElementProps) {
  const { copied, copyValue } = useCopy(onToast);

  return (
    <div className="secure-element secure-field">
      <div>
        <p className="secure-title">{label}</p>
        <p>{value}</p>
      </div>
      <div className="secure-actions">
        <button type="button" onClick={() => void copyValue(value, `${label} copied`)}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
