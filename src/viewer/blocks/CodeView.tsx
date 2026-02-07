import React, { useEffect, useRef } from 'react';
import { CodeBlock } from '../../types/blocks';
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
import { PRISM_THEME, PRISM_FONT_FAMILY, PRISM_LANGUAGES } from '../../utils/prismTheme';

interface CodeViewProps {
  block: CodeBlock;
}

export default function CodeView({ block }: CodeViewProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const language = block.language || 'javascript';
  const code = block.code;

  const languageLabel = PRISM_LANGUAGES.find(l => l.value === language)?.label || language;

  useEffect(() => {
    if (!preRef.current) return;

    const grammar = Prism.languages[language];
    if (grammar && code) {
      preRef.current.innerHTML = Prism.highlight(code, grammar, language);
    } else {
      preRef.current.textContent = code || '';
    }
  }, [code, language]);

  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
      <style>{PRISM_THEME}</style>

      {/* 언어 라벨 헤더 */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #333', background: '#1e1e1e' }}>
        <span style={{ fontSize: '12px', color: '#cccccc' }}>
          {languageLabel}
        </span>
      </div>

      {/* 코드 표시 영역 */}
      <div
        className="bb-code-highlight"
        style={{
          background: '#1e1e1e',
          padding: '12px 16px',
        }}
      >
        <pre
          ref={preRef}
          style={{
            fontFamily: PRISM_FONT_FAMILY,
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
          }}
        />
      </div>
    </div>
  );
}
