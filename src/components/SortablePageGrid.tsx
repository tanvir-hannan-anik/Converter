"use client";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, X, Edit2 } from 'lucide-react';

export interface SortableItem {
  id: string;
  url: string;
  name: string;
}

interface SortablePageGridProps {
  items: SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function SortablePageGrid({ items, onReorder, onRemove, onEdit }: SortablePageGridProps) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    onReorder(newItems);
  };

  if (items.length === 0) return null;

  const isPdf = (item: SortableItem) => item.name.toLowerCase().endsWith('.pdf');

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="pages-list" direction="vertical">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`group flex items-center gap-3 bg-white p-2.5 rounded-xl border transition-all ${
                      snapshot.isDragging
                        ? 'border-blue-400 shadow-xl ring-2 ring-blue-100'
                        : 'border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="text-gray-300 hover:text-gray-500 focus:outline-none cursor-grab active:cursor-grabbing shrink-0"
                    >
                      <GripVertical size={18} />
                    </div>

                    {/* Thumbnail with page number badge */}
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                      {isPdf(item) ? (
                        <span className="text-xs font-bold text-red-500">PDF</span>
                      ) : item.url ? (
                        <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                      <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md leading-none">
                        {index + 1}
                      </div>
                    </div>

                    <span className="flex-grow text-sm font-medium text-gray-700 truncate min-w-0">{item.name}</span>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {onEdit && !isPdf(item) && (
                        <button
                          onClick={() => onEdit(item.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                          title="Crop & Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                        title="Remove"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
