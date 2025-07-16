
import React from 'react';
import { BuilderNode, BuilderNodeType, User } from '../types';
import { Cog6ToothIcon, Squares2x2Icon, ClockIcon, EnvelopeIcon, CheckCircleIcon, PlusIcon, LinkIcon } from './IconComponents';

interface BuilderNodeProps {
  node: BuilderNode;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, nodeId: string) => void;
  onClick: (nodeId: string) => void;
  onConnectStart: (e: React.MouseEvent, nodeId: string) => void;
  onConnectEnd: (e: React.MouseEvent, nodeId: string) => void;
  user?: User | null;
  isConnecting: boolean;
}

const nodeStyles: { [key in BuilderNodeType]: string } = {
    Start: 'bg-green-500/30 border-green-500 text-green-300',
    End: 'bg-red-500/30 border-red-500 text-red-300',
    Task: 'bg-blue-500/30 border-blue-500 text-blue-300',
    Gateway: 'bg-yellow-500/30 border-yellow-500 text-yellow-300',
    Timer: 'bg-purple-500/30 border-purple-500 text-purple-300',
    Message: 'bg-cyan-500/30 border-cyan-500 text-cyan-300',
};

const nodeIcons: { [key in BuilderNodeType]: React.ReactNode } = {
    Start: <CheckCircleIcon className="w-8 h-8" />,
    End: <CheckCircleIcon className="w-8 h-8" />,
    Task: <Cog6ToothIcon className="w-8 h-8" />,
    Gateway: <Squares2x2Icon className="w-8 h-8" />,
    Timer: <ClockIcon className="w-8 h-8" />,
    Message: <EnvelopeIcon className="w-8 h-8" />,
};

const BuilderNodeComponent: React.FC<BuilderNodeProps> = ({ node, onDragStart, onClick, onConnectStart, onConnectEnd, user, isConnecting }) => {
  const shapeClass = node.type === 'Gateway' 
    ? 'w-24 h-24 transform rotate-45' 
    : 'w-24 h-24 rounded-full';
    
  const contentShapeClass = node.type === 'Gateway' ? '-rotate-45' : '';

  return (
    <div
      id={node.id}
      draggable={!isConnecting}
      onDragStart={(e) => onDragStart(e, node.id)}
      className="absolute flex flex-col items-center group"
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
      aria-label={`${node.label} node`}
    >
      <div 
        onClick={() => onClick(node.id)}
        onMouseUp={(e) => onConnectEnd(e, node.id)}
        className={`flex items-center justify-center border-2 transition-all duration-300 cursor-grab active:cursor-grabbing relative ${shapeClass} ${nodeStyles[node.type]}`}
      >
        <div className={`flex flex-col items-center justify-center ${contentShapeClass}`}>
          {nodeIcons[node.type]}
        </div>
        {user && node.type === 'Task' && (
           <img src={user.avatarUrl} alt={user.name} title={`Assigned to ${user.name}`} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-gray-800" />
        )}
         <button
            onMouseDown={(e) => onConnectStart(e, node.id)}
            className="absolute -top-3 -right-3 w-7 h-7 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Drag to connect"
        >
            <LinkIcon className="w-4 h-4 text-gray-800 dark:text-white" />
        </button>
      </div>
      <div className="mt-2 text-sm text-center w-24 truncate text-gray-500 dark:text-gray-300 group-hover:text-white dark:group-hover:text-white">
        {node.label}
      </div>
    </div>
  );
};

export default BuilderNodeComponent;
