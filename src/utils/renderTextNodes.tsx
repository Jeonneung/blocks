import React from 'react';
import { TextNode } from '../types/blocks';

export function renderTextNodes(nodes: TextNode[]): React.ReactNode {
  return nodes.map((node, index) => {
    let content: React.ReactNode = node.text;

    if (node.bold) {
      content = <strong key={`bold-${index}`}>{content}</strong>;
    }
    if (node.italic) {
      content = <em key={`italic-${index}`}>{content}</em>;
    }
    if (node.underline) {
      content = <u key={`underline-${index}`}>{content}</u>;
    }
    if (node.strikethrough) {
      content = <s key={`strike-${index}`}>{content}</s>;
    }
    if (node.link) {
      content = (
        <a
          key={`link-${index}`}
          href={node.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {content}
        </a>
      );
    }

    return <React.Fragment key={index}>{content}</React.Fragment>;
  });
}
