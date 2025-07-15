
import React from 'react';
import { Case, CasePriority } from '../types';
import { TagIcon } from './IconComponents';

interface CaseCardProps {
  caseData: Case;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const priorityStyles: { [key in CasePriority]: string } = {
    [CasePriority.Low]: 'bg-gray-500/20 text-gray-600 dark:text-gray-300',
    [CasePriority.Medium]: 'bg-blue-500/20 text-blue-600 dark:text-blue-300',
    [CasePriority.High]: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300',
    [CasePriority.Urgent]: 'bg-red-500/20 text-red-600 dark:text-red-300',
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData, onClick, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white dark:bg-white/5 p-4 rounded-[22px] border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 shadow-md backdrop-blur-sm"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 pr-2">{caseData.title}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${priorityStyles[caseData.priority]}`}>
          {caseData.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{caseData.description}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
            <TagIcon className="w-4 h-4" />
            <span>{caseData.tags[0]}</span>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{caseData.assignee.name}</span>
            <img
                src={caseData.assignee.avatarUrl}
                alt={caseData.assignee.name}
                className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-white/20"
            />
        </div>
      </div>
    </div>
  );
};

export default CaseCard;