import { OperationDefinition, TableValue } from '../../types';
import * as math from 'mathjs';

export const ColumnMath: OperationDefinition = {
  id: 'op_column_math',
  name: 'Column Math',
  description: 'Perform math on a column (e.g. colA * 2 + colB).',
  category: 'Arithmetic',
  args: [
    {
      name: 'inputTable',
      type: 'variable_ref',
      label: 'Input Table',
      accepts: ['table'],
      description: 'Table to calculate on'
    },
    {
      name: 'expression',
      type: 'text',
      label: 'Expression',
      description: 'Math expression using column names, e.g. "Age * 2" or "Price / Qty"',
      defaultValue: ''
    },
    {
      name: 'newColumnName',
      type: 'string',
      label: 'New Column Name',
      defaultValue: 'Result'
    }
  ],
  run: (args, context) => {
    const inputVarName = args.inputTable;
    const inputVar = context[inputVarName];

    if (!inputVar || inputVar.value.type !== 'table') {
      throw new Error(`Variable '${inputVarName}' is not a valid table.`);
    }

    const table = inputVar.value as TableValue;
    const expression = args.expression;
    const newCol = args.newColumnName || 'Result';

    if (!expression) throw new Error('Expression is required');

    // Compile expression once
    const compiledNode = math.parse(expression).compile();

    // Prepare global scope from scalar variables in context
    const globalScope: Record<string, any> = {};
    Object.values(context).forEach(v => {
        if (v.value.type === 'number' || v.value.type === 'string') {
            globalScope[v.name] = v.value.value;
        }
    });

    const newData = table.data.map(row => {
        // Evaluate expression for each row
        // We pass the global scope merged with the row object, so both are accessible
        let result = 0;
        try {
            // Row columns take precedence if there's a name collision, or we can spread global first
            result = compiledNode.evaluate({ ...globalScope, ...row });
        } catch (e) {
            console.warn(`Math error on row`, row, e);
            result = NaN;
        }
        
        return {
            ...row,
            [newCol]: result
        };
    });

    return {
        id: 'temp',
        name: 'output',
        value: {
            type: 'table',
            data: newData,
            columns: [...table.columns, newCol]
        }
    };
  }
};
