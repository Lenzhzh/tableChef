import { OperationDefinition, Variable } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const InputConstant: OperationDefinition = {
  id: 'input-constant',
  name: 'Define Constant',
  category: 'Input',
  description: 'Define a single constant value (Number or String)',
  
  args: [
    {
        name: 'type',
        label: 'Data Type',
        type: 'select',
        options: ['string', 'int', 'float'],
        defaultValue: 'string'
    },
    {
        name: 'value',
        label: 'Value',
        type: 'text',
        defaultValue: ''
    }
  ],

  run: async (args) => {
    const type = args.type || 'string';
    const rawValue = args.value;
    
    let parsedValue: string | number = rawValue;

    if (type === 'int') {
        parsedValue = parseInt(rawValue, 10);
        if (isNaN(parsedValue)) parsedValue = 0;
    } else if (type === 'float') {
        parsedValue = parseFloat(rawValue);
        if (isNaN(parsedValue)) parsedValue = 0.0;
    } else {
        parsedValue = String(rawValue || '');
    }

    // Return the new variable directly. The ID and Name are assigned by the Store/Caller usually, 
    // but the `OperationRunFn` expects a `Variable`.
    // Wait, looking at `OperationRunFn`, it returns `Variable`.
    // Looking at store: `result.name = outputName`. 
    // The Store assigns the name. The Tool just needs to provide the value structure.
    // Actually, `Variable` interface has `id`, `name`, `value`.
    // The store overwrites `name`. `id` is usually generated here.
    
    return {
        id: uuidv4(),
        name: 'temp', // Will be overwritten by store
        value: {
            type: type === 'string' ? 'string' : 'number',
            value: parsedValue
        }
    } as Variable;
  }
};
