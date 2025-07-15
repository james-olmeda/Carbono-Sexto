
import React from 'react';
import { BuilderNode, User } from '../types';
import { CheckCircleIcon, Cog6ToothIcon, Squares2x2Icon, ClockIcon, EnvelopeIcon } from './IconComponents';

interface WorkflowNodeProps {
  node: BuilderNode;
  status: 'Completed' | 'In Progress' | 'Pending';
  user?: User | null;
}

const getStatusStyles = (status: WorkflowNodeProps['status']) => {
    switch(status) {
        case 'Completed': return 'bg-green-500/20 dark:bg-green-500/30 border-green-500 text-green-600 dark:text-green-300';
        case 'In Progress': return 'bg-blue-500/20 dark:bg-blue-500/30 border-blue-500 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-black';
        case 'Pending': return 'bg-gray-200 dark:bg-white/10 border-gray-400 dark:border-white/20 text-gray-500 dark:text-gray-400';
        default: return 'bg-gray-300 dark:bg-gray-700';
    }
}

const getIcon = (type: BuilderNode['type']) => {
    switch(type) {
        case 'Start': return <CheckCircleIcon className="w-5 h-5"/>;
        case 'End': return <CheckCircleIcon className="w-5 h-5"/>;
        case 'Task': return <Cog6ToothIcon className="w-5 h-5"/>;
        case 'Gateway': return <Squares2x2Icon className="w-5 h-5"/>;
        case 'Timer': return <ClockIcon className="w-5 h-5" />;
        case 'Message': return <EnvelopeIcon className="w-5 h-5" />;
    }
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ node, status, user }) => {
  const shapeClass = node.type === 'Gateway' ? 'w-16 h-16 transform rotate-45' : 'w-16 h-16 rounded-full';
  const contentShapeClass = node.type === 'Gateway' ? '-rotate-45' : '';

  return (
    <div className="flex flex-col items-center space-y-2 group">
        <div className={`relative flex items-center justify-center border-2 transition-all duration-300 ${shapeClass} ${getStatusStyles(status)}`}>
            <div className={`flex flex-col items-center justify-center ${contentShapeClass}`}>
                {getIcon(node.type)}
            </div>
             {user && (
               <img src={user.avatarUrl} alt={user.name} title={`Assigned to ${user.name}`} className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-2 border-white dark:border-gray-800" />
            )}
        </div>
        <div className="text-xs text-center w-20 truncate transition-all duration-300 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white">
            {node.label}
        </div>
    </div>
  );
};

export default WorkflowNode;