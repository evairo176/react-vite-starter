import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const exec = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

const formatBlock = (tag: string) => {
  // Some browsers require angle brackets
  document.execCommand("formatBlock", false, `<${tag}>`);
};

const wrapSelectionWithTag = (tag: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const selected = range.toString();
  if (!selected) return;
  const html =
    tag === "pre"
      ? `<pre><code>${escapeHtml(selected)}</code></pre>`
      : `<${tag}>${escapeHtml(selected)}</${tag}>`;
  document.execCommand("insertHTML", false, html);
};

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const next = value ?? "";

    const isFocused = document.activeElement === el;

    if (el.innerHTML !== next && !isFocused) {
      el.innerHTML = next;
    }
  }, [value]);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatBlock("h1")}
          disabled={disabled}
          title="Heading 1"
        >
          H1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatBlock("h2")}
          disabled={disabled}
          title="Heading 2"
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatBlock("h3")}
          disabled={disabled}
          title="Heading 3"
        >
          H3
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatBlock("p")}
          disabled={disabled}
          title="Paragraph"
        >
          P
        </Button>

        <span className="w-px h-7 bg-border mx-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => exec("bold")}
          disabled={disabled}
        >
          Bold
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => exec("italic")}
          disabled={disabled}
        >
          Italic
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => exec("underline")}
          disabled={disabled}
        >
          Underline
        </Button>

        <span className="w-px h-7 bg-border mx-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => wrapSelectionWithTag("code")}
          disabled={disabled}
          title="Inline code"
        >
          {"</>"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => wrapSelectionWithTag("pre")}
          disabled={disabled}
          title="Code block"
        >
          Code Block
        </Button>

        <span className="w-px h-7 bg-border mx-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => exec("insertUnorderedList")}
          disabled={disabled}
        >
          Bullets
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => exec("insertOrderedList")}
          disabled={disabled}
        >
          Numbered
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const url = window.prompt("URL");
            if (!url) return;
            exec("createLink", url);
          }}
          disabled={disabled}
        >
          Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => exec("removeFormat")}
          disabled={disabled}
        >
          Clear
        </Button>
      </div>

      <div
        ref={ref}
        className="rte-content min-h-40 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => {
          const html = (e.currentTarget as HTMLDivElement).innerHTML;
          onChange(html);
        }}
        onBlur={(e) => {
          const html = (e.currentTarget as HTMLDivElement).innerHTML;
          onChange(html);
        }}
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
        }
        .rte-content h1 { font-size: 1.875rem; font-weight: 700; line-height: 1.2; margin: 0.75rem 0 0.5rem; }
        .rte-content h2 { font-size: 1.5rem;   font-weight: 700; line-height: 1.25; margin: 0.75rem 0 0.5rem; }
        .rte-content h3 { font-size: 1.25rem;  font-weight: 600; line-height: 1.3;  margin: 0.75rem 0 0.5rem; }
        .rte-content p  { margin: 0.25rem 0; }
        .rte-content ul { list-style: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
        .rte-content ol { list-style: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
        .rte-content a  { color: hsl(var(--primary)); text-decoration: underline; }
        .rte-content code {
          background: rgba(127,127,127,0.15);
          padding: 0.125rem 0.35rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.85em;
        }
        .rte-content pre {
          background: rgba(0,0,0,0.85);
          color: #f8f8f2;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
          max-width: 100%;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .rte-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          font-size: 0.85em;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
          display: block;
        }
      `}</style>
    </div>
  );
}
