import React from 'react';
import { Case, CasePriority } from '../types';

interface CaseListViewProps {
  cases: Case[];
  onCaseClick: (caseData: Case) => void;
}

const priorityStyles: { [key in CasePriority]: string } = {
    [CasePriority.Low]: 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30',
    [CasePriority.Medium]: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30',
    [CasePriority.High]: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/30',
    [CasePriority.Urgent]: 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30',
};

const statusStyles: { [key: string]: string } = {
    'New': 'border-l-blue-400',
    'In Progress': 'border-l-yellow-400',
    'In Review': 'border-l-purple-400',
    'Closed': 'border-l-green-400',
};

const CaseListView: React.FC<CaseListViewProps> = ({ cases, onCaseClick }) => {
  return (
    <div className="bg-white dark:bg-black/20 rounded-[22px] border border-gray-200 dark:border-white/10 backdrop-blur-sm p-4 h-full flex flex-col">
      <div className="overflow-y-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="sticky top-0 bg-white/80 dark:bg-black/30 backdrop-blur-sm z-10">
            <tr className="border-b border-gray-200 dark:border-white/10">
              <th className="p-3 font-semibold text-gray-700 dark:text-gray-300">Case Title</th>
              <th className="p-3 font-semibold text-gray-700 dark:text-gray-300">Client</th>
              <th className="p-3 font-semibold text-gray-700 dark:text-gray-300">Assignee</th>
              <th className="p-3 font-semibold text-gray-700 dark:text-gray-300">Priority</th>
              <th className="p-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
              <th className="p-3 font-semibold text-gray-700 dark:text-gray-300">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {cases.map(caseData => (
              <tr 
                key={caseData.id} 
                onClick={() => onCaseClick(caseData)}
                className="hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors duration-200"
              >
                <td className={`p-3 font-medium text-gray-900 dark:text-white border-l-4 ${statusStyles[caseData.status]}`}>{caseData.title}</td>
                <td className="p-3">{caseData.client}</td>
                <td className="p-3">{caseData.assignee.name}</td>
                <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${priorityStyles[caseData.priority]}`}>
                        {caseData.priority}
                    </span>
                </td>
                <td className="p-3">{caseData.status}</td>
                <td className="p-3">{new Date(caseData.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaseListView;