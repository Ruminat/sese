import { Lock, Settings } from "lucide-react";

interface TSidebarProps {
  onSettingsClick: () => void;
}

export function Sidebar({ onSettingsClick }: TSidebarProps) {
  return (
    <aside className="panel app-sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Lock size={16} />
        </div>
        <div>
          <h1>SecureVault</h1>
          <p>Encrypted Markdown Vault</p>
        </div>
      </div>
      <button type="button" className="settings-link" onClick={onSettingsClick}>
        <Settings size={14} />
        Encryption Settings
      </button>
    </aside>
  );
}
