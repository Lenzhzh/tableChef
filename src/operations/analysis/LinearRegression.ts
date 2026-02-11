import { OperationDefinition, Variable, TableValue } from '../../types';
import { v4 as uuidv4 } from 'uuid';

function calculateRegression(x: number[], y: number[]) {
    const n = x.length;
    if (n !== y.length || n === 0) return null;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    // sumYY unused for simple slope/intercept but needed for R2
    // const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0); 

    const denominator = (n * sumXX - sumX * sumX);
    if (denominator === 0) return null; // Vertical line

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const prediction = x.map(xi => slope * xi + intercept);
    const meanY = sumY / n;
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - prediction[i], 2), 0);
    const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

    return { slope, intercept, rSquared };
}

export const LinearRegression: OperationDefinition = {
  id: 'linear-regression',
  name: 'Linear Regression',
  category: 'Analysis',
  description: 'Perform simple linear regression (y = mx + b) on two columns. Outputs a table with Slope, Intercept, and R².',
  
  args: [
    {
       name: 'tableVar',
       type: 'variable_ref',
       label: 'Input Table',
       accepts: ['table'],
       description: 'Table containing the data'
    },
    {
       name: 'xCol',
       type: 'string', // Changed from text to string to avoid multiline inputs
       label: 'X Column Name',
       description: 'Name of the independent variable column'
    },
    {
       name: 'yCol',
       type: 'string', 
       label: 'Y Column Name',
       description: 'Name of the dependent variable column'
    }
  ],

  run: async (args, context) => {
    const tableVarName = args.tableVar;
    // Trim to handle accidental whitespace from user input
    const xCol = (args.xCol || '').trim();
    const yCol = (args.yCol || '').trim();

    if (!tableVarName) throw new Error("Please select an input table.");
    if (!xCol) throw new Error("Please specify the X Column Name.");
    if (!yCol) throw new Error("Please specify the Y Column Name.");

    const tableVar = context[tableVarName];
    if (!tableVar || tableVar.value.type !== 'table') {
        throw new Error(`Table variable '${tableVarName}' not found`);
    }

    const table = tableVar.value as TableValue;
    
    // Validate columns exist (Special handling for '#' which represents the row index)
    if (xCol !== '#' && !table.columns.includes(xCol)) {
        throw new Error(`Column '${xCol}' not found in table. Available: ${table.columns.join(', ')}`);
    }
    if (yCol !== '#' && !table.columns.includes(yCol)) {
        throw new Error(`Column '${yCol}' not found in table. Available: ${table.columns.join(', ')}`);
    }
    
    // Extract data
    const xData: number[] = [];
    const yData: number[] = [];
    
    table.data.forEach((row, rowIndex) => {
        let xVal: any;
        let yVal: any;

        // X Column Resolution
        if (xCol === '#') {
            xVal = rowIndex + 1; // 1-based index to match UI
        } else {
            xVal = row[xCol];
        }

        // Y Column Resolution
        if (yCol === '#') {
            yVal = rowIndex + 1;
        } else {
            yVal = row[yCol];
        }

        const x = parseFloat(xVal);
        const y = parseFloat(yVal);
        
        if (!isNaN(x) && !isNaN(y)) {
            xData.push(x);
            yData.push(y);
        }
    });

    if (xData.length < 2) {
        throw new Error("Not enough numeric data points for regression (need at least 2)");
    }

    const result = calculateRegression(xData, yData);
    if (!result) throw new Error("Regression calculation failed (possibly vertical line or bad data)");

    // Create Stats Table
    return {
        id: uuidv4(),
        name: 'temp',
        value: {
            type: 'table',
            columns: ['Metric', 'Value'],
            data: [
                { Metric: 'Slope (m)', Value: result.slope },
                { Metric: 'Intercept (b)', Value: result.intercept },
                { Metric: 'R-Squared', Value: result.rSquared },
                { Metric: 'Equation', Value: `y = ${result.slope.toFixed(4)}x + ${result.intercept.toFixed(4)}` }
            ]
        }
    } as Variable;
  }
};
