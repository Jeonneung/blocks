import React, { useRef, useEffect, useCallback } from 'react';
import { CodeBlock, Block } from '../types/blocks';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

// Prism 구문 강조 테마 (VS Code 스타일)
const PRISM_THEME = `
.bb-code-highlight .token.comment,
.bb-code-highlight .token.prolog,
.bb-code-highlight .token.doctype,
.bb-code-highlight .token.cdata { color: #6a9955; font-style: italic; }
.bb-code-highlight .token.punctuation { color: #d4d4d4; }
.bb-code-highlight .token.namespace { opacity: .7; }
.bb-code-highlight .token.property,
.bb-code-highlight .token.tag,
.bb-code-highlight .token.boolean,
.bb-code-highlight .token.number,
.bb-code-highlight .token.constant,
.bb-code-highlight .token.symbol { color: #b5cea8; }
.bb-code-highlight .token.selector,
.bb-code-highlight .token.attr-name,
.bb-code-highlight .token.string,
.bb-code-highlight .token.char,
.bb-code-highlight .token.builtin { color: #ce9178; }
.bb-code-highlight .token.operator,
.bb-code-highlight .token.entity,
.bb-code-highlight .token.url { color: #d4d4d4; }
.bb-code-highlight .token.atrule,
.bb-code-highlight .token.attr-value,
.bb-code-highlight .token.keyword { color: #569cd6; }
.bb-code-highlight .token.function,
.bb-code-highlight .token.class-name { color: #dcdcaa; }
.bb-code-highlight .token.regex,
.bb-code-highlight .token.important,
.bb-code-highlight .token.variable { color: #d16969; }
.bb-code-highlight .token.important,
.bb-code-highlight .token.bold { font-weight: bold; }
.bb-code-highlight .token.italic { font-style: italic; }
.bb-code-highlight textarea::selection { background: #3a3d41; color: #d4d4d4; }
`;

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
];

const FONT_FAMILY = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

interface CodeBlockEditorProps {
  block: CodeBlock;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertParagraphAfter?: () => void;
}

export default function CodeBlockEditor({ block, onUpdate, onInsertParagraphAfter }: CodeBlockEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const language = block.language || 'javascript';
  const code = block.code;

  // textarea 높이 자동 조절
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  // 코드 하이라이트 업데이트
  useEffect(() => {
    if (!preRef.current) return;

    // Prism grammar가 있으면 하이라이트, 없으면 plain text
    const grammar = Prism.languages[language];
    if (grammar && code) {
      preRef.current.innerHTML = Prism.highlight(code, grammar, language);
    } else {
      preRef.current.textContent = code || '\n';
    }
  }, [code, language]);

  // 높이 동기화
  useEffect(() => {
    adjustHeight();
  }, [code, adjustHeight]);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ code: e.target.value });
  }, [onUpdate]);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ language: e.target.value });
  }, [onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Shift+Enter → 코드 블록 밖으로 나가기 (새 본문 블록 생성)
    if (e.key === 'Enter' && e.shiftKey && onInsertParagraphAfter) {
      e.preventDefault();
      onInsertParagraphAfter();
      return;
    }

    // Tab → 2 스페이스 삽입
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const { selectionStart, selectionEnd } = textarea;
      const before = textarea.value.substring(0, selectionStart);
      const after = textarea.value.substring(selectionEnd);
      const newValue = before + '  ' + after;
      onUpdate({ code: newValue });
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
      });
      return;
    }

    // Shift+Tab → 들여쓰기 제거
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const { selectionStart } = textarea;
      const before = textarea.value.substring(0, selectionStart);
      const lineStart = before.lastIndexOf('\n') + 1;
      const line = textarea.value.substring(lineStart);

      if (line.startsWith('  ')) {
        const newValue = textarea.value.substring(0, lineStart) + line.substring(2);
        onUpdate({ code: newValue });
        requestAnimationFrame(() => {
          const newPos = Math.max(lineStart, selectionStart - 2);
          textarea.selectionStart = textarea.selectionEnd = newPos;
        });
      }
      return;
    }
  }, [onUpdate]);

  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
      <style>{PRISM_THEME}</style>

      {/* 언어 선택 헤더 */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #333', background: '#1e1e1e' }}>
        <select
          value={language}
          onChange={handleLanguageChange}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '12px',
            color: '#cccccc',
            cursor: 'pointer',
            outline: 'none',
            padding: '2px 4px',
          }}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* 코드 에디터 영역: textarea + pre 오버레이 */}
      <div
        className="bb-code-highlight"
        style={{
          position: 'relative',
          background: '#1e1e1e',
          padding: '12px 16px',
        }}
      >
        {/* Prism 하이라이트 오버레이 — <pre> 자체에 텍스트 렌더링, <code> 불필요 */}
        <pre
          ref={preRef}
          aria-hidden="true"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: '14px',
            lineHeight: '1.5',
            margin: 0,
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: '#d4d4d4',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            tabSize: 2,
            position: 'absolute',
            top: '12px',
            left: '16px',
            right: '16px',
            bottom: '12px',
            pointerEvents: 'none',
            overflow: 'hidden',
            letterSpacing: 'normal',
            wordSpacing: 'normal',
          }}
        />

        {/* 실제 입력 textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          placeholder="코드를 입력하세요..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: '14px',
            lineHeight: '1.5',
            margin: 0,
            padding: 0,
            border: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            tabSize: 2,
            width: '100%',
            resize: 'none',
            overflow: 'hidden',
            background: 'transparent',
            color: 'transparent',
            caretColor: '#aeafad',
            outline: 'none',
            position: 'relative',
            zIndex: 1,
            minHeight: '3em',
            letterSpacing: 'normal',
            wordSpacing: 'normal',
            boxSizing: 'border-box',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
