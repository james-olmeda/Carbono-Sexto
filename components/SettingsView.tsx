import React from 'react';
import WorkflowBuilder from './WorkflowBuilder';
import { Workflow } from '../types';

interface SettingsViewProps {
    workflow: Workflow;
    onWorkflowChange: (workflow: Workflow) => void;
}


const SettingsView = ({ workflow, onWorkflowChange }: SettingsViewProps) => {
    return (
        <div className="h-full flex flex-col p-2">
             <div className="flex-shrink-0 mb-4 px-2">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visual Workflow Builder</h2>
                 <p className="text-gray-500 dark:text-gray-400">Design case flows by dragging and connecting components on the canvas.</p>
            </div>
            <div className="flex-grow">
                <WorkflowBuilder workflow={workflow} onWorkflowChange={onWorkflowChange} />
            </div>
        </div>
    );
}

export default SettingsView;