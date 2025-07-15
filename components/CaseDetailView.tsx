
import React, { useState, useEffect } from 'react';
import { Case, Workflow, BuilderNode, FormField, User, FormFieldType } from '../types';
import { TagIcon, CheckCircleIcon, DocumentTextIcon } from './IconComponents';
import WorkflowNode from './WorkflowNode';
import { useAuth } from '../contexts/AuthContext';
import { USERS } from '../constants';

const inputClass = "w-full p-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-[22px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all";
const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

interface CaseDetailViewProps {
  caseData: Case;
  onUpdateCase: (updatedCase: Case) => void;
  appWorkflow: Workflow;
  onCompleteStep: (caseId: string, fromStepId: string, chosenNextStepId?: string) => void;
}

const renderFieldValue = (value: any) => {
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    if (value === undefined || value === null || value === '') {
        return <span className="text-gray-500 italic">Not provided</span>;
    }
    return String(value);
};

const CaseDetailView: React.FC<CaseDetailViewProps> = ({ caseData, onUpdateCase, appWorkflow, onCompleteStep }) => {
    const { currentUser } = useAuth();
    const [formState, setFormState] = useState<Record<string, any>>({});
    
    const currentStep = appWorkflow.nodes.find(n => n.id === caseData.currentWorkflowStepId);
    
    useEffect(() => {
        if (currentStep?.form) {
            const initialFormState: Record<string, any> = {};
            currentStep.form.fields.forEach(field => {
                initialFormState[field.id] = caseData.formData[field.id] ?? (field.type === 'checkbox' ? false : '');
            });
            setFormState(initialFormState);
        }
    }, [caseData.formData, currentStep]);

    const canCompleteStep = () => {
        if (!currentStep || currentStep.type === 'End') return false;
        if (!currentStep.assigneeId) return true;
        return currentUser?.id === currentStep.assigneeId;
    };
    
    const handleFormChange = (fieldId: string, value: any) => {
        setFormState(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleCompleteFillForm = () => {
        if (!currentStep?.form) return;
        
        for (const field of currentStep.form.fields) {
            if (field.required && !formState[field.id]) {
                alert(`Please fill out the required field: ${field.label}`);
                return;
            }
        }

        const updatedCase: Case = {
            ...caseData,
            formData: {
                ...caseData.formData,
                ...formState,
            }
        };
        onUpdateCase(updatedCase);
        onCompleteStep(caseData.id, currentStep.id);
    };

    const handleApprovalDecision = (chosenNextStepId: string) => {
        onCompleteStep(caseData.id, currentStep!.id, chosenNextStepId);
    };

    const getCompletedStatus = (nodeId: string): 'Completed' | 'In Progress' | 'Pending' => {
        if (caseData.currentWorkflowStepId === nodeId) return 'In Progress';
        if (caseData.workflowHistory.some(h => h.stepId === nodeId)) return 'Completed';
        return 'Pending';
    };

    const getNodeUser = (nodeId: string) => {
        const node = appWorkflow.nodes.find(n => n.id === nodeId);
        if (!node || !node.assigneeId) return null;
        return USERS.find(u => u.id === node.assigneeId) || null;
    };

    const renderFormField = (field: FormField) => {
        switch(field.type) {
            case 'text':
            case 'number':
            case 'date':
                return <input type={field.type} id={field.id} value={formState[field.id] || ''} onChange={e => handleFormChange(field.id, e.target.value)} className={inputClass} required={field.required} />;
            case 'textarea':
                return <textarea id={field.id} value={formState[field.id] || ''} onChange={e => handleFormChange(field.id, e.target.value)} rows={4} className={inputClass} required={field.required} />;
            case 'select':
                return (
                    <select id={field.id} value={formState[field.id] || ''} onChange={e => handleFormChange(field.id, e.target.value)} className={inputClass + ' appearance-none'} required={field.required}>
                        <option value="">-- Select an option --</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'checkbox':
                return <input type="checkbox" id={field.id} checked={!!formState[field.id]} onChange={e => handleFormChange(field.id, e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />;
            case 'readonly-text':
                const value = field.sourceFieldId ? caseData.formData[field.sourceFieldId] : 'N/A';
                return <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-[22px] min-h-[38px]">{renderFieldValue(value)}</div>;
            default: return null;
        }
    }
    
    const outgoingEdges = currentStep ? appWorkflow.edges.filter(e => e.source === currentStep.id) : [];

  return (
    <div className="space-y-8">
      <div>
        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${caseData.priority === 'High' || caseData.priority === 'Urgent' ? 'bg-red-500/20 text-red-600 dark:text-red-300' : 'bg-blue-500/20 text-blue-600 dark:text-blue-300'}`}>
          {caseData.priority} Priority
        </span>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{caseData.title}</h2>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Client: {caseData.client}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-[22px]">
            <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Assignee</h4>
            <div className="flex items-center space-x-3">
                <img src={caseData.assignee.avatarUrl} alt={caseData.assignee.name} className="w-10 h-10 rounded-full" />
                <span className="font-medium text-gray-900 dark:text-white">{caseData.assignee.name}</span>
            </div>
        </div>
         <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-[22px]">
            <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Status</h4>
            <div className="font-medium text-gray-900 dark:text-white">{caseData.status}</div>
        </div>
        <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-[22px]">
            <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
                {caseData.tags.map(tag => (
                    <span key={tag} className="flex items-center space-x-1 bg-gray-300/60 dark:bg-gray-600/50 px-2 py-1 rounded-full text-xs text-gray-800 dark:text-gray-300">
                        <TagIcon className="w-3 h-3"/><span>{tag}</span>
                    </span>
                ))}
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{caseData.description}</p>
      </div>

      {canCompleteStep() && currentStep?.form && (
        <div className="bg-gray-100 dark:bg-black/20 p-6 rounded-[22px] border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{currentStep.label}</h3>
            <div className="space-y-4">
                {currentStep.form.fields.map(field => (
                    <div key={field.id}>
                        <label htmlFor={field.id} className={labelClass}>{field.label}{field.required && ' *'}</label>
                        {renderFormField(field)}
                    </div>
                ))}
            </div>
            <div className="flex justify-end mt-6 space-x-4">
                {currentStep.form.mode === 'FILL' && (
                    <button onClick={handleCompleteFillForm} className="px-4 py-2 bg-green-600 text-white rounded-[22px] font-semibold hover:bg-green-500 transition-colors shadow-lg shadow-green-600/30">
                        Complete Step
                    </button>
                )}
                {currentStep.form.mode === 'APPROVAL' && outgoingEdges.map(edge => {
                    const targetNode = appWorkflow.nodes.find(n => n.id === edge.target);
                    if (!targetNode) return null;
                    return (
                        <button key={edge.id} onClick={() => handleApprovalDecision(edge.target)} className="px-4 py-2 bg-blue-600 text-white rounded-[22px] font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30">
                            {targetNode.label}
                        </button>
                    );
                })}
            </div>
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Progress</h3>
        </div>
        <div className="relative w-full h-48 bg-gray-100 dark:bg-black/20 rounded-[22px] p-4 overflow-auto">
            <svg width="100%" height="100%" className="absolute top-0 left-0 z-0">
                {appWorkflow.edges.map(edge => {
                    const sourceNode = appWorkflow.nodes.find(n => n.id === edge.source);
                    const targetNode = appWorkflow.nodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;

                    const isCompleted = caseData.workflowHistory.some(h => h.stepId === sourceNode.id) &&
                                        (caseData.currentWorkflowStepId === targetNode.id || caseData.workflowHistory.some(h => h.stepId === targetNode.id));

                    return (
                        <line 
                            key={edge.id}
                            x1={sourceNode.x + 32} y1={sourceNode.y - 70}
                            x2={targetNode.x + 32} y2={targetNode.y - 70}
                            className={`transition-all ${isCompleted ? 'stroke-green-500' : 'stroke-gray-300 dark:stroke-white/20'}`}
                            strokeWidth="2"
                        />
                    );
                })}
            </svg>
            <div className="relative z-10">
                {appWorkflow.nodes.map(node => (
                     <div key={node.id} className="absolute" style={{ left: node.x, top: node.y - 100 }}>
                        <WorkflowNode 
                            node={node} 
                            status={getCompletedStatus(node.id)}
                            user={getNodeUser(node.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailView;