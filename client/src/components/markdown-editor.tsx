import { Bold, Code, CreditCard, Italic, KeyRound, Link, Shield, StickyNote } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { MarkdownPreview } from "./markdown-preview";

interface TMarkdownEditorProps {
  title: string;
  markdownValue: string;
  disabled: boolean;
  statusText: string;
  onTitleChange: (value: string) => void;
  onMarkdownChange: (value: string) => void;
  onToast: (message: string) => void;
}

export function MarkdownEditor({
  title,
  markdownValue,
  disabled,
  statusText,
  onTitleChange,
  onMarkdownChange,
  onToast,
}: TMarkdownEditorProps) {
  const appendSyntax = (value: string) => {
    onMarkdownChange(`${markdownValue}${markdownValue.endsWith("\n") ? "" : "\n"}${value}\n`);
  };

  return (
    <div className="panel editor-layout">
      <header className="panel-header editor-header">
        <input
          value={title}
          disabled={disabled}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Document title"
        />
        <span className="status-pill">{statusText}</span>
      </header>

      <div className="toolbar-row">
        <button type="button" onClick={() => appendSyntax("**bold**")} title="Bold">
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => appendSyntax("*italic*")} title="Italic">
          <Italic size={14} />
        </button>
        <button type="button" onClick={() => appendSyntax("[text](https://example.com)")} title="Link">
          <Link size={14} />
        </button>
        <button type="button" onClick={() => appendSyntax("```ts\ncode\n```")} title="Code">
          <Code size={14} />
        </button>
        <span className="toolbar-divider" />
        <button type="button" onClick={() => appendSyntax("!!card 4111-1111-1111-1111!!")}>
          <CreditCard size={14} />
        </button>
        <button type="button" onClick={() => appendSyntax("!!password SuperSecretHere!!")}>
          <KeyRound size={14} />
        </button>
        <button type="button" onClick={() => appendSyntax("!!note Sensitive info!!")}>
          <StickyNote size={14} />
        </button>
        <button type="button" onClick={() => appendSyntax("!!field:Label Value!!")}>
          <Shield size={14} />
        </button>
      </div>

      <div className="editor-preview-split">
        <div className="editor-pane">
          <CodeMirror
            value={markdownValue}
            height="100%"
            extensions={[markdown()]}
            theme={oneDark}
            onChange={(value) => onMarkdownChange(value)}
            editable={!disabled}
            className="code-editor"
          />
        </div>
        <div className="preview-pane">
          <h3>Preview</h3>
          <MarkdownPreview content={markdownValue} onToast={onToast} />
        </div>
      </div>
    </div>
  );
}
