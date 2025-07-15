import React from 'react';
import { BuilderNodeType } from '../types';
import { Cog6ToothIcon, Squares2x2Icon, ClockIcon, EnvelopeIcon, CheckCircleIcon } from './IconComponents';

interface PaletteItemProps {
  type: BuilderNodeType;
  label: string;
  icon: React.ReactNode;
}

const DraggableItem: React.FC<PaletteItemProps> = ({ type, label, icon }) => {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/builder-node-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex flex-col items-center justify-center p-3 space-y-2 rounded-[22px] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 cursor-grab transition-colors"
      title={`Drag to add ${label}`}
    >
      <div>{icon}</div>
      <span className="text-xs text-center text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
};

const WorkflowPalette: React.FC = () => {
    const paletteItems: PaletteItemProps[] = [
        { type: 'Start', label: 'Start Event', icon: <CheckCircleIcon className="w-8 h-8 text-green-500" /> },
        { type: 'Task', label: 'User Task', icon: <Cog6ToothIcon className="w-8 h-8 text-blue-500" /> },
        { type: 'Gateway', label: 'Gateway', icon: <div className="w-9 h-9 border-2 border-yellow-500 transform rotate-45" /> },
        { type: 'Timer', label: 'Timer Event', icon: <ClockIcon className="w-8 h-8 text-purple-500" /> },
        { type: 'Message', label: 'Message Event', icon: <EnvelopeIcon className="w-8 h-8 text-cyan-500" /> },
        { type: 'End', label: 'End Event', icon: <CheckCircleIcon className="w-8 h-8 text-red-500" /> },
    ];

    return (
        <aside className="w-52 flex-shrink-0 bg-gray-50 dark:bg-black/30 p-4 border-r border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Components</h3>
            <div className="grid grid-cols-2 gap-3">
                {paletteItems.map(item => <DraggableItem key={item.type} {...item} />)}
            </div>
        </aside>
    );
};

export default WorkflowPalette;