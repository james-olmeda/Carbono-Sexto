import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { CalendarEvent } from '../types';
import { MOCK_OUTLOOK_EVENTS } from '../constants';

interface IntegrationsContextType {
  isOutlookConnected: boolean;
  outlookEvents: CalendarEvent[];
  connectOutlook: () => Promise<void>;
  disconnectOutlook: () => void;
}

export const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

const useStickyState = (defaultValue: any, key: string) => {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

export const IntegrationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOutlookConnected, setOutlookConnected] = useStickyState(false, 'outlookConnected');
  const [outlookEvents, setOutlookEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (isOutlookConnected) {
      setOutlookEvents(MOCK_OUTLOOK_EVENTS);
    } else {
      setOutlookEvents([]);
    }
  }, [isOutlookConnected]);

  const connectOutlook = async (): Promise<void> => {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        setOutlookConnected(true);
        resolve();
      }, 1500);
    });
  };

  const disconnectOutlook = () => {
    setOutlookConnected(false);
  };

  const value = useMemo(() => ({
    isOutlookConnected,
    outlookEvents,
    connectOutlook,
    disconnectOutlook,
  }), [isOutlookConnected, outlookEvents]);

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
};

export const useIntegrations = () => {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
};