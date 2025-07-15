import React from 'react';
import { PlusIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';
import { ActiveView } from '../types';

interface HeaderProps {
  onNewCaseClick: () => void;
  activeView: ActiveView;
  appName: string;
}

const viewTitles: { [key in ActiveView]: string } = {
    Boards: 'Dashboard',
    Cases: 'All Cases',
    Reports: 'Analytics',
    Settings: 'Workflow Builder'
};

const Header: React.FC<HeaderProps> = ({ onNewCaseClick, activeView, appName }) => {
  const { currentUser } = useAuth();
  
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 md:px-6 bg-white/50 dark:bg-black/10 backdrop-blur-md border-b border-gray-300/50 dark:border-white/10">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{appName} <span className="text-gray-500 dark:text-gray-400 font-normal">/ {viewTitles[activeView]}</span></h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {currentUser?.name.split(' ')[0]}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <input
            type="search"
            placeholder="Search cases..."
            className="w-64 pl-4 pr-4 py-2 rounded-[22px] bg-gray-200/50 dark:bg-white/5 border border-gray-300/50 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>
        <button
          onClick={onNewCaseClick}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-[22px] font-semibold hover:bg-blue-500 transition-colors duration-200 shadow-lg shadow-blue-600/30"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">New Case</span>
        </button>
        <div className="flex items-center">
            <img 
                src={currentUser?.avatarUrl}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full border-2 border-gray-300/50 dark:border-white/20"
            />
        </div>
      </div>
    </header>
  );
};

export default Header;