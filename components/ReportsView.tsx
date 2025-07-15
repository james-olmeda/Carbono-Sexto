import React from 'react';
import { ChartBarIcon } from './IconComponents';

const ReportsView = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <ChartBarIcon className="w-24 h-24 mb-4 text-gray-400 dark:text-gray-500" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Reports & Analytics</h2>
            <p className="max-w-md">
                Dive deep into your team's performance, case resolution times, and client satisfaction.
                This section is under construction and will be available soon.
            </p>
        </div>
    );
}

export default ReportsView;