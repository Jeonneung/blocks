// Prism 구문 강조 테마 (VS Code 스타일) — 에디터/뷰어 공유
export const PRISM_THEME = `
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

export const PRISM_FONT_FAMILY = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export const PRISM_LANGUAGES = [
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
