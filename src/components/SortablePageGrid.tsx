"use client";
import React from 'react';
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
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    onReorder(newItems);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="pages-list" direction="vertical">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="group relative flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                      <GripVertical size={20} />
                    </div>
                    {item.url && (
                      <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                         {item.name.toLowerCase().endsWith('.pdf') ? (
                           <span className="text-xs font-bold text-red-500">PDF</span>
                         ) : (
                           <img src={item.url} alt="preview" className="h-full w-full object-cover" />
                         )}
                      </div>
                    )}
                    <span className="flex-grow text-sm font-medium text-gray-700 truncate">{item.name}</span>
                    
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
                        title="Edit Image"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}

                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 focus:outline-none"
                    >
                      <X size={18} />
                    </button>
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
