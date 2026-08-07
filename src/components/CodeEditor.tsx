import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { json } from '@codemirror/lang-json';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { markdown } from '@codemirror/lang-markdown';
import { xml } from '@codemirror/lang-xml';

export type LangId =
  | 'auto' | 'html' | 'css' | 'javascript' | 'typescript' | 'python' | 'cpp'
  | 'json' | 'java' | 'php' | 'rust' | 'sql' | 'markdown' | 'xml';

export const LANG_OPTIONS: { id: LangId; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JS' },
  { id: 'typescript', label: 'TS' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C/C++' },
  { id: 'java', label: 'Java' },
  { id: 'php', label: 'PHP' },
  { id: 'rust', label: 'Rust' },
  { id: 'sql', label: 'SQL' },
  { id: 'json', label: 'JSON' },
  { id: 'xml', label: 'XML' },
  { id: 'markdown', label: 'MD' },
];

/** Heuristic language detection for the "Auto" mode. */
export const detectLang = (code: string): Exclude<LangId, 'auto'> => {
  const s = code.trim();
  if (!s) return 'html';
  if (/^\s*<!DOCTYPE|<html[\s>]|<\/(div|body|head|span|p)>/i.test(s)) return 'html';
  if (/^#include|std::|cout\s*<<|int\s+main\s*\(/m.test(s)) return 'cpp';
  if (/^\s*(import |from |def |class |print\()/m.test(s) && !/[;{]\s*$/m.test(s)) return 'python';
  if (/^\s*<\?php/.test(s)) return 'php';
  if (/^\s*(pub |fn |use )\w|let mut /m.test(s)) return 'rust';
  if (/^\s*(public|private)\s+(static\s+)?(class|void)\s/m.test(s)) return 'java';
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER TABLE)\b/im.test(s)) return 'sql';
  if (/^\s*[[{][\s\S]*[\]}]\s*$/.test(s) && /"\s*:/.test(s)) return 'json';
  if (/^\s*<\?xml|<[a-zA-Z-]+(\s[^>]*)?>[\s\S]*<\/[a-zA-Z-]+>/.test(s) && !/<div|<span|<body/i.test(s)) return 'xml';
  if (/:\s*(string|number|boolean)\b|interface\s+\w+\s*\{|<\w+>\s*\(/.test(s)) return 'typescript';
  if (/function\s|=>|const |let |var |console\.|document\./.test(s)) return 'javascript';
  if (/^[.#@a-zA-Z*][^\n{]*\{[^}]*:[^}]*}/m.test(s)) return 'css';
  if (/^#{1,6}\s|^\s*[-*]\s/m.test(s)) return 'markdown';
  return 'html';
};

const extFor = (id: Exclude<LangId, 'auto'>) => {
  switch (id) {
    case 'html': return [html({ autoCloseTags: true, matchClosingTags: true })];
    case 'css': return [css()];
    case 'javascript': return [javascript({ jsx: true })];
    case 'typescript': return [javascript({ jsx: true, typescript: true })];
    case 'python': return [python()];
    case 'cpp': return [cpp()];
    case 'json': return [json()];
    case 'java': return [java()];
    case 'php': return [php()];
    case 'rust': return [rust()];
    case 'sql': return [sql()];
    case 'markdown': return [markdown()];
    case 'xml': return [xml()];
    default: return [];
  }
};

interface Props {
  value: string;
  onChange: (v: string) => void;
  lang?: LangId;
  height?: string;
  placeholder?: string;
  readOnly?: boolean;
}

const CodeEditor = ({ value, onChange, lang = 'auto', height = '280px', placeholder, readOnly }: Props) => {
  const resolved = lang === 'auto' ? detectLang(value) : lang;
  const extensions = useMemo(() => extFor(resolved), [resolved]);

  return (
    <div dir="ltr" className="rounded-xl overflow-hidden border border-border/40 text-left">
      <CodeMirror
        value={value}
        height={height}
        theme={vscodeDark}
        extensions={extensions}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          foldGutter: true,
          highlightSelectionMatches: true,
          indentOnInput: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
