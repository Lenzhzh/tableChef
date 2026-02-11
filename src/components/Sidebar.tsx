import { getOperationsByCategory } from '../operations';
import { useAppStore } from '../store';
import { Plus } from 'lucide-react';

export default function Sidebar() {
  const categories = getOperationsByCategory();
  const addStep = useAppStore(state => state.addStep);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 font-bold bg-gray-50 flex items-center justify-between">
        <span>Operations</span>
        {/* Search could go here */}
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-4">
        {Object.entries(categories).map(([category, ops]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              {category}
            </h3>
            <div className="space-y-1">
              {ops.map(op => (
                <button
                  key={op.id}
                  onClick={() => addStep(op.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors group flex items-center justify-between border border-transparent hover:border-blue-100"
                  title={op.description}
                >
                  <span>{op.name}</span>
                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
