import { useState } from 'react'
import { BlockEditor, EditorProvider, Block } from '@buildingbite/blocks'

function App() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [charCount, setCharCount] = useState(0)

  return (
    <EditorProvider services={{
      uploadImage: async () => '',
      fetchOGData: async () => ({}),
    }}>
      <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          Markdown Shortcuts Demo
        </h1>
        <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
          빈 줄에서 아래 마크다운을 입력해 보세요:&nbsp;
          <code># </code> <code>## </code> <code>### </code>
          <code>- </code> <code>* </code> <code>1. </code>
          <code>&gt; </code> <code>---</code>
        </p>

        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '16px 16px',
          minHeight: 300,
        }}>
          <BlockEditor
            onChange={setBlocks}
            onCharCountChange={setCharCount}
            // markdownShortcuts={{ bulletDash: false }}  // 이렇게 개별 비활성화 가능
          />
        </div>

        <div style={{ marginTop: 16, fontSize: 13, color: '#999' }}>
          글자 수: {charCount} &middot; 블록 수: {blocks.length}
        </div>

        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: '#999' }}>
            블록 데이터 (JSON)
          </summary>
          <pre style={{
            fontSize: 11,
            background: '#f9fafb',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto',
            maxHeight: 400,
            marginTop: 8,
          }}>
            {JSON.stringify(blocks, null, 2)}
          </pre>
        </details>
      </div>
    </EditorProvider>
  )
}

export default App
