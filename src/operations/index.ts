import { OperationDefinition } from '../types';
import { FromCSV } from './input/fromCSV';
import { InputConstant } from './input/InputConstant';
import { FilterRows } from './table/filterRows';
import { ColumnMath } from './table/columnMath';
import { SortRows } from './table/sortRows';
import { LinearRegression } from './analysis/LinearRegression';
import { ConstantMath } from './math/ConstantMath';
// import { MyOperation} from './test/myOP';

export const OPERATION_REGISTRY: Record<string, OperationDefinition> = {
  [FromCSV.id]: FromCSV,
  [InputConstant.id]: InputConstant,
  [FilterRows.id]: FilterRows,
  [ColumnMath.id]: ColumnMath,
  [SortRows.id]: SortRows,
  [ConstantMath.id]: ConstantMath,
  [LinearRegression.id]: LinearRegression,

  // A place to add new operations for testing

  // [MyOperation.id]: MyOperation              
};

export const getOperationsByCategory = () => {
  const categories: Record<string, OperationDefinition[]> = {};
  Object.values(OPERATION_REGISTRY).forEach(op => {
    if (!categories[op.category]) {
      categories[op.category] = [];
    }
    categories[op.category].push(op);
  });
  return categories;
};
