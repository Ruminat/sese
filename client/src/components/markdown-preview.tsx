import { cloneElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CardElement, FieldElement, NoteElement, PasswordElement } from "./secure-elements";

interface TMarkdownPreviewProps {
  content: string;
  onToast: (message: string) => void;
}

type TSecureElementNode = ReactElement<{ onToast?: (message: string) => void }>;

type TMatch = {
  start: number;
  end: number;
  component: "card" | "password" | "note" | "field";
  content: string;
  label?: string;
};

function parseCustomElements(text: string): (string | TSecureElementNode)[] {
  const parts: (string | TSecureElementNode)[] = [];
  const matches: TMatch[] = [];

  const patterns = [
    { regex: /!!card\s+(.+?)!!/g, component: "card" as const },
    { regex: /!!password\s+(.+?)!!/g, component: "password" as const },
    { regex: /!!note\s+(.+?)!!/g, component: "note" as const },
    { regex: /!!field:([^\s]+)\s+(.+?)!!/g, component: "field" as const },
  ];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex.source, "g");
    let match: RegExpExecArray | null = regex.exec(text);
    while (match) {
      if (pattern.component === "field") {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          component: "field",
          label: match[1],
          content: match[2],
        });
      } else {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          component: pattern.component,
          content: match[1],
        });
      }
      match = regex.exec(text);
    }
  }

  matches.sort((a, b) => a.start - b.start);

  let lastEnd = 0;
  let keyIndex = 0;
  for (const match of matches) {
    if (match.start > lastEnd) {
      parts.push(text.slice(lastEnd, match.start));
    }

    if (match.component === "card") {
      parts.push(<CardElement key={`card-${keyIndex++}`} value={match.content} onToast={() => {}} />);
    } else if (match.component === "password") {
      parts.push(
        <PasswordElement key={`password-${keyIndex++}`} value={match.content} onToast={() => {}} />,
      );
    } else if (match.component === "note") {
      parts.push(<NoteElement key={`note-${keyIndex++}`} value={match.content} onToast={() => {}} />);
    } else {
      parts.push(
        <FieldElement
          key={`field-${keyIndex++}`}
          label={match.label || "Field"}
          value={match.content}
          onToast={() => {}}
        />,
      );
    }

    lastEnd = match.end;
  }

  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return parts;
}

export function MarkdownPreview({ content, onToast }: TMarkdownPreviewProps) {
  const hasCustomElements = /!!(?:card|password|note|field:)/.test(content);

  if (!hasCustomElements) {
    return (
      <div className="prose-preview">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  const lines = content.split("\n");
  const processed: ReactNode[] = [];
  let currentMarkdown = "";
  let keyIndex = 0;

  const flushMarkdown = () => {
    if (currentMarkdown.trim()) {
      processed.push(
        <div key={`md-${keyIndex++}`} className="prose-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentMarkdown}</ReactMarkdown>
        </div>,
      );
      currentMarkdown = "";
    }
  };

  for (const line of lines) {
    if (/!!(?:card|password|note|field:)/.test(line)) {
      flushMarkdown();
      const elements = parseCustomElements(line);
      for (const element of elements) {
        if (typeof element === "string" && element.trim()) {
          currentMarkdown += `${element}\n`;
        } else if (typeof element !== "string") {
          const withToast = injectToast(element, onToast);
          processed.push(withToast);
        }
      }
    } else {
      currentMarkdown += `${line}\n`;
    }
  }

  flushMarkdown();
  return <div>{processed}</div>;
}

function injectToast(
  element: ReactElement<{ onToast?: (message: string) => void }>,
  onToast: (message: string) => void,
): ReactElement {
  return cloneElement(element, { onToast });
}
