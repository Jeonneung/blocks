import type { Block, MarkdownShortcutConfig } from '../types/blocks';

interface SpaceTriggeredShortcut {
  prefix: string;
  configKey: keyof MarkdownShortcutConfig;
  createBlock: () => Partial<Block>;
}

// Space 키로 트리거되는 단축키 (prefix가 긴 것부터 매칭하도록 정렬)
const SPACE_TRIGGERED_SHORTCUTS: SpaceTriggeredShortcut[] = [
  {
    prefix: '###',
    configKey: 'heading3',
    createBlock: () => ({ type: 'heading', level: 3, content: [{ text: '' }] }),
  },
  {
    prefix: '##',
    configKey: 'heading2',
    createBlock: () => ({ type: 'heading', level: 2, content: [{ text: '' }] }),
  },
  {
    prefix: '#',
    configKey: 'heading1',
    createBlock: () => ({ type: 'heading', level: 1, content: [{ text: '' }] }),
  },
  {
    prefix: '-',
    configKey: 'bulletDash',
    createBlock: () => ({ type: 'list', listType: 'unordered', content: [{ text: '' }] }),
  },
  {
    prefix: '*',
    configKey: 'bulletAsterisk',
    createBlock: () => ({ type: 'list', listType: 'unordered', content: [{ text: '' }] }),
  },
  {
    prefix: '1.',
    configKey: 'orderedList',
    createBlock: () => ({ type: 'list', listType: 'ordered', content: [{ text: '' }] }),
  },
  {
    prefix: '>',
    configKey: 'quote',
    createBlock: () => ({ type: 'quote', content: [{ text: '' }] }),
  },
];

/**
 * Space 키 입력 시 커서 앞 텍스트를 매칭.
 * 텍스트 전체가 prefix와 일치해야 매칭됨 (예: "# hello"는 매칭 안 됨).
 * config에서 비활성화된 단축키는 제외.
 */
export function matchSpaceShortcut(
  textBeforeCursor: string,
  config?: MarkdownShortcutConfig,
): { createBlock: () => Partial<Block> } | null {
  for (const shortcut of SPACE_TRIGGERED_SHORTCUTS) {
    if (textBeforeCursor === shortcut.prefix) {
      // config가 없으면 기본 활성, config에서 명시적으로 false인 경우만 비활성
      if (config && config[shortcut.configKey] === false) {
        continue;
      }
      return { createBlock: shortcut.createBlock };
    }
  }
  return null;
}

/**
 * 전체 텍스트가 '---'인지 확인 (divider 변환용).
 */
export function isDividerShortcut(fullText: string): boolean {
  return fullText === '---';
}

/**
 * 전체 텍스트가 '```'인지 확인 (코드 블록 변환용).
 * 한국어 Mac 키보드에서는 backtick 대신 ₩가 입력되므로 '₩₩₩'도 매칭.
 */
export function isCodeBlockShortcut(fullText: string): boolean {
  return fullText === '```' || fullText === '₩₩₩';
}
