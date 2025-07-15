import React from 'react';
import { Squares2x2Icon, ChartBarIcon, Cog6ToothIcon, TagIcon } from './IconComponents';
import { ActiveView, AppDef } from '../types';

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: ActiveView, active?: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-[22px] transition-all duration-200 w-16 h-16 ${
      active
        ? 'bg-blue-500/10 dark:bg-white/20 text-blue-600 dark:text-white'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white'
    }`}
    aria-label={label}
    aria-current={active ? 'page' : undefined}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

interface SidebarProps {
    app: AppDef;
    onExit: () => void;
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}


export default function Sidebar({ app, onExit, activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="h-full w-20 flex flex-col items-center py-4 space-y-6 bg-gray-200/50 dark:bg-black/30 border-r border-gray-300/50 dark:border-white/10 backdrop-blur-lg">
      <button 
        onClick={onExit} 
        title="Back to Launcher" 
        className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-[22px] shadow-lg flex items-center justify-center text-3xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white"
      >
          {app.icon}
      </button>
      <nav className="flex flex-col items-center space-y-3">
        <NavItem icon={<Squares2x2Icon className="w-6 h-6" />} label="Boards" active={activeView === 'Boards'} onClick={() => setActiveView('Boards')} />
        <NavItem icon={<TagIcon className="w-6 h-6" />} label="Cases" active={activeView === 'Cases'} onClick={() => setActiveView('Cases')}/>
        <NavItem icon={<ChartBarIcon className="w-6 h-6" />} label="Reports" active={activeView === 'Reports'} onClick={() => setActiveView('Reports')}/>
        <NavItem icon={<Cog6ToothIcon className="w-6 h-6" />} label="Settings" active={activeView === 'Settings'} onClick={() => setActiveView('Settings')}/>
      </nav>
      <div className="mt-auto">
        {/* User profile can go here */}
      </div>
    </aside>
  );
}