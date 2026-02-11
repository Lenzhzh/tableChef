import Sidebar from './components/Sidebar';
import RecipeArea from './components/RecipeArea';
import VariableList from './components/VariableList';
import { useAppStore } from './store';

function App() {
  const variables = useAppStore(state => state.variables);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Left: Operations */}
      <Sidebar />

      {/* Middle: Recipe */}
      <RecipeArea />

      {/* Right: Input/Output */}
      <div className="w-[30%] min-w-[300px] flex flex-col h-full shadow-lg z-20">
          <VariableList variables={variables} />
      </div>
    </div>
  )
}

export default App
