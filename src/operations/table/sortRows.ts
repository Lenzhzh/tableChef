import { OperationDefinition, TableValue } from '../../types';

export const SortRows: OperationDefinition = {
  id: 'op_sort_rows',
  name: 'Sort Rows',
  description: 'Sort the table by a specific column.',
  category: 'Table',
  args: [
    {
      name: 'inputTable',
      type: 'variable_ref',
      label: 'Input Table',
      accepts: ['table'],
      description: 'The table to sort'
    },
    {
      name: 'column',
      type: 'text', // In future, this could be a dynamic column picker
      label: 'Column Name',
      defaultValue: '',
      description: 'Column to sort by'
    },
    {
      name: 'direction',
      type: 'select',
      label: 'Direction',
      options: ['Ascending', 'Descending'],
      defaultValue: 'Ascending'
    }
  ],
  run: (args, context) => {
    const inputVarName = args.inputTable;
    const inputVar = context[inputVarName];

    if (!inputVar || inputVar.value.type !== 'table') {
      throw new Error(`Variable '${inputVarName}' is not a valid table.`);
    }

    const table = inputVar.value as TableValue;
    const column = args.column;
    const direction = args.direction || 'Ascending';

    if (!column) throw new Error('Column name is required');

    // copy data to sort
    const newData = [...table.data].sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        if (valA === valB) return 0;
        
        // Handle numbers vs strings
        const isNum = typeof valA === 'number' && typeof valB === 'number';
        
        let comparison = 0;
        if (isNum) {
            comparison = (valA as number) - (valB as number);
        } else {
             comparison = String(valA).localeCompare(String(valB));
        }

        return direction === 'Ascending' ? comparison : -comparison;
    });

    return {
        id: 'temp',
        name: 'sorted_table', // default name
        value: {
            type: 'table',
            data: newData,
            columns: table.columns
        }
    };
  }
};
