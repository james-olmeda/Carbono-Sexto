import React, { useState } from 'react';
import { AppDef } from '../types';
import { PlusIcon } from './IconComponents';
import Modal from './Modal';
import AppCreator from './AppCreator';

interface AppManagementSettingsProps {
    apps: AppDef[];
    onCreateApp: (newApp: Omit<AppDef, 'id'>) => void;
    onUpdateApp: (updatedApp: AppDef) => void;
    onDeleteApp: (appId: string) => void;
}

const AppManagementSettings: React.FC<AppManagementSettingsProps> = ({ apps, onCreateApp, onUpdateApp, onDeleteApp }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appToEdit, setAppToEdit] = useState<AppDef | null>(null);
    
    const openCreateModal = () => {
        setAppToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (app: AppDef) => {
        setAppToEdit(app);
        setIsModalOpen(true);
    };

    const handleSave = (appData: Omit<AppDef, 'id'>) => {
        if (appToEdit) {
            onUpdateApp({ ...appData, id: appToEdit.id });
        } else {
            onCreateApp(appData);
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = (appId: string) => {
        if (window.confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
            onDeleteApp(appId);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Applications</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage your created applications.</p>
                </div>
                 <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-[22px] font-semibold hover:bg-blue-500 transition-colors duration-200 shadow-lg shadow-blue-600/30"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create App</span>
                </button>
            </div>
             
             <div className="bg-gray-100 dark:bg-black/20 rounded-[22px] border border-gray-200 dark:border-white/10 p-4 space-y-3">
                {apps.map(app => (
                    <div key={app.id} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-[22px] hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-4">
                            <span className="text-3xl">{app.icon}</span>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{app.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">ID: {app.id}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => openEditModal(app)} className="text-sm font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(app.id)} className="text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                 {apps.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No applications found. Click "Create App" to get started.</p>
                    </div>
                 )}
             </div>
             
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <AppCreator 
                    onCancel={() => setIsModalOpen(false)} 
                    onCreate={handleSave}
                    appToEdit={appToEdit}
                />
            </Modal>
        </div>
    );
};

export default AppManagementSettings;