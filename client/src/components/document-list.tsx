import { useMemo, useState } from "react";
import { Clock, FileText, Lock, Plus, Search } from "lucide-react";
import type { TLocalDocument } from "../types";

interface TDocumentListProps {
  documents: TLocalDocument[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
}

export function DocumentList({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onCreateDocument,
}: TDocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = useMemo(
    () =>
      documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.plaintext.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [documents, searchQuery],
  );

  return (
    <div className="panel document-panel">
      <header className="panel-header">
        <div>
          <h2>Your Documents</h2>
          <p>{documents.length} encrypted documents</p>
        </div>
        <button type="button" className="icon-button" onClick={onCreateDocument}>
          <Plus size={14} /> New
        </button>
      </header>

      <div className="search-row">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="document-items">
        {filtered.map((document) => (
          <button
            key={document.id}
            type="button"
            className={`document-item ${selectedDocumentId === document.id ? "active" : ""}`}
            onClick={() => onSelectDocument(document.id)}
          >
            <div className="doc-icon">
              <FileText size={14} />
            </div>
            <div className="doc-content">
              <strong>{document.title || "Untitled"}</strong>
              <small>{document.plaintext.replace(/[#!`*_[\]]/g, "").slice(0, 60)}</small>
            </div>
            <div className="doc-meta">
              <span>
                <Clock size={12} />
              </span>
              <span>
                <Lock size={12} />
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="empty-copy">No documents found.</p>}
      </div>
    </div>
  );
}
