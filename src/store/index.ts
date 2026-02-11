import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { Variable, RecipeStep, ExecutionLog } from '../types';
import { OPERATION_REGISTRY } from '../operations';

interface AppState {
  variables: Record<string, Variable>; // The 'Environment'
  recipe: RecipeStep[];
  logs: ExecutionLog[];
  isBaking: boolean;

  // Actions
  addStep: (operationId: string) => void;
  updateStepArgs: (stepId: string, args: Record<string, any>) => void;
  removeStep: (stepId: string) => void;
  setStepOutputName: (stepId: string, name: string) => void;
  reorderSteps: (activeId: string, overId: string) => void;
  removeVariable: (variableName: string) => void;
  updateVariableValue: (variableName: string, value: any, rowIndex?: number, column?: string) => void;
  
  bake: () => Promise<void>;
  resetEnvironment: () => void;
}

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    variables: {},
    recipe: [],
    logs: [],
    isBaking: false,

    addStep: (operationId) => {
      const op = OPERATION_REGISTRY[operationId];
      if (!op) return;

      const newStep: RecipeStep = {
        id: uuidv4(),
        operationId,
        args: {},
        // Set default values
        outputVarName: `var_${Date.now()}` // simplistic unique name
      };

      // Populate defaults
      op.args.forEach(arg => {
          if (arg.defaultValue !== undefined) {
              newStep.args[arg.name] = arg.defaultValue;
          }
      });

      set(state => {
        state.recipe.push(newStep);
      });
    },

    updateStepArgs: (stepId, args) => {
      set(state => {
        const step = state.recipe.find(s => s.id === stepId);
        if (step) {
          step.args = { ...step.args, ...args };
        }
      });
    },

    setStepOutputName: (stepId, name) => {
        set(state => {
            const step = state.recipe.find(s => s.id === stepId);
            if (step) {
                step.outputVarName = name;
            }
        });
    },

    removeStep: (stepId) => {
      set(state => {
        state.recipe = state.recipe.filter(s => s.id !== stepId);
      });
    },

    reorderSteps: (activeId, overId) => {
       set(state => {
           const oldIndex = state.recipe.findIndex(s => s.id === activeId);
           const newIndex = state.recipe.findIndex(s => s.id === overId);
           if (oldIndex !== -1 && newIndex !== -1) {
             const [movedStep] = state.recipe.splice(oldIndex, 1);
             state.recipe.splice(newIndex, 0, movedStep);
           }
       });
    },

    removeVariable: (variableName) => {
        set(state => {
            delete state.variables[variableName];
        });
    },

    updateVariableValue: (name, value, rowIndex, col) => {
      set(state => {
        const variable = state.variables[name];
        if (!variable) return;

        if (variable.value.type === 'table' && rowIndex !== undefined && col !== undefined) {
           // Update specific cell
           variable.value.data[rowIndex][col] = value;
        } else if (variable.value.type !== 'table') {
           // Update scalar
           // @ts-ignore
           variable.value.value = value;
        }
      });
    },

    resetEnvironment: () => {
        set(state => {
            state.variables = {};
            state.logs = [];
        });
    },

    bake: async () => {
      // Don't clear variables here anymore, allowing for iterative building.
      // We only clear logs for the new run.
      set(state => { state.isBaking = true; state.logs = []; });
      const { recipe, variables } = get();
      
      // Start with current variables as context
      // Note: We need a shallow copy to execute operations without mutating store directly until the end
      // But for simplicity in this immer setup with async, we will just use a local reference
      let currentContext: Record<string, Variable> = { ...variables };

      try {
        for (const step of recipe) {
            const op = OPERATION_REGISTRY[step.operationId];
            if (!op) continue;

            try {
               const result = await op.run(step.args, currentContext);
               
               if (result) {
                   // Assign the configured output name
                   const outputName = step.outputVarName || `step_${step.id}`;
                   result.name = outputName;
                   result.id = outputName; // ID is name for variable map keys
                   
                   currentContext[outputName] = result;
                   
                   // Update Global State incrementally (optional, or bulk at end)
                   set(state => {
                       state.variables[outputName] = result;
                       state.logs.push({
                           stepId: step.id,
                           status: 'success',
                           timestamp: Date.now(),
                           output: result.value
                       });
                   });
               } else {
                   // Operation might be void (side effect only? unlikely for this app)
                   set(state => {
                       state.logs.push({ stepId: step.id, status: 'success', timestamp: Date.now() });
                   });
               }

            } catch (err: any) {
                console.error(`Error in step ${step.id}:`, err);
                set(state => {
                    state.logs.push({
                        stepId: step.id,
                        status: 'error',
                        message: err.message || 'Unknown error',
                        timestamp: Date.now()
                    });
                });
                break; // Stop execution on error
            }
        }
      } finally {
          set(state => { state.isBaking = false; });
      }
    }
  }))
);
