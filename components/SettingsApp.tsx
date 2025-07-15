
import React, { useState } from 'react';
import { AppDef } from '../types';
import { ArrowUturnLeftIcon, SwatchIcon, WrenchScrewdriverIcon, UserGroupIcon, LinkIcon } from './IconComponents';
import AppearanceSettings from './AppearanceSettings';
import AppManagementSettings from './AppManagementSettings';
import { useAuth } from '../contexts/AuthContext';
import UserManagementSettings from './UserManagementSettings';
import ConnectionsSettings from './ConnectionsSettings';

interface SettingsAppProps {
    apps: AppDef[];
    onExit: () => void;
    onCreateApp: (newApp: Omit<AppDef, 'id'>) => void;
    onUpdateApp: (updatedApp: AppDef) => void;
    onDeleteApp: (appId: string) => void;
}

type SettingsView = 'appearance' | 'apps' | 'users' | 'connections';

const SettingsSidebarItem: React.FC<{icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void}> = ({ icon, label, isActive, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-[22px] text-sm font-medium transition-colors ${
                isActive 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            <div className={`p-1.5 rounded-[22px] ${ isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>{icon}</div>
            <span>{label}</span>
        </button>
    );
};


export default function SettingsApp({ apps, onExit, onCreateApp, onUpdateApp, onDeleteApp }: SettingsAppProps) {
    const [activeView, setActiveView] = useState<SettingsView>('appearance');
    const { currentUser } = useAuth();

    return (
        <div className="h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans flex flex-col">
             {/* Header */}
            <header className="flex-shrink-0 flex items-center h-14 px-4 md:px-6 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <button onClick={onExit} className="p-2 rounded-[22px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-3"></div>
                <h1 className="text-lg font-semibold">Settings</h1>
            </header>
            
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
                    <nav className="space-y-2">
                         <SettingsSidebarItem 
                            label="Appearance"
                            icon={<SwatchIcon className={`w-5 h-5 ${activeView === 'appearance' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />}
                            isActive={activeView === 'appearance'}
                            onClick={() => setActiveView('appearance')}
                        />
                         <SettingsSidebarItem 
                            label="Applications"
                            icon={<WrenchScrewdriverIcon className={`w-5 h-5 ${activeView === 'apps' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />}
                            isActive={activeView === 'apps'}
                            onClick={() => setActiveView('apps')}
                        />
                        {currentUser?.role === 'Admin' && (
                             <SettingsSidebarItem 
                                label="Users"
                                icon={<UserGroupIcon className={`w-5 h-5 ${activeView === 'users' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />}
                                isActive={activeView === 'users'}
                                onClick={() => setActiveView('users')}
                            />
                        )}
                         <SettingsSidebarItem 
                            label="Connections"
                            icon={<LinkIcon className={`w-5 h-5 ${activeView === 'connections' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />}
                            isActive={activeView === 'connections'}
                            onClick={() => setActiveView('connections')}
                        />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6 md:p-8">
                    {activeView === 'appearance' && <AppearanceSettings />}
                    {activeView === 'apps' && (
                        <AppManagementSettings 
                            apps={apps}
                            onCreateApp={onCreateApp}
                            onUpdateApp={onUpdateApp}
                            onDeleteApp={onDeleteApp}
                        />
                    )}
                    {activeView === 'users' && <UserManagementSettings />}
                    {activeView === 'connections' && <ConnectionsSettings />}
                </main>
            </div>
        </div>
    );
}