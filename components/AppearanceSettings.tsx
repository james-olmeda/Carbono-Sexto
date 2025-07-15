import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from './IconComponents';

const AppearanceSettings = () => {
    const { theme, setTheme } = useTheme();

    const ThemeOption: React.FC<{ value: string; label: string; icon: React.ReactNode; currentTheme: string; onClick: (theme: any) => void; }> = ({ value, label, icon, currentTheme, onClick }) => (
        <div className="text-center">
            <button
                onClick={() => onClick(value)}
                className={`w-32 h-20 md:w-40 md:h-24 rounded-[22px] border-2 flex items-center justify-center transition-all ${
                    currentTheme === value ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 dark:border-gray-600 bg-gray-200/50 dark:bg-gray-700/50 hover:border-blue-400'
                }`}
                aria-label={`Select ${label} theme`}
            >
                {icon}
            </button>
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Appearance</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Choose how the interface looks. Select a theme or sync with your system.</p>

            <div className="flex flex-wrap gap-6">
                <ThemeOption
                    value="light"
                    label="Light"
                    icon={<SunIcon className="w-10 h-10 text-yellow-500" />}
                    currentTheme={theme}
                    onClick={setTheme}
                />
                <ThemeOption
                    value="dark"
                    label="Dark"
                    icon={<MoonIcon className="w-10 h-10 text-purple-400" />}
                    currentTheme={theme}
                    onClick={setTheme}
                />
                <ThemeOption
                    value="system"
                    label="System"
                    icon={<ComputerDesktopIcon className="w-10 h-10 text-gray-500 dark:text-gray-400" />}
                    currentTheme={theme}
                    onClick={setTheme}
                />
            </div>
        </div>
    );
};

export default AppearanceSettings;