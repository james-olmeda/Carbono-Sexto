


import React from 'react';
import { Case, BuilderNode } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  columns: BuilderNode[];
  cases: Case[];
  onCaseClick: (caseData: Case) => void;
  onCaseStepChange: (caseId: string, newStepId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, cases, onCaseClick, onCaseStepChange }) => {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, caseId: string) => {
    e.dataTransfer.setData("caseId", caseId);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStepId: string) => {
    e.preventDefault();
    const caseId = e.dataTransfer.getData("caseId");
    onCaseStepChange(caseId, newStepId);
    
    const columnWrapper = (e.currentTarget as HTMLElement).closest('.kanban-column-wrapper');
    if (columnWrapper) {
      columnWrapper.classList.remove('border-blue-500');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const columnWrapper = (e.currentTarget as HTMLElement).closest('.kanban-column-wrapper');
    if (columnWrapper) {
      columnWrapper.classList.add('border-blue-500');
    }
  };
    
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const columnWrapper = (e.currentTarget as HTMLElement).closest('.kanban-column-wrapper');
     if (columnWrapper) {
      columnWrapper.classList.remove('border-blue-500');
    }
  };

  return (
    <div className="flex space-x-4 h-full">
      {columns.map((columnNode) => {
        const filteredCases = cases.filter((c) => c.currentWorkflowStepId === columnNode.id);
        return (
          <div key={columnNode.id} className="w-80 flex-shrink-0 h-full kanban-column-wrapper rounded-[22px] border border-transparent transition-colors duration-300">
            <KanbanColumn
              column={columnNode}
              cases={filteredCases}
              onCaseClick={onCaseClick}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            />
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;