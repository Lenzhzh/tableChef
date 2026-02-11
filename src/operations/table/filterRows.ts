import { OperationDefinition, TableValue } from '../../types';

export const FilterRows: OperationDefinition = {
  id: 'op_filter_rows',
  name: 'Filter Rows',
  description: 'Filter rows based on a column value.',
  category: 'Table',
  args: [
    {
      name: 'inputTable',
      type: 'variable_ref',
      label: 'Input Table',
      accepts: ['table'],
      description: 'The table to filter'
    },
    {
      name: 'column',
      type: 'string', // Should ideally be a dynamic select based on input, but simplified for now
      label: 'Column Name',
      defaultValue: '',
      description: 'The column to check'
    },
    {
      name: 'operator',
      type: 'select',
      label: 'Condition',
      options: ['equals', 'contains', 'greater_than', 'less_than'],
      defaultValue: 'equals'
    },
    {
      name: 'value',
      type: 'string',
      label: 'Value',
      defaultValue: ''
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
    const operator = args.operator;
    const value = args.value;

    if (!column) throw new Error('Column name is required');

    const newData = table.data.filter(row => {
        const cellValue = row[column];
        if (cellValue === undefined) return false; // Skip if column doesn't exist

        const strCell = String(cellValue);
        const strVal = String(value);

        switch (operator) {
            case 'equals': return strCell == strVal;
            case 'contains': return strCell.includes(strVal);
            case 'greater_than': return Number(cellValue) > Number(value);
            case 'less_than': return Number(cellValue) < Number(value);
            default: return false;
        }
    });

    return {
        id: 'temp',
        name: 'filtered_table',
        value: {
            type: 'table',
            data: newData,
            columns: table.columns
        }
    };
  }
};
