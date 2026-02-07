import React, { useState } from 'react';
import { LinkEmbedBlock } from '../types/blocks';
import { Link2, Youtube, Twitter } from 'lucide-react';

interface LinkEmbedEditorProps {
  block: LinkEmbedBlock;
  onUpdate: (updates: Partial<LinkEmbedBlock>) => void;
}

// YouTube URL에서 비디오 ID 추출
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// URL에서 임베드 타입 감지
function detectEmbedType(url: string): LinkEmbedBlock['embedType'] {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'twitter';
  }
  return 'generic';
}

export default function LinkEmbedEditor({ block, onUpdate }: LinkEmbedEditorProps) {
  const [urlInput, setUrlInput] = useState(block.url || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();

    if (!url) return;

    const embedType = detectEmbedType(url);
    setError(null);

    if (embedType === 'youtube') {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        onUpdate({ url, embedType, videoId });
      } else {
        setError('올바른 YouTube URL이 아닙니다.');
      }
    } else if (embedType === 'twitter') {
      onUpdate({ url, embedType });
    } else {
      onUpdate({ url, embedType: 'generic' });
    }
  };

  // 임베드 미리보기 렌더링
  const renderEmbed = () => {
    switch (block.embedType) {
      case 'youtube':
        if (block.videoId) {
          return (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${block.videoId}`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          );
        }
        break;

      case 'twitter':
        return (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-500">
              <Twitter size={20} />
              <span className="text-sm">Twitter 임베드</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 truncate">{block.url}</p>
          </div>
        );

      case 'generic':
        return (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-500">
              <Link2 size={20} />
              <span className="text-sm">외부 링크</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 truncate">{block.url}</p>
          </div>
        );
    }

    return null;
  };

  // URL이 설정되지 않은 경우 입력 폼 표시
  if (!block.url) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Youtube size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="YouTube, Twitter URL을 입력하세요"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            확인
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Youtube size={14} /> YouTube
          </span>
          <span className="flex items-center gap-1">
            <Twitter size={14} /> Twitter/X
          </span>
        </div>
      </form>
    );
  }

  // 임베드 미리보기
  return (
    <div className="space-y-2">
      {renderEmbed()}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setUrlInput('');
            onUpdate({ url: '', videoId: undefined });
          }}
          className="text-sm text-red-500 hover:text-red-600"
        >
          변경
        </button>
      </div>
    </div>
  );
}
