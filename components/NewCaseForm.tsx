
import React, { useState, useCallback } from 'react';
import { Case, CasePriority, User } from '../types';
import { SparklesIcon } from './IconComponents';
import { getCaseDescriptionSuggestion } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

interface NewCaseFormProps {
  onAddCase: (newCase: Omit<Case, 'id' | 'appId' | 'createdAt' | 'status' | 'currentWorkflowStepId' | 'workflowHistory' | 'formData'>) => void;
  onCancel: () => void;
}

const NewCaseForm: React.FC<NewCaseFormProps> = ({ onAddCase, onCancel }) => {
  const { users } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<CasePriority>(CasePriority.Medium);
  const [assignee, setAssignee] = useState<User>(users[0]);
  const [client, setClient] = useState('');
  const [tags, setTags] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = useCallback(async () => {
    if (!title.trim()) {
        alert("Please enter a title first to generate a description.");
        return;
    }
    setIsGenerating(true);
    try {
        const suggestion = await getCaseDescriptionSuggestion(title);
        setDescription(suggestion);
    } catch (error) {
        console.error("Failed to generate description:", error);
        alert("Sorry, we couldn't generate a description at this time.");
    } finally {
        setIsGenerating(false);
    }
  }, [title]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !client) {
        alert("Please fill all required fields.");
        return;
    }
    onAddCase({
      title,
      description,
      priority,
      assignee,
      client,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
  };

  const inputClass = "w-full p-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-[22px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all";
  const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Case</h2>
      
      <div>
        <label htmlFor="title" className={labelClass}>Case Title</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <div className="relative">
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={inputClass} required />
          <button 
            type="button" 
            onClick={handleGenerateDescription}
            disabled={isGenerating}
            className="absolute bottom-2 right-2 flex items-center space-x-1 px-2 py-1 bg-purple-600/50 text-white rounded-[22px] text-xs hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'AI Suggest'}</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="priority" className={labelClass}>Priority</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as CasePriority)} className={inputClass + " appearance-none"}>
            {Object.values(CasePriority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="assignee" className={labelClass}>Assignee</label>
          <select id="assignee" value={assignee.id} onChange={(e) => setAssignee(users.find(u => u.id === e.target.value) || users[0])} className={inputClass + " appearance-none"}>
            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="client" className={labelClass}>Client</label>
        <input type="text" id="client" value={client} onChange={(e) => setClient(e.target.value)} className={inputClass} required />
      </div>

      <div>
        <label htmlFor="tags" className={labelClass}>Tags (comma-separated)</label>
        <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-[22px] hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">Cancel</button>
        <button type="submit" className="px-6 py-2 bg-blue-600 rounded-[22px] font-semibold hover:bg-blue-500 transition-colors">Create Case</button>
      </div>
    </form>
  );
};

export default NewCaseForm;