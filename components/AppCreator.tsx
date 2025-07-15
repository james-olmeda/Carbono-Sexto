
import React, { useState } from 'react';
import { AppDef } from '../types';
import { INITIAL_APPS } from '../constants';
import { defaultWorkflow } from '../constants';


interface AppCreatorProps {
  onCancel: () => void;
  onCreate: (newApp: Omit<AppDef, 'id'>) => void;
  appToEdit?: AppDef | null;
}

const themeColors = ['blue', 'purple', 'green', 'red', 'yellow'];
const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
};

const AppCreator: React.FC<AppCreatorProps> = ({ onCancel, onCreate, appToEdit }) => {
    const [name, setName] = useState(appToEdit?.name || '');
    const [icon, setIcon] = useState(appToEdit?.icon || '✨');
    const [themeColor, setThemeColor] = useState(appToEdit?.themeColor ||'blue');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter an app name.');
            return;
        }
        const workflow = appToEdit?.workflow || JSON.parse(JSON.stringify(defaultWorkflow));
        onCreate({ name, icon, themeColor, workflow });
    };
    
    const inputClass = "w-full p-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-[22px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{appToEdit ? 'Edit Application' : 'Create New Application'}</h2>
            
            <div>
                <label htmlFor="appName" className={labelClass}>App Name</label>
                <input type="text" id="appName" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g., Sales CRM" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="appIcon" className={labelClass}>Icon (Emoji)</label>
                    <input type="text" id="appIcon" value={icon} onChange={e => setIcon(e.target.value)} className={inputClass + ' text-2xl text-center'} maxLength={2} />
                </div>
                <div>
                    <label className={labelClass}>Theme Color</label>
                    <div className="flex items-center space-x-2 mt-2">
                        {themeColors.map(color => (
                            <button
                                type="button"
                                key={color}
                                onClick={() => setThemeColor(color)}
                                className={`w-8 h-8 rounded-full ${colorClasses[color]} transition-transform hover:scale-110 ${themeColor === color ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-white' : ''}`}
                                aria-label={`Select ${color} theme`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-[22px] hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 rounded-[22px] font-semibold hover:bg-blue-500 transition-colors">{appToEdit ? 'Save Changes' : 'Create App'}</button>
            </div>
        </form>
    )
};

export default AppCreator;