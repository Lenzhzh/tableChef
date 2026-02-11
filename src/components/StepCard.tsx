import { RecipeStep } from '../types';
import { useAppStore } from '../store';
import { Trash2, GripVertical, ChevronDown, ChevronRight, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import { OPERATION_REGISTRY } from '../operations';
import { useState } from 'react';

interface StepCardProps {
  step: RecipeStep;
  dragListeners?: any; // Passed from dnd-kit
}

export default function StepCard({ step, dragListeners }: StepCardProps) {
  const op = OPERATION_REGISTRY[step.operationId] || null;
  const updateStepArgs = useAppStore(state => state.updateStepArgs);
  const removeStep = useAppStore(state => state.removeStep);
  const setStepOutputName = useAppStore(state => state.setStepOutputName);
  const logs = useAppStore(state => state.logs);
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Find logs for this step
  const stepLog = logs.find(l => l.stepId === step.id);
  const isError = stepLog?.status === 'error';

  // Get available variables for dropdowns (simplified: all variable names)
  const availableVars = useAppStore(state => Object.keys(state.variables));

  if (!op) return <div className="p-4 bg-red-50 text-red-500">Unknown Operation {step.operationId}</div>;

  const handleFileUpload = (argName: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          updateStepArgs(step.id, { [argName]: content });
      };
      reader.readAsText(file);
  };

  return (
    <div className={clsx(
        "group bg-white rounded-lg border shadow-sm transition-all relative",
        isError ? "border-red-300 ring-1 ring-red-100" : "border-gray-200 hover:border-blue-300"
    )}>
      {/* Header */}
      <div className="flex items-center p-2 border-b border-gray-100 bg-gray-50/50 rounded-t-lg select-none">
         <div {...dragListeners} className="cursor-grab hover:text-blue-500 touch-none outline-none flex items-center p-1">
            <GripVertical className="text-gray-400" size={16} />
         </div>
         <div 
            className="flex-1 flex items-center ml-2 cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
         >
            <button className="text-gray-400 mr-2 hover:text-gray-600">
               {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
            <div className="flex flex-col">
                 <h3 className="font-semibold text-sm text-gray-800">{op.name}</h3>
                 {!isCollapsed && <p className="text-xs text-gray-400">{op.description}</p>}
            </div>
         </div>
         
         <div className="flex items-center space-x-1">
             {/* Show quick output name if collapsed */}
             {isCollapsed && step.outputVarName && (
                 <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded">
                     → {step.outputVarName}
                 </span>
             )}
             <button onClick={() => removeStep(step.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
             </button>
         </div>
      </div>

      {/* Body: Inputs */}
      {!isCollapsed && (
          <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {op.args.map(arg => {
            const value = step.args[arg.name] ?? '';

            return (
                <div key={arg.name}>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-700">
                        {arg.label}
                    </label>
                    {/* Add CSV upload helper for text fields, specifically if it looks like CSV or content input */}
                    {arg.type === 'text' && (
                        <label className="cursor-pointer text-xs text-blue-500 hover:text-blue-700 flex items-center space-x-1">
                            <Upload size={12} />
                            <span>Load File</span>
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".csv,.txt,.json"
                                onChange={(e) => handleFileUpload(arg.name, e)}
                            />
                        </label>
                    )}
                </div>
                
                {arg.type === 'text' && (
                    <textarea
                    className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-h-[60px] font-mono whitespace-pre"
                    value={value}
                    onChange={e => updateStepArgs(step.id, { [arg.name]: e.target.value })}
                    placeholder={arg.description}
                    />
                )}
                
                {arg.type === 'string' && (
                    <input
                        type="text"
                        className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        value={value}
                        onChange={e => updateStepArgs(step.id, { [arg.name]: e.target.value })}
                    />
                )}

                {arg.type === 'boolean' && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={!!value} 
                            onChange={e => updateStepArgs(step.id, { [arg.name]: e.target.checked })} 
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">Enabled</span>
                    </label>
                )}

                    {arg.type === 'select' && (
                        <select
                            className="w-full text-xs border border-gray-300 rounded p-2 bg-white"
                            value={value}
                            onChange={e => updateStepArgs(step.id, { [arg.name]: e.target.value })}
                        >
                            {arg.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}

                {arg.type === 'variable_ref' && (
                    <div>
                        <input
                            list={`vars-${step.id}-${arg.name}`}
                            className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={value}
                            onChange={e => updateStepArgs(step.id, { [arg.name]: e.target.value })}
                            placeholder="Select or type variable name..."
                        />
                        <datalist id={`vars-${step.id}-${arg.name}`}>
                            {availableVars.map(v => (
                                <option key={v} value={v} />
                            ))}
                        </datalist>
                    </div>
                )}

                </div>
            );
            })}

            {/* Output Section */}
            <div className="pt-3 border-t border-gray-100 mt-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Output Variable Name</label>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">→</span>
                    <input 
                        type="text" 
                        className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 bg-gray-50/50"
                        value={step.outputVarName || ''}
                        onChange={e => setStepOutputName(step.id, e.target.value)}
                        placeholder="auto-generated"
                    />
                </div>
            </div>

            {/* Error Display */}
            {isError && (
                <div className="pt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-2">
                    Last Run Error: {stepLog.message}
                </div>
            )}
        </div>
      )}
    </div>
  );
}
