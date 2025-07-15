



import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppDef, CalendarEvent, Case } from '../types';
import { PlusIcon, Squares2x2Icon, AppleIcon, PhotosIcon, ArrowRightOnRectangleIcon, PhoneIcon, ComputerDesktopIcon, UserGroupIcon, WrenchScrewdriverIcon, MicrosoftOutlookIcon, DocumentTextIcon } from './IconComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useIntegrations } from '../contexts/IntegrationsContext';

const WidgetCard: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void, role?: string, 'aria-label'?: string }> = ({ children, className, ...props }) => (
    <div className={`bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[22px] shadow-lg shadow-black/5 ${className}`} {...props}>
        {children}
    </div>
);

const AppIcon: React.FC<{ name: string; icon: React.ReactNode; onClick: () => void; }> = ({ name, icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-start text-center space-y-2 p-1 rounded-[22px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200">
        <div className="w-14 h-14 bg-gray-200/50 dark:bg-white/10 rounded-[22px] flex items-center justify-center text-gray-800 dark:text-gray-300 border border-black/5 dark:border-white/5">
            {icon}
        </div>
        <span className="text-xs text-black/90 dark:text-white/90 font-medium w-16 truncate">{name}</span>
    </button>
);

interface AppLauncherProps {
  apps: AppDef[];
  cases: Case[];
  onSelectApp: (id: string, caseId?: string) => void;
  localEvents: CalendarEvent[];
}

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const AppLauncher: React.FC<AppLauncherProps> = ({ apps, cases, onSelectApp, localEvents }) => {
    const { resolvedTheme } = useTheme();
    const { currentUser, logout } = useAuth();
    const { isOutlookConnected, outlookEvents } = useIntegrations();

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const recentCases = useMemo(() => {
        return [...cases]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
    }, [cases]);

    const allEvents = useMemo(() => {
        return isOutlookConnected ? [...localEvents, ...outlookEvents] : localEvents;
    }, [localEvents, outlookEvents, isOutlookConnected]);

    const todayEvents = useMemo(() => {
        const today = new Date();
        return allEvents
            .filter(event => event.start.toDateString() === today.toDateString())
            .sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [allEvents]);

    const appIconMap: { [key: string]: React.ReactNode } = {
        'Support Desk': <PhoneIcon className="w-7 h-7" />,
        'Dev Projects': <ComputerDesktopIcon className="w-7 h-7" />,
        'HR Onboarding': <UserGroupIcon className="w-7 h-7" />,
    };

    const date = new Date();
    const dayOfWeek = date.toLocaleString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', '');
    const dayOfMonth = date.getDate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const launcherLightBg = "D9E7F8";
    const launcherLightGradient = `radial-gradient(at 4% 6%, hsla(209, 87%, 83%, 1) 0px, transparent 50%), radial-gradient(at 93% 13%, hsla(202, 90%, 75%, 1) 0px, transparent 50%), radial-gradient(at 95% 94%, hsla(215, 82%, 81%, 1) 0px, transparent 50%), radial-gradient(at 5% 95%, hsla(209, 78%, 84%, 1) 0px, transparent 50%)`;
    const launcherDarkBg = "0f172a"; // slate-900
    const launcherDarkGradient = `radial-gradient(at 83% 8%, hsla(216, 38%, 13%, 1) 0px, transparent 50%), radial-gradient(at 16% 91%, hsla(218, 41%, 11%, 1) 0px, transparent 50%), radial-gradient(at 8% 13%, hsla(219, 44%, 18%, 1) 0px, transparent 50%)`;

    const dynamicStyle = {
        backgroundColor: `#${resolvedTheme === 'light' ? launcherLightBg : launcherDarkBg}`,
        backgroundImage: resolvedTheme === 'light' ? launcherLightGradient : launcherDarkGradient,
        transition: 'background-color 0.5s ease',
    };

  return (
    <div style={dynamicStyle} className="w-full h-screen text-gray-800 dark:text-gray-200 p-4 lg:p-6 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="w-full flex justify-between items-center px-2 py-1 mb-4">
            <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                <AppleIcon className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded-[22px] hover:bg-black/10 dark:hover:bg-white/10 text-black/70 dark:text-white/70 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                </button>
                 <button className="p-1.5 rounded-[22px] hover:bg-black/10 dark:hover:bg-white/10 text-black/70 dark:text-white/70 transition-colors">
                    <Squares2x2Icon className="w-5 h-5" />
                </button>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        <img 
                            src={currentUser?.avatarUrl} 
                            alt={currentUser?.name}
                            className="w-8 h-8 rounded-full"
                        />
                    </button>
                    {menuOpen && (
                         <div className="absolute right-0 mt-2 w-48 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700/50 rounded-[22px] shadow-xl z-10">
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700/50">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">{currentUser?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                            </div>
                            <div className="p-1">
                                <button onClick={logout} className="w-full text-left flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-[22px] transition-colors">
                                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
        
        {/* Main Grid */}
        <div className="w-full flex-grow grid grid-cols-10 grid-rows-4 gap-5">
            {/* User Card */}
            <WidgetCard className="col-span-10 md:col-span-3 row-span-2 p-5 flex flex-col justify-between">
                <div className="flex items-center space-x-4">
                     <img 
                        src={currentUser?.avatarUrl}
                        alt="User"
                        className="w-16 h-16 rounded-full"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-black dark:text-white">{currentUser?.name}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
                    </div>
                </div>
                <button className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline self-start">My Profile</button>
            </WidgetCard>
            
            {/* Calendar Card */}
            <WidgetCard 
                className="col-span-10 md:col-span-7 row-span-2 p-5 flex flex-col cursor-pointer hover:ring-2 hover:ring-blue-500/50 dark:hover:ring-blue-400/50 transition-all duration-300"
                onClick={() => onSelectApp('calendar')}
                role="button"
                aria-label="Open Calendar Application"
            >
                <div className="flex items-center justify-between text-black dark:text-white mb-3">
                    <div className="flex items-center space-x-2">
                        <div className="text-center bg-white/70 dark:bg-black/20 p-1 rounded-[22px] w-12">
                            <div className="text-xs text-red-500 font-bold">{dayOfWeek}</div>
                            <div className="text-2xl font-medium">{dayOfMonth}</div>
                        </div>
                        <h2 className="font-bold text-lg">Calendario</h2>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-2">
                    {todayEvents.length > 0 ? (
                        todayEvents.map(event => (
                            <div key={event.id} className="w-full text-left flex items-center space-x-3 p-2 rounded-lg">
                                <div className={`w-1.5 h-full rounded-full self-stretch ${event.source === 'outlook' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                <div>
                                    <p className="font-semibold text-sm text-black dark:text-white">{event.title}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{formatTime(event.start)} - {formatTime(event.end)}</p>
                                </div>
                                {event.source === 'outlook' && <MicrosoftOutlookIcon className="w-5 h-5 ml-auto flex-shrink-0 text-gray-500" />}
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">No hay más eventos para hoy</p>
                        </div>
                    )}
                </div>
            </WidgetCard>
            
            {/* Apps Grid */}
            <WidgetCard className="col-span-10 md:col-span-6 row-span-2 p-5">
                 <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-4 gap-x-2">
                    {apps.map(app => (
                        <AppIcon 
                            key={app.id} 
                            name={app.name} 
                            icon={appIconMap[app.name] || <WrenchScrewdriverIcon className="w-7 h-7" />} 
                            onClick={() => onSelectApp(app.id)} 
                        />
                    ))}
                    <AppIcon name="Settings" icon={<WrenchScrewdriverIcon className="w-7 h-7" />} onClick={() => onSelectApp('settings')} />
                 </div>
            </WidgetCard>
            
            {/* Recent Cases Card */}
            <WidgetCard className="col-span-10 md:col-span-4 row-span-2 p-5 flex flex-col">
                 <div className="flex items-center space-x-2 mb-3">
                    <DocumentTextIcon className="w-7 h-7" />
                    <div>
                        <h3 className="font-bold text-lg text-black dark:text-white">Recent</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your most recent cases</p>
                    </div>
                </div>
                <div className="flex-grow space-y-2">
                    {recentCases.length > 0 ? recentCases.map(caseItem => {
                        const parentApp = apps.find(a => a.id === caseItem.appId);
                        return (
                            <button 
                                key={caseItem.id} 
                                onClick={() => onSelectApp(caseItem.appId, caseItem.id)}
                                className="w-full flex items-center space-x-3 p-2 rounded-[22px] text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <span className="text-xl">{parentApp?.icon || '📄'}</span>
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold text-sm truncate text-black dark:text-white">{caseItem.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{parentApp?.name || 'Unknown App'}</p>
                                </div>
                            </button>
                        );
                    }) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">No recent cases</p>
                        </div>
                    )}
                </div>
            </WidgetCard>
        </div>
    </div>
  );
};

export default AppLauncher;