import { OperationDefinition } from '../../types';
import Papa from 'papaparse';

export const FromCSV: OperationDefinition = {
  id: 'op_from_csv',
  name: 'From CSV',
  description: 'Parse a CSV string into a Table.',
  category: 'Input',
  args: [
    {
      name: 'csvContent',
      type: 'text',
      label: 'CSV Content',
      defaultValue: 'name,age\nAlice,30\nBob,25',
      description: 'Paste your CSV data here'
    },
    {
      name: 'hasHeader',
      type: 'boolean',
      label: 'Has Header',
      defaultValue: true,
      description: 'Does the first row contain column names?'
    }
  ],
  run: async (args, _context) => {
    const csv = args.csvContent as string;
    const hasHeader = args.hasHeader as boolean;

    const result = Papa.parse(csv, {
      header: hasHeader,
      skipEmptyLines: true,
      dynamicTyping: true // Auto-convert numbers
    });

    if (result.errors.length > 0) {
      throw new Error(`CSV Parse Error: ${result.errors[0].message}`);
    }

    const data = result.data as Record<string, any>[];
    
    // Determine columns
    let columns: string[] = [];
    if (data.length > 0) {
      if (hasHeader) {
        columns = Object.keys(data[0]);
      } else {
        // If no header, papaparse returns array of arrays if header: false, 
        // but since we asked for header: false, we need to handle it.
        // Actually, let's stick to header: true for Table type for simplicity for now, 
        // or support array-arrays later.
        // For 'header: false', Papa returns row arrays.
        // Let's enforce header for 'Table' type for now or generate Col1, Col2...
      }
    }
    
    // If user unchecked header, Papa returns unknown[][]
    if (!hasHeader) {
       // Re-parse to get array of arrays
       const arrayResult = Papa.parse(csv, { header: false, skipEmptyLines: true, dynamicTyping: true});
       const arrayData = arrayResult.data as any[][];
       
       if (arrayData.length === 0) {
           return {
               id: 'temp',
               name: 'output',
               value: { type: 'table', data: [], columns: [] }
           };
       }

       // Generate dummy headers
       const colCount = arrayData[0].length;
       const generatedCols = Array.from({length: colCount}, (_, i) => `Column ${i+1}`);
       
       const structuredData = arrayData.map(row => {
           const rowObj: Record<string, any> = {};
           generatedCols.forEach((col, idx) => {
               rowObj[col] = row[idx];
           });
           return rowObj;
       });

       columns = generatedCols;
       return {
         id: 'temp',
         name: 'output',
         value: { type: 'table', data: structuredData, columns }
       };

    }

    return {
      id: 'temp', // This will be overwritten by the bake engine
      name: 'output', // This will be overwritten
      value: {
        type: 'table',
        data: data,
        columns: result.meta.fields || []
      }
    };
  }
};
