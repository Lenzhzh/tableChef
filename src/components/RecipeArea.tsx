import { useAppStore } from '../store';
import StepCard from './StepCard';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableStepCard({ step }: { step: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
        {/* We pass listeners to the StepCard to only enable drag on handle if we want, or wrapper */}
        {/* StepCard expects simple props. Let's wrap it. */}
        {/* But StepCard has the handle inside. We should probably pass listeners to StepCard */}
           <StepCard step={step} dragListeners={listeners} />
    </div>
  );
}

export default function RecipeArea() {
  const recipe = useAppStore(state => state.recipe);
  const bake = useAppStore(state => state.bake);
  const isBaking = useAppStore(state => state.isBaking);
  const resetEnvironment = useAppStore(state => state.resetEnvironment);
  const reorderSteps = useAppStore(state => state.reorderSteps);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (active.id !== over?.id) {
       reorderSteps(active.id as string, over?.id as string);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-w-[350px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 font-bold bg-white shadow-sm flex justify-between items-center z-10">
        <div className="flex flex-col">
           <span className="text-gray-800">Recipe</span>
           <span className="text-xs text-gray-400 font-normal">{recipe.length} steps</span>
        </div>
        <div className="flex space-x-2">
            <button 
               onClick={() => resetEnvironment()}
               className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 border border-gray-300 rounded text-sm font-medium transition-colors"
               disabled={isBaking}
            >
               Clear Output
            </button>
            <button 
               onClick={() => bake()}
               disabled={isBaking}
               className="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 active:bg-green-800 text-sm font-semibold shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
               <span>{isBaking ? 'Baking...' : 'BAKE!'}</span>
            </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {recipe.length === 0 ? (
            <div className="h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 p-8">
               <span className="text-lg font-medium mb-1">Recipe is empty</span>
               <span className="text-sm">Click operations in the sidebar to add them here.</span>
            </div>
         ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={recipe.map(r => r.id)}
                strategy={verticalListSortingStrategy}
              >
                 <div className="space-y-4 pb-20">
                    {recipe.map((step) => (
                        <SortableStepCard key={step.id} step={step} />
                    ))}
                 </div>
              </SortableContext>
            </DndContext>
         )}
      </div>
    </div>
  );
}
