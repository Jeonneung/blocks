import React, { useCallback } from 'react';
import { TableBlock } from '../types/blocks';
import { Plus, Trash2 } from 'lucide-react';

interface TableEditorProps {
  block: TableBlock;
  onUpdate: (updates: Partial<TableBlock>) => void;
}

export default function TableEditor({ block, onUpdate }: TableEditorProps) {
  const colCount = block.headers.length;

  const updateHeader = useCallback((colIndex: number, value: string) => {
    const newHeaders = [...block.headers];
    newHeaders[colIndex] = value;
    onUpdate({ headers: newHeaders });
  }, [block.headers, onUpdate]);

  const updateCell = useCallback((rowIndex: number, colIndex: number, value: string) => {
    const newRows = block.rows.map(row => [...row]);
    newRows[rowIndex][colIndex] = value;
    onUpdate({ rows: newRows });
  }, [block.rows, onUpdate]);

  const addRow = useCallback(() => {
    onUpdate({ rows: [...block.rows, new Array(colCount).fill('')] });
  }, [block.rows, colCount, onUpdate]);

  const removeRow = useCallback((rowIndex: number) => {
    if (block.rows.length <= 1) return;
    onUpdate({ rows: block.rows.filter((_, i) => i !== rowIndex) });
  }, [block.rows, onUpdate]);

  const addColumn = useCallback(() => {
    onUpdate({
      headers: [...block.headers, ''],
      rows: block.rows.map(row => [...row, '']),
    });
  }, [block.headers, block.rows, onUpdate]);

  const removeColumn = useCallback((colIndex: number) => {
    if (colCount <= 1) return;
    onUpdate({
      headers: block.headers.filter((_, i) => i !== colIndex),
      rows: block.rows.map(row => row.filter((_, i) => i !== colIndex)),
    });
  }, [block.headers, block.rows, colCount, onUpdate]);

  const handleKeyDown = useCallback((
    e: React.KeyboardEvent,
    type: 'header' | 'cell',
    rowIndex: number,
    colIndex: number,
  ) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextCol = colIndex + 1;
      if (nextCol < colCount) {
        // Move to next column
        const selector = type === 'header'
          ? `[data-header-col="${nextCol}"]`
          : `[data-row="${rowIndex}"][data-col="${nextCol}"]`;
        const el = (e.currentTarget as HTMLElement).closest('.table-editor')?.querySelector(selector) as HTMLInputElement;
        el?.focus();
      } else if (type === 'header' && block.rows.length > 0) {
        // Move to first cell of first row
        const el = (e.currentTarget as HTMLElement).closest('.table-editor')?.querySelector('[data-row="0"][data-col="0"]') as HTMLInputElement;
        el?.focus();
      } else if (type === 'cell') {
        const nextRow = rowIndex + 1;
        if (nextRow < block.rows.length) {
          const el = (e.currentTarget as HTMLElement).closest('.table-editor')?.querySelector(`[data-row="${nextRow}"][data-col="0"]`) as HTMLInputElement;
          el?.focus();
        }
      }
    }
  }, [colCount, block.rows.length]);

  return (
    <div className="table-editor overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {block.headers.map((header, colIndex) => (
              <th key={colIndex} className="relative group border border-gray-300 bg-gray-50 p-0">
                <input
                  type="text"
                  value={header}
                  onChange={(e) => updateHeader(colIndex, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'header', -1, colIndex)}
                  data-header-col={colIndex}
                  placeholder={`헤더 ${colIndex + 1}`}
                  className="w-full px-2 py-1.5 bg-transparent font-semibold text-center outline-none focus:ring-1 focus:ring-blue-400 focus:ring-inset min-w-[80px]"
                />
                {colCount > 1 && (
                  <button
                    onClick={() => removeColumn(colIndex)}
                    className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 p-0.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-opacity"
                    title="열 삭제"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </th>
            ))}
            <th className="border-0 w-8 p-0">
              <button
                onClick={addColumn}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                title="열 추가"
              >
                <Plus size={14} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="group/row">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border border-gray-300 p-0">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'cell', rowIndex, colIndex)}
                    data-row={rowIndex}
                    data-col={colIndex}
                    placeholder=""
                    className="w-full px-2 py-1.5 bg-transparent outline-none focus:ring-1 focus:ring-blue-400 focus:ring-inset min-w-[80px]"
                  />
                </td>
              ))}
              <td className="border-0 w-8 p-0">
                {block.rows.length > 1 && (
                  <button
                    onClick={() => removeRow(rowIndex)}
                    className="p-1 text-gray-400 opacity-0 group-hover/row:opacity-100 hover:text-red-500 rounded transition-all"
                    title="행 삭제"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-1">
        <button
          onClick={addRow}
          className="flex items-center gap-1 px-3 py-1 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
          title="행 추가"
        >
          <Plus size={12} />
          <span>행 추가</span>
        </button>
      </div>
    </div>
  );
}
