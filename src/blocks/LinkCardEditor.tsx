import React, { useState } from 'react';
import { LinkCardBlock, OGData } from '../types/blocks';
import { useEditorServices, DefaultImage } from '../context/EditorContext';
import { Link2, RefreshCw, ExternalLink } from 'lucide-react';

interface LinkCardEditorProps {
  block: LinkCardBlock;
  onUpdate: (updates: Partial<LinkCardBlock>) => void;
}

export default function LinkCardEditor({ block, onUpdate }: LinkCardEditorProps) {
  const [urlInput, setUrlInput] = useState(block.url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const services = useEditorServices();
  const ImageComponent = services.ImageComponent || DefaultImage;

  const fetchOGData = async (url: string) => {
    try {
      setLoading(true);
      setError(null);

      const ogData = await services.fetchOGData(url);
      onUpdate({ url, ogData });
    } catch (err) {
      console.error('OG fetch error:', err);
      setError('링크 정보를 가져올 수 없습니다.');
      // URL만 저장
      onUpdate({ url, ogData: undefined });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      fetchOGData(urlInput.trim());
    }
  };

  const handleRefresh = () => {
    if (block.url) {
      fetchOGData(block.url);
    }
  };

  // URL이 없거나 OG 데이터가 없는 경우 입력 폼 표시
  if (!block.url || (!block.ogData && !loading)) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Link2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !urlInput.trim()}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              '확인'
            )}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </form>
    );
  }

  // OG 데이터가 있는 경우 카드 미리보기 표시
  return (
    <div className="space-y-2">
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
      >
        <div className="flex">
          {/* 이미지 */}
          {block.ogData?.image && (
            <div className="relative w-40 flex-shrink-0">
              <div className="absolute inset-0">
                <ImageComponent
                  src={block.ogData.image}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* 텍스트 정보 */}
          <div className="flex-1 p-4">
            {block.ogData?.siteName && (
              <p className="text-xs text-gray-500 mb-1">{block.ogData.siteName}</p>
            )}
            <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
              {block.ogData?.title || block.url}
            </h4>
            {block.ogData?.description && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {block.ogData.description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <ExternalLink size={12} />
              <span className="truncate">{new URL(block.url).hostname}</span>
            </div>
          </div>
        </div>
      </a>

      {/* 새로고침 버튼 */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
        <button
          onClick={() => {
            setUrlInput('');
            onUpdate({ url: '', ogData: undefined });
          }}
          className="text-sm text-red-500 hover:text-red-600"
        >
          변경
        </button>
      </div>
    </div>
  );
}
