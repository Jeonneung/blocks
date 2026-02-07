import React from 'react';
import { DialogueBlock } from '../../types/blocks';
import { renderTextNodes } from '../../utils/renderTextNodes';

interface DialogueViewProps {
  block: DialogueBlock;
}

export default function DialogueView({ block }: DialogueViewProps) {
  if (!block.lines || block.lines.length === 0) {
    return null;
  }

  const style = block.style || 'chat';

  // 채팅 스타일 (카카오톡 스타일)
  if (style === 'chat') {
    return (
      <div className="dialogue-block space-y-3 py-2">
        {block.lines.map((line, index) => {
          const isRight = line.alignment === 'right';

          return (
            <div
              key={index}
              className={`flex gap-2 ${isRight ? 'flex-row-reverse' : ''}`}
              style={{ alignItems: 'flex-start' }}
            >
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0" style={{ width: 40, height: 40 }}>
                {line.profileImage ? (
                  <img
                    src={line.profileImage}
                    alt={line.speaker || '프로필'}
                    className="rounded-full object-cover block !m-0"
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                    {line.speaker ? line.speaker.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>

              <div className={`flex-1 min-w-0 ${isRight ? 'flex flex-col items-end' : ''}`}>
                {/* 화자 이름 */}
                <div
                  className={`text-xs font-medium text-gray-600 ${isRight ? 'text-right' : ''}`}
                  style={{ marginBottom: 4, lineHeight: 1 }}
                >
                  {line.speaker || '???'}
                </div>

                {/* 말풍선 */}
                <div
                  className="inline-block px-3 py-2 rounded-lg max-w-[85%]"
                  style={{
                    backgroundColor: line.speakerColor || '#FEE500',
                    color: isLightColor(line.speakerColor || '#FEE500') ? '#000' : '#fff',
                  }}
                >
                  <span className="text-sm whitespace-pre-wrap break-words">
                    {renderTextNodes(line.content)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 희극 스타일 (심플: 볼드 이름 + gap + 대사)
  return (
    <div className="dialogue-block space-y-3 py-2">
      {block.lines.map((line, index) => (
        <div key={index} className="flex items-baseline gap-3">
          <span className="font-bold flex-shrink-0 min-w-[4rem]">
            {line.speaker || '???'}
          </span>
          <span className="text-gray-800">
            {renderTextNodes(line.content)}
          </span>
        </div>
      ))}
    </div>
  );
}

function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
