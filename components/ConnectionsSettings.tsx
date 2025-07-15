import React, { useState } from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { MicrosoftOutlookIcon, CheckCircleIcon } from './IconComponents';

const ConnectionsSettings: React.FC = () => {
    const { isOutlookConnected, connectOutlook, disconnectOutlook } = useIntegrations();
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        await connectOutlook();
        setIsLoading(false);
    };

    const handleDisconnect = () => {
        disconnectOutlook();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Connections</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Connect your favorite apps to sync data seamlessly.</p>
            
            <div className="bg-gray-100 dark:bg-black/20 rounded-[22px] border border-gray-200 dark:border-white/10 p-4 space-y-3">
                {/* Outlook Connector */}
                <div className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-[22px]">
                    <div className="flex items-center space-x-4">
                        <MicrosoftOutlookIcon className="w-8 h-8" />
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Microsoft Outlook</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sync your calendar events.</p>
                        </div>
                    </div>
                    <div>
                        {isOutlookConnected ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                    <CheckCircleIcon className="w-5 h-5" />
                                    <span className="text-sm font-semibold">Connected</span>
                                </div>
                                <button onClick={handleDisconnect} className="text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleConnect} 
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-[22px] font-semibold hover:bg-blue-500 transition-colors duration-200 shadow-lg shadow-blue-600/30 disabled:bg-blue-400 disabled:cursor-wait"
                            >
                                {isLoading ? 'Connecting...' : 'Connect'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionsSettings;