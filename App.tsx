

import React, { useState } from 'react';
import AppLauncher from './components/AppLauncher';
import CaseManagementApp from './components/CaseManagementApp';
import SettingsApp from './components/SettingsApp';
import AuthScreen from './components/AuthScreen';
import { INITIAL_APPS, INITIAL_CALENDAR_EVENTS, INITIAL_CASES } from './constants';
import { AppDef, CalendarEvent, Case } from './types';
import { useAuth } from './contexts/AuthContext';
import CalendarApp from './components/CalendarApp';

export default function App() {
    const { currentUser } = useAuth();
    const [apps, setApps] = useState<AppDef[]>(INITIAL_APPS);
    const [cases, setCases] = useState<Case[]>(INITIAL_CASES);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [caseToOpenId, setCaseToOpenId] = useState<string | null>(null);
    const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

    const handleSelectApp = (appId: string, caseId?: string) => {
        setSelectedAppId(appId);
        setCaseToOpenId(caseId || null);
    };
    
    const handleExitApp = () => {
        setSelectedAppId(null);
        setCaseToOpenId(null);
    };
    
    const handleAddCase = (caseToAdd: Case) => {
        setCases(prev => [caseToAdd, ...prev]);
    };
    
    const handleUpdateCase = (updatedCase: Case) => {
        setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    };

    const handleAddEvent = (newEvent: Omit<CalendarEvent, 'id'|'source'>) => {
        const eventToAdd: CalendarEvent = {
            ...newEvent,
            id: `local-${Date.now()}`,
            source: 'local'
        };
        setLocalEvents(prev => [...prev, eventToAdd].sort((a,b) => a.start.getTime() - b.start.getTime()));
    };
    
    const handleCreateApp = (newApp: Omit<AppDef, 'id'>) => {
        const appToAdd: AppDef = { ...newApp, id: `app-${Date.now()}` };
        setApps(prev => [...prev, appToAdd]);
        // No automatic exit, user can create more apps
    };

    const handleUpdateApp = (updatedApp: AppDef) => {
        setApps(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
    };

    const handleDeleteApp = (appId: string) => {
        setApps(prev => prev.filter(app => app.id !== appId));
        setCases(prev => prev.filter(c => c.appId !== appId));
    };

    if (!currentUser) {
        return <AuthScreen />;
    }

    const selectedApp = apps.find(app => app.id === selectedAppId);
    const appWrapperClass = !selectedAppId ? '' : 'bg-white dark:bg-gray-900';

    return (
        <div className={appWrapperClass}>
            {(() => {
                if (!selectedAppId) {
                    return <AppLauncher 
                        apps={apps} 
                        cases={cases}
                        onSelectApp={handleSelectApp} 
                        localEvents={localEvents} 
                    />;
                }

                if (selectedAppId === 'calendar') {
                     return (
                        <CalendarApp 
                            onExit={handleExitApp}
                            localEvents={localEvents}
                            onAddEvent={handleAddEvent}
                        />
                    );
                }

                if (selectedAppId === 'settings') {
                    return (
                        <SettingsApp 
                            apps={apps} 
                            onExit={handleExitApp} 
                            onCreateApp={handleCreateApp}
                            onUpdateApp={handleUpdateApp}
                            onDeleteApp={handleDeleteApp}
                        />
                    );
                }

                if (selectedApp) {
                    return (
                        <CaseManagementApp 
                            app={selectedApp} 
                            allCases={cases}
                            onExit={handleExitApp} 
                            onUpdateApp={handleUpdateApp}
                            onAddCase={handleAddCase}
                            onUpdateCase={handleUpdateCase}
                            caseToOpenId={caseToOpenId}
                        />
                    );
                }

                // Fallback in case of invalid state
                return <AppLauncher apps={apps} cases={cases} onSelectApp={handleSelectApp} localEvents={localEvents} />;
            })()}
        </div>
    );
}