


import React from 'react';
import { Case, BuilderNode } from '../types';
import CaseCard from './CaseCard';

interface KanbanColumnProps {
  column: BuilderNode;
  cases: Case[];
  onCaseClick: (caseData: Case) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, caseId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stepId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, cases, onCaseClick, onDragStart, onDrop, onDragOver, onDragLeave }) => {
  return (
    <div 
        className="flex flex-col h-full bg-gray-200/50 dark:bg-black/20 rounded-[22px] border border-gray-300/50 dark:border-white/10 backdrop-blur-sm p-3"
        onDrop={(e) => onDrop(e, column.id)}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
    >
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="font-bold text-gray-800 dark:text-white">{column.label}</h2>
        <span className="text-sm font-medium bg-gray-300/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5">
          {cases.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {cases.map((caseData) => (
          <CaseCard 
            key={caseData.id} 
            caseData={caseData} 
            onClick={() => onCaseClick(caseData)}
            onDragStart={(e) => onDragStart(e, caseData.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;