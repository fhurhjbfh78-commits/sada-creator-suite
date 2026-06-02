import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  content: string;
  isMe: boolean;
}

// Detects URLs and ```code``` blocks (or 4+ line text blocks that look like scripts)
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;
const CODE_FENCE = /```([\s\S]*?)```/g;

const CodeBox = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('تم النسخ');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('فشل النسخ');
    }
  };
  return (
    <div className="my-1 rounded-xl overflow-hidden border border-border/40 bg-secondary/40" dir="ltr">
      <div className="flex items-center justify-between px-2 py-1 bg-background/40 border-b border-border/40">
        <span className="text-[10px] text-muted-foreground font-mono">code</span>
        <button onClick={copy} className="flex items-center gap-1 text-[10px] text-primary active:scale-95">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'تم' : 'نسخ'}</span>
        </button>
      </div>
      <pre className="p-2 text-[11px] text-foreground overflow-auto whitespace-pre-wrap break-words max-h-[50vh]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const LinkBox = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('تم نسخ الرابط');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('فشل النسخ');
    }
  };
  let host = url;
  try { host = new URL(url).hostname; } catch {}
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-1 flex items-center gap-2 rounded-xl border border-border/40 bg-background/60 px-2 py-1.5 hover:bg-background/80 transition-colors"
      dir="ltr"
    >
      <ExternalLink className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-primary truncate">{host}</div>
        <div className="text-[9px] text-muted-foreground truncate">{url}</div>
      </div>
      <button onClick={copy} className="p-1 rounded-md hover:bg-primary/10 active:scale-90 flex-shrink-0">
        {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
      </button>
    </a>
  );
};

// Only detect as code if it has programming keywords AND syntax characters — not just multiline Arabic text
const looksLikeScript = (text: string) => {
  if (text.length < 40) return false;
  const hasCodeSyntax = /[{};=()<>]/.test(text);
  const hasKeywords = /\b(function|const|let|var|class|import|export|def|return|if|else|for|while|try|catch|console|print|<!DOCTYPE|<html|<div|<script)\b/i.test(text);
  // Must have BOTH code syntax AND programming keywords
  if (!hasCodeSyntax || !hasKeywords) return false;
  // Extra check: ratio of code-like chars should be significant (avoid Arabic explanations with a stray semicolon)
  const codeChars = (text.match(/[{};=()<>\[\]\/\\$#@!&|^~`]/g) || []).length;
  return codeChars >= 5;
};

const MessageContent = ({ content, isMe }: Props) => {
  // Step 1: split out fenced code blocks
  const parts: Array<{ type: 'code' | 'text'; value: string }> = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  CODE_FENCE.lastIndex = 0;
  while ((match = CODE_FENCE.exec(content)) !== null) {
    if (match.index > lastIdx) parts.push({ type: 'text', value: content.slice(lastIdx, match.index) });
    parts.push({ type: 'code', value: match[1].trim() });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < content.length) parts.push({ type: 'text', value: content.slice(lastIdx) });

  return (
    <div className={`px-3 py-2 rounded-2xl text-sm break-words ${isMe ? 'bg-primary text-primary-foreground rounded-tr-md' : 'glass-card text-foreground rounded-tl-md'}`}>
      {parts.map((p, i) => {
        if (p.type === 'code') return <CodeBox key={i} code={p.value} />;
        // Text part: detect URLs OR script-like
        if (looksLikeScript(p.value) && !URL_REGEX.test(p.value)) {
          return <CodeBox key={i} code={p.value.trim()} />;
        }
        // Split by URL
        const segs = p.value.split(URL_REGEX);
        return (
          <span key={i}>
            {segs.map((seg, j) => {
              if (j % 2 === 1) return <LinkBox key={j} url={seg} />;
              return seg ? <span key={j} className="whitespace-pre-wrap">{seg}</span> : null;
            })}
          </span>
        );
      })}
    </div>
  );
};

export default MessageContent;
