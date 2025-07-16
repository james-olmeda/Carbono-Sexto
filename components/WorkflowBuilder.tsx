
import React, { useState, useRef, useCallback } from 'react';
import { BuilderNode, BuilderNodeType, Workflow, BuilderEdge, NodeForm, FormField, FormFieldType, NodeFormMode } from '../types';
import WorkflowPalette from './WorkflowPalette';
import WorkflowCanvas from './WorkflowCanvas';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, TrashIcon } from './IconComponents';


interface WorkflowBuilderProps {
    workflow: Workflow;
    onWorkflowChange: (workflow: Workflow) => void;
}

const WorkflowBuilder = ({ workflow, onWorkflowChange }: WorkflowBuilderProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nodeToEdit, setNodeToEdit] = useState<BuilderNode | null>(null);

    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [pointerPosition, setPointerPosition] = useState<{x: number, y: number} | null>(null);
    const connectionJustMade = useRef(false);

    const dragOffset = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const canvasBounds = canvasRef.current?.getBoundingClientRect();
        if (!canvasBounds) return;

        const type = event.dataTransfer.getData('application/builder-node-type') as BuilderNodeType;
        const draggedNodeId = event.dataTransfer.getData('application/node-id');

        if (type) {
            const newNode: BuilderNode = {
                id: `node-${Date.now()}`,
                type,
                label: `${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()}`,
                x: event.clientX - canvasBounds.left - 48,
                y: event.clientY - canvasBounds.top - 48,
                ...(type === 'Task' && { form: { mode: 'FILL', fields: [] } })
            };
            onWorkflowChange({ nodes: [...workflow.nodes, newNode], edges: workflow.edges });
        } else if (draggedNodeId) {
             const newNodes = workflow.nodes.map((node) => {
                if (node.id === draggedNodeId) {
                    return {
                        ...node,
                        x: event.clientX - canvasBounds.left - dragOffset.current.x,
                        y: event.clientY - canvasBounds.top - dragOffset.current.y,
                    };
                }
                return node;
            });
            onWorkflowChange({ nodes: newNodes, edges: workflow.edges });
        }
    }, [onWorkflowChange, workflow.edges, workflow.nodes]);

    const onNodeDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, nodeId: string) => {
        const nodeElement = document.getElementById(nodeId);
        if (nodeElement) {
            const rect = nodeElement.getBoundingClientRect();
            dragOffset.current = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
        }
        event.dataTransfer.setData('application/node-id', nodeId);
        event.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleConnectStart = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setConnectingFrom(nodeId);
    };
    
    const handleConnectEnd = (e: React.MouseEvent, targetNodeId: string) => {
        e.stopPropagation(); // Prevent canvas mouseUp from firing and cancelling
        if (connectingFrom && connectingFrom !== targetNodeId) {
            const edgeExists = workflow.edges.some(
                edge => (edge.source === connectingFrom && edge.target === targetNodeId)
            );
            if (!edgeExists) {
                const newEdge: BuilderEdge = {
                    id: `edge-${connectingFrom}-${targetNodeId}-${Date.now()}`,
                    source: connectingFrom,
                    target: targetNodeId,
                };
                onWorkflowChange({ nodes: workflow.nodes, edges: [...workflow.edges, newEdge] });
            }
            // A connection attempt was made, flag it so the subsequent click event is ignored
            connectionJustMade.current = true;
        }
        setConnectingFrom(null);
        setPointerPosition(null);
    };

    const handleNodeClick = (nodeId: string) => {
        // If a connection was just made, the click event is a side effect. Ignore it.
        if (connectionJustMade.current) {
            connectionJustMade.current = false; // Reset the flag for the next click
            return;
        }

        const node = workflow.nodes.find(n => n.id === nodeId);
        if (node) {
            setNodeToEdit(node);
            setIsModalOpen(true);
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!connectingFrom || !canvasRef.current) return;
        const bounds = canvasRef.current.getBoundingClientRect();
        setPointerPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    };

    const handleMouseUpOnCanvas = (e: React.MouseEvent) => {
        // This only fires if the mouseup is on the canvas, not a node (due to stopPropagation)
        if (connectingFrom) {
            setConnectingFrom(null);
            setPointerPosition(null);
        }
    };

    const handleSaveNode = (updatedNode: BuilderNode) => {
        const newNodes = workflow.nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
        onWorkflowChange({ nodes: newNodes, edges: workflow.edges });
        setIsModalOpen(false);
        setNodeToEdit(null);
    };

    const handleDeleteNode = (nodeId: string) => {
        const newNodes = workflow.nodes.filter(n => n.id !== nodeId);
        const newEdges = workflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        onWorkflowChange({ nodes: newNodes, edges: newEdges });
        setIsModalOpen(false);
        setNodeToEdit(null);
    };
    
    const connectionLine = connectingFrom && pointerPosition ? {
        sourceId: connectingFrom,
        x2: pointerPosition.x,
        y2: pointerPosition.y
    } : null;
    
    const allWorkflowFields = workflow.nodes
        .flatMap(n => n.form?.fields || [])
        .filter(f => f.type !== 'readonly-text');


    return (
        <div className="flex h-full w-full bg-white dark:bg-black/20 rounded-[22px] border border-gray-200 dark:border-white/10 backdrop-blur-sm overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUpOnCanvas}>
            <WorkflowPalette />
            <WorkflowCanvas
                nodes={workflow.nodes}
                edges={workflow.edges}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeDragStart={onNodeDragStart}
                onNodeClick={handleNodeClick}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
                canvasRef={canvasRef}
                connectionLine={connectionLine}
                isConnecting={!!connectingFrom}
            />
             {isModalOpen && nodeToEdit && (
                <NodeEditModal 
                    node={nodeToEdit}
                    allWorkflowFields={allWorkflowFields}
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSaveNode}
                    onDelete={handleDeleteNode}
                />
            )}
        </div>
    );
};

// Node Edit Modal Component
interface NodeEditModalProps {
    node: BuilderNode;
    allWorkflowFields: FormField[];
    onClose: () => void;
    onSave: (node: BuilderNode) => void;
    onDelete: (nodeId: string) => void;
}

const NodeEditModal: React.FC<NodeEditModalProps> = ({ node, allWorkflowFields, onClose, onSave, onDelete }) => {
    const { users } = useAuth();
    const [label, setLabel] = useState(node.label);
    const [assigneeId, setAssigneeId] = useState(node.assigneeId);
    const [form, setForm] = useState<NodeForm | undefined>(node.form ? JSON.parse(JSON.stringify(node.form)) : undefined);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...node, label, assigneeId, form });
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete node "${node.label}"? This will also remove its connections.`)) {
            onDelete(node.id);
        }
    };
    
    const handleFormFieldChange = (updatedFields: FormField[]) => {
        if(!form) return;
        setForm({...form, fields: updatedFields});
    };
    
    const handleFormModeChange = (mode: NodeFormMode) => {
        if(!form) return;
        setForm({...form, mode});
    };

    const inputClass = "w-full p-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-[22px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

    return (
        <Modal isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit: {node.type} Node</h2>
                <div className="space-y-4 p-4 border border-gray-200 dark:border-white/10 rounded-[22px]">
                    <h3 className="font-semibold text-lg">Node Details</h3>
                    <div>
                        <label htmlFor="label" className={labelClass}>Node Label</label>
                        <input type="text" id="label" value={label} onChange={e => setLabel(e.target.value)} className={inputClass} required />
                    </div>

                    {node.type === 'Task' && (
                        <div>
                            <label htmlFor="assignee" className={labelClass}>Assign To</label>
                            <select id="assignee" value={assigneeId || ''} onChange={e => setAssigneeId(e.target.value || undefined)} className={inputClass}>
                                <option value="">-- Unassigned --</option>
                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                {node.type === 'Task' && form && (
                    <div className="space-y-4 p-4 border border-gray-200 dark:border-white/10 rounded-[22px]">
                        <h3 className="font-semibold text-lg">Form Builder</h3>
                        <div>
                            <label htmlFor="formMode" className={labelClass}>Form Mode</label>
                            <select id="formMode" value={form.mode} onChange={e => handleFormModeChange(e.target.value as NodeFormMode)} className={inputClass}>
                                <option value="FILL">Data Entry Form</option>
                                <option value="APPROVAL">Approval Form</option>
                            </select>
                        </div>
                        <FormFieldEditor 
                            fields={form.fields} 
                            onFieldsChange={handleFormFieldChange} 
                            allWorkflowFields={allWorkflowFields}
                        />
                    </div>
                )}
                
                 <div className="flex justify-between items-center pt-4">
                    <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600/10 text-red-500 rounded-[22px] hover:bg-red-600/20 transition-colors">Delete Node</button>
                    <div className="flex space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-[22px] hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 rounded-[22px] font-semibold hover:bg-blue-500 transition-colors">Save Changes</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

// Form Field Editor sub-component
interface FormFieldEditorProps {
    fields: FormField[];
    onFieldsChange: (fields: FormField[]) => void;
    allWorkflowFields: FormField[];
}

const FormFieldEditor: React.FC<FormFieldEditorProps> = ({ fields, onFieldsChange, allWorkflowFields }) => {
    const handleAddField = () => {
        onFieldsChange([
            ...fields, 
            { id: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false }
        ]);
    };

    const handleFieldChange = (index: number, prop: keyof FormField, value: any) => {
        const newFields = [...fields];
        if(prop === 'id') {
            // Basic validation for field ID
            const newId = value.replace(/[^a-z0-9-_]/gi, '');
            if(newFields.some((f, i) => i !== index && f.id === newId)) {
                alert('Field ID must be unique.');
                return;
            }
             newFields[index] = { ...newFields[index], [prop]: newId };
        } else {
             newFields[index] = { ...newFields[index], [prop]: value };
        }
        onFieldsChange(newFields);
    };
    
    const handleDeleteField = (index: number) => {
        onFieldsChange(fields.filter((_, i) => i !== index));
    };
    
    const inputClass = "w-full p-2 text-sm bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-[22px] focus:ring-1 focus:ring-blue-500 focus:outline-none";

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Form Fields</label>
            {fields.map((field, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[22px] space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input type="text" value={field.id} onChange={e => handleFieldChange(index, 'id', e.target.value)} placeholder="Field ID (unique)" className={inputClass} />
                        <input type="text" value={field.label} onChange={e => handleFieldChange(index, 'label', e.target.value)} placeholder="Field Label" className={inputClass} />
                        <select value={field.type} onChange={e => handleFieldChange(index, 'type', e.target.value as FormFieldType)} className={inputClass}>
                            <option value="text">Text</option>
                            <option value="textarea">Text Area</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="select">Select</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="readonly-text">Read-only Text</option>
                        </select>
                    </div>
                    {field.type === 'select' && (
                         <input type="text" value={field.options?.join(',') || ''} onChange={e => handleFieldChange(index, 'options', e.target.value.split(','))} placeholder="Options (comma-separated)" className={inputClass} />
                    )}
                     {field.type === 'readonly-text' && (
                         <select value={field.sourceFieldId || ''} onChange={e => handleFieldChange(index, 'sourceFieldId', e.target.value)} className={inputClass}>
                            <option value="">-- Select Source Field --</option>
                            {allWorkflowFields.map(f => <option key={f.id} value={f.id}>{f.label} ({f.id})</option>)}
                         </select>
                    )}
                    <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2">
                             <input type="checkbox" id={`required-${index}`} checked={!!field.required} onChange={e => handleFieldChange(index, 'required', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                             <label htmlFor={`required-${index}`} className="text-sm">Required</label>
                         </div>
                        <button type="button" onClick={() => handleDeleteField(index)} className="text-red-500 hover:text-red-700">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            ))}
            <button type="button" onClick={handleAddField} className="w-full flex items-center justify-center space-x-2 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-[22px] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors">
                <PlusIcon className="w-5 h-5"/>
                <span>Add Field</span>
            </button>
        </div>
    )
}


export default WorkflowBuilder;
