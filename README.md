# TableChef 🍳

[English](#english) | [中文](#chinese)

<a name="english"></a>
## English

TableChef is a visual, recipe-based data processing tool designed for tabular data manipulation. Inspired by CyberChef, it allows users to chain together operations ("Ingredients") to process data step-by-step.

[demo](https://lenzhzh.github.io/tableChef/)

### Features

*   **Recipe-Based Workflow**: Build a sequence of operations (Filter, Sort, Math) to transform your data.
*   **Drag & Drop Interface**: Easily reorder steps.
*   **Incremental Execution (Baking)**: "Bake" your data to see results.
*   **Context Awareness**: Operations can reference variables and tables from previous steps.
*   **Editable Intermediates**: View and manually edit the results of any step in the sidebar.
*   **Advanced Analysis**: Supports Linear Regression, CSV importing, and custom mathematical expressions.

### Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run development server:
    ```bash
    npm run dev
    ```
3.  Build for production:
    ```bash
    npm run build
    ```

### Adding New Operators

To add a new operator to TableChef:

1.  **Create the operator file** in the appropriate category folder under `src/operations/`:
    - `input/` - Data input operations
    - `table/` - Table manipulation operations
    - `math/` - Mathematical calculations
    - `analysis/` - Advanced analysis operations

2.  **Define the operator** following the `OperationDefinition` interface:

    ```typescript
    import { OperationDefinition, Variable } from '../../types';

    export const MyOperation: OperationDefinition = {
      id: 'my-operation',           // Unique identifier
      name: 'My Operation',          // Display name
      category: 'Table',             // Category for sidebar grouping
      description: 'Description',    // Help text
      
      args: [
        {
          name: 'inputTable',
          type: 'variable_ref',      // Type: variable_ref, number, string, select, boolean, text
          label: 'Input Table',
          accepts: ['table'],        // For variable_ref: which types to accept
          description: 'The table to process'
        },
        {
          name: 'option',
          type: 'select',
          label: 'Option',
          options: ['option1', 'option2'],
          defaultValue: 'option1'
        }
      ],

      run: async (args, context) => {
        // Implementation logic
        // args: user inputs
        // context: available variables from previous steps
        
        // Return a Variable with the result
        return {
          id: 'temp',
          name: 'result',
          value: {
            type: 'table',           // or 'number', 'string'
            data: [],
            columns: []
          }
        };
      }
    };
    ```

3.  **Register the operator** in `src/operations/index.ts`:

    ```typescript
    import { MyOperation } from './category/MyOperation';

    export const OPERATION_REGISTRY: Record<string, OperationDefinition> = {
      // ... existing operations
      [MyOperation.id]: MyOperation,
    };
    ```

4.  **Test your operator** by adding it to a recipe and ensuring it executes correctly.

#### Operator Argument Types

- `variable_ref`: Reference to a variable from previous steps (specify `accepts` array)
- `number`: Numeric input
- `string`: Text input
- `text`: Multi-line text input (for expressions)
- `select`: Dropdown selection (provide `options` array)
- `boolean`: Checkbox
- `any`: Accepts any type

---

<a name="chinese"></a>
## Chinese (中文)

TableChef 是一个基于"配方"的可视化数据处理工具，专为表格数据操作而设计。它的灵感来源于 CyberChef，允许用户将各种操作（"配料"）串联起来，分步处理数据。

[预览](https://lenzhzh.github.io/tableChef/)

### 主要功能

*   **配方工作流**：构建一系列操作（如过滤、排序、数学计算）来转换数据。
*   **拖拽界面**：支持拖拽排序步骤。
*   **增量执行 (烘焙)**：点击"Bake"执行配方并查看结果。
*   **上下文感知**：后续步骤可以引用前面步骤生成的变量和表格。
*   **可编辑的中间结果**：在侧边栏实时预览并手动修改任何步骤的输出数据。
*   **高级分析**：支持线性回归、CSV 导入和自定义数学表达式计算。

### 快速开始

1.  安装依赖：
    ```bash
    npm install
    ```
2.  启动开发服务器：
    ```bash
    npm run dev
    ```
3.  构建生产版本：
    ```bash
    npm run build
    ```

### 添加新的操作符（Operator）

要为 TableChef 添加新的操作符：

1.  **创建操作符文件**，放在 `src/operations/` 下对应的分类文件夹中：
    - `input/` - 数据输入操作
    - `table/` - 表格处理操作
    - `math/` - 数学计算操作
    - `analysis/` - 高级分析操作

2.  **定义操作符**，遵循 `OperationDefinition` 接口：

    ```typescript
    import { OperationDefinition, Variable } from '../../types';

    export const MyOperation: OperationDefinition = {
      id: 'my-operation',           // 唯一标识符
      name: '我的操作',               // 显示名称
      category: 'Table',             // 分类，用于侧边栏分组
      description: '操作描述',        // 帮助文本
      
      args: [
        {
          name: 'inputTable',
          type: 'variable_ref',      // 类型：variable_ref, number, string, select, boolean, text
          label: '输入表格',
          accepts: ['table'],        // variable_ref 类型：接受哪些数据类型
          description: '要处理的表格'
        },
        {
          name: 'option',
          type: 'select',
          label: '选项',
          options: ['选项1', '选项2'],
          defaultValue: '选项1'
        }
      ],

      run: async (args, context) => {
        // 实现逻辑
        // args: 用户输入的参数
        // context: 前面步骤产生的所有变量
        
        // 返回一个包含结果的 Variable 对象
        return {
          id: 'temp',
          name: 'result',
          value: {
            type: 'table',           // 或 'number', 'string'
            data: [],
            columns: []
          }
        };
      }
    };
    ```

3.  **注册操作符**，在 `src/operations/index.ts` 中添加：

    ```typescript
    import { MyOperation } from './category/MyOperation';

    export const OPERATION_REGISTRY: Record<string, OperationDefinition> = {
      // ... 现有操作符
      [MyOperation.id]: MyOperation,
    };
    ```

4.  **测试操作符**，将其添加到配方中，确保能正确执行。

#### 操作符参数类型

- `variable_ref`: 引用前面步骤的变量（需指定 `accepts` 数组）
- `number`: 数字输入
- `string`: 文本输入
- `text`: 多行文本输入（用于表达式）
- `select`: 下拉选择（需提供 `options` 数组）
- `boolean`: 复选框
- `any`: 接受任意类型