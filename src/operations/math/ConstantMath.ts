import { OperationDefinition, Variable } from '../../types';
import * as math from 'mathjs';
import { v4 as uuidv4 } from 'uuid';

export const ConstantMath: OperationDefinition = {
  id: 'constant-math',
  name: 'Calculate Constant',
  category: 'Math',
  description: 'Calculate a new constant value using an expression (e.g., "const1 + 5")',
  
  args: [
      {
          name: 'expression',
          label: 'Expression',
          type: 'text',
          description: 'Math expression using variable names. e.g. "a * 2 + b"',
          defaultValue: ''
      }
  ],

  run: async (args, context) => {
    const expression = args.expression;
    
    if (!expression) throw new Error("Expression is empty");

    // Create a scope with all current scalar variables
    const scope: Record<string, any> = {};
    Object.values(context).forEach(v => {
        if (v.value.type === 'number' || v.value.type === 'string') {
            scope[v.name] = v.value.value;
        }
    });

    try {
        const result = math.evaluate(expression, scope);
        
        // Determine type of result
        // mathjs result can be number, string, Matrix, complex, etc.
        // We only support number/string for now here.
        let type: 'number' | 'string' = 'string';
        let val = result;

        if (typeof result === 'number') {
            type = 'number';
        } else {
            val = String(result);
        }

        return {
            id: uuidv4(),
            name: 'temp',
            value: {
                type: type,
                value: val
            }
        } as Variable;
    } catch (e) {
        throw new Error(`Expression error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
};
