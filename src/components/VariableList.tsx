import { Variable, TableValue } from '../types';
import { ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store';

interface VariableListProps {
  variables: Record<string, Variable>;
}

function TablePreview({ variable }: { variable: Variable }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const updateVariableValue = useAppStore(state => state.updateVariableValue);
  
  const table = variable.value as TableValue;
  const previewRows = table.data.slice(0, 5); // Just preview 5 rows for performance in sidebar
  const hasMore = table.data.length > 5;

  const handleCellChange = (rowIndex: number, col: string, newValue: string) => {
     // Try to determine type
     let val: any = newValue;
     const currentVal = table.data[rowIndex][col];
     
     if (typeof currentVal === 'number' && !isNaN(Number(newValue)) && newValue.trim() !== '') {
         val = Number(newValue);
     }
     
     updateVariableValue(variable.name, val, rowIndex, col);
  };

  return (
    <div className="mt-2 text-xs">
        <button 
           onClick={() => setIsExpanded(!isExpanded)}
           className="flex items-center text-gray-500 hover:text-gray-700 mb-1"
        >
           {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
           <span className="ml-1">Preview Data (Editable)</span>
        </button>
        
        {isExpanded && (
            <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider w-10 border-r border-gray-200">
                                #
                            </th>
                            {table.columns.map(col => (
                                <th key={col} className="px-2 py-1 text-left text-xs font-medium text-gray-500 font-bold tracking-wider border-r border-gray-200 whitespace-nowrap">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {previewRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-2 py-1 whitespace-nowrap text-gray-400 font-mono text-[10px] border-r border-gray-200 select-none">
                                    {idx + 1}
                                </td>
                                {table.columns.map(col => (
                                    <td key={col} className="p-0 border-r border-gray-200 min-w-[60px]">
                                        <input 
                                            className="w-full px-2 py-1 text-gray-800 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                                            value={row[col]?.toString() ?? ''}
                                            onChange={(e) => handleCellChange(idx, col, e.target.value)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {hasMore && (
                    <div className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] text-center italic">
                        ... {table.data.length - 5} more rows ...
                    </div>
                )}
            </div>
        )}
    </div>
  );
}

export default function VariableList({ variables }: VariableListProps) {
  const vars = Object.values(variables);
  const removeVariable = useAppStore(state => state.removeVariable);
  const updateVariableValue = useAppStore(state => state.updateVariableValue);

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-l border-gray-200">
       <div className="p-2 bg-gray-50 border-b border-gray-200 font-semibold text-sm flex justify-between items-center">
         <span>Context Variables</span>
         <span className="text-xs text-gray-400 font-normal">{vars.length} items</span>
       </div>
       <div className="flex-1 overflow-auto p-4 space-y-4">
         {vars.length === 0 ? (
           <p className="text-sm text-gray-400 italic">No variables yet. Run the recipe to generate data.</p>
         ) : (
           vars.map(v => (
             <div key={v.id} className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white group relative">
               <button 
                  onClick={() => removeVariable(v.name)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove variable"
               >
                  <Trash2 size={14} />
               </button>

               <div className="flex items-center justify-between mb-1 pr-6">
                 <span className="font-bold text-sm text-blue-700">{v.name}</span>
                 <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {v.value.type}
                 </span>
               </div>
               
               <div className="text-xs text-gray-600 overflow-hidden">
                 {v.value.type === 'table' && (
                   <div className="overflow-x-auto">
                      <p className="mb-1 text-gray-400">{v.value.data.length} rows, {v.value.columns.length} columns</p>
                      <TablePreview variable={v} />
                   </div>
                 )}
                 {v.value.type === 'number' && (
                    <input 
                      className="font-mono text-lg w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                      value={v.value.value}
                      onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                             updateVariableValue(v.name, val);
                          }
                      }}
                    />
                 )}
                 {v.value.type === 'string' && (
                    <input 
                      className="font-mono w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                      value={v.value.value}
                      onChange={(e) => updateVariableValue(v.name, e.target.value)}
                    />
                 )}
               </div>
             </div>
           ))
         )}
       </div>
    </div>
  );
}
