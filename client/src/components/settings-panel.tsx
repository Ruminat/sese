import { Download, X } from "lucide-react";
import type { TLocalDocument } from "../types";

interface TSettingsPanelProps {
  open: boolean;
  documents: TLocalDocument[];
  onClose: () => void;
  onExportBackup: () => void;
}

export function SettingsPanel({ open, documents, onClose, onExportBackup }: TSettingsPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <section className="settings-panel">
        <header>
          <div>
            <h2>Encryption Settings</h2>
            <p>Manage security and backups</p>
          </div>
          <button type="button" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="settings-content">
          <div className="settings-card">
            <h3>Backup</h3>
            <p>Export your decrypted documents as a JSON backup.</p>
            <button type="button" onClick={onExportBackup}>
              <Download size={14} /> Export backup
            </button>
          </div>
        </div>
        <footer>{documents.length} documents</footer>
      </section>
    </>
  );
}
