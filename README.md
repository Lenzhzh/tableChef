# TableChef 🍳

[English](#english) | [中文](#chinese)

<a name="english"></a>
## English

TableChef is a visual, recipe-based data processing tool designed for tabular data manipulation. Inspired by CyberChef, it allows users to chain together operations ("Ingredients") to process data step-by-step.

### Features

*   **Recipe-Based Workflow**: Build a sequence of operations (Filter, Sort, Math) to transform your data.
*   **Drag & Drop Interface**: Easily reorder steps.
*   **Incremental Execution (Baking)**: "Bake" your data to see results.
*   **Context Awareness**: Operations can reference variables and tables from previous steps.
*   **Editable Intermediates**: View and manually edit the results of any step in the sidebar.
*   **Advanced Analysis**: Supports Linear Regression, CSV importing, and custom mathematical expressions.

### Tech Stack

*   **Core**: React 18, TypeScript, Vite
*   **State Management**: Zustand + Immer
*   **Styling**: Tailwind CSS
*   **Math Engine**: mathjs
*   **Drag & Drop**: @dnd-kit

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

---

<a name="chinese"></a>
## Chinese (中文)

TableChef 是一个基于“配方”的可视化数据处理工具，专为表格数据操作而设计。它的灵感来源于 CyberChef，允许用户将各种操作（“配料”）串联起来，分步处理数据。

### 主要功能

*   **配方工作流**：构建一系列操作（如过滤、排序、数学计算）来转换数据。
*   **拖拽界面**：支持拖拽排序步骤。
*   **增量执行 (烘焙)**：点击“Bake”执行配方并查看结果。
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
