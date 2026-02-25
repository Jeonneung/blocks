import React from 'react';
import { TableBlock } from '../../types/blocks';

interface TableViewProps {
  block: TableBlock;
}

export default function TableView({ block }: TableViewProps) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {block.headers.map((header, i) => (
              <th
                key={i}
                className="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="even:bg-gray-50/50">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border border-gray-300 px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
