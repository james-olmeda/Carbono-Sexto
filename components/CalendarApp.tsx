


import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../types';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { ArrowUturnLeftIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, MicrosoftOutlookIcon, ClockIcon } from './IconComponents';
import Modal from './Modal';

interface CalendarAppProps {
    localEvents: CalendarEvent[];
    onExit: () => void;
    onAddEvent: (event: Omit<CalendarEvent, 'id' | 'source'>) => void;
}

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const CalendarApp: React.FC<CalendarAppProps> = ({ localEvents, onExit, onAddEvent }) => {
    const { isOutlookConnected, outlookEvents } = useIntegrations();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
    const [isEventDetailModalOpen, setEventDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const handleOpenAddEventModal = () => setAddEventModalOpen(true);
    const handleOpenEventDetailModal = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setEventDetailModalOpen(true);
    };
    const handleCloseModals = () => {
        setAddEventModalOpen(false);
        setEventDetailModalOpen(false);
        setSelectedEvent(null);
    };
    const handleAddEventSubmit = (newEvent: Omit<CalendarEvent, 'id' | 'source'>) => {
        onAddEvent(newEvent);
        handleCloseModals();
    };


    const allEvents = useMemo(() => {
        return isOutlookConnected ? [...localEvents, ...outlookEvents] : localEvents;
    }, [localEvents, outlookEvents, isOutlookConnected]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        allEvents.forEach(event => {
            const dateStr = event.start.toDateString();
            if (!map.has(dateStr)) {
                map.set(dateStr, []);
            }
            map.get(dateStr)!.push(event);
        });
        return map;
    }, [allEvents]);

    const selectedDateEvents = useMemo(() => {
        return eventsByDate.get(selectedDate.toDateString())?.sort((a,b) => a.start.getTime() - b.start.getTime()) || [];
    }, [eventsByDate, selectedDate]);

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Previous month's days
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(new Date(year, month, i - firstDayOfMonth + 1));
        }
        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        // Next month's days
        const remainingCells = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            days.push(new Date(year, month + 1, i));
        }
        return days;
    }, [currentDate]);

    const goToPrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    }

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans flex flex-col">
            <header className="flex-shrink-0 flex items-center h-16 px-4 md:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-20">
                <button onClick={onExit} className="p-2 rounded-[22px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-4"></div>
                <h1 className="text-xl font-bold">Calendar</h1>
                <div className="ml-auto flex items-center space-x-4">
                    <button onClick={goToToday} className="text-sm font-semibold px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-[22px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Today</button>
                    <div className="flex items-center">
                        <button onClick={goToPrevMonth} className="p-2 rounded-[22px] hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                        <span className="w-32 text-center font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={goToNextMonth} className="p-2 rounded-[22px] hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                    <button onClick={handleOpenAddEventModal} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-[22px] font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30">
                        <PlusIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">New Event</span>
                    </button>
                </div>
            </header>
            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col p-4">
                    <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {weekDays.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 dark:bg-gray-700 border-l border-r border-gray-200 dark:border-gray-700">
                        {calendarGrid.map((day, index) => {
                            const isToday = day.toDateString() === new Date().toDateString();
                            const isSelected = day.toDateString() === selectedDate.toDateString();
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            const dayEvents = eventsByDate.get(day.toDateString()) || [];

                            return (
                                <div key={index} onClick={() => setSelectedDate(day)} className={`p-2 bg-white dark:bg-gray-800/50 relative flex flex-col cursor-pointer transition-colors ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : ''} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                    <span className={`self-start text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white font-bold' : ''}`}>{day.getDate()}</span>
                                    <div className="flex-grow mt-1 space-y-1">
                                        {dayEvents.slice(0, 3).map(e => (
                                            <div key={e.id} className={`h-1.5 rounded-full ${e.source === 'outlook' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <aside className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold">{selectedDate.toLocaleString('default', { weekday: 'long' })}, {selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getDate()}</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedDateEvents.length > 0 ? (
                            selectedDateEvents.map(event => (
                                <button key={event.id} onClick={() => handleOpenEventDetailModal(event)} className="w-full text-left flex items-start space-x-3 p-3 rounded-[22px] bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${event.source === 'outlook' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                    <div>
                                        <p className="font-semibold">{event.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatTime(event.start)} - {formatTime(event.end)}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-center text-sm text-gray-500 py-10">No events scheduled.</p>
                        )}
                    </div>
                </aside>
            </main>
             <Modal isOpen={isAddEventModalOpen} onClose={handleCloseModals}>
                <AddEventForm onAddEvent={handleAddEventSubmit} onCancel={handleCloseModals} defaultDate={selectedDate} />
            </Modal>
             <Modal isOpen={isEventDetailModalOpen} onClose={handleCloseModals}>
                {selectedEvent && <EventDetailView event={selectedEvent} />}
            </Modal>
        </div>
    );
};

// --- Add Event Form ---
const AddEventForm: React.FC<{onAddEvent: (event: Omit<CalendarEvent, 'id'|'source'>) => void, onCancel: () => void, defaultDate: Date}> = ({ onAddEvent, onCancel, defaultDate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(defaultDate.toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('11:00');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);
        onAddEvent({ title, description, start, end });
    };

    const inputClass = "w-full p-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-[22px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Event</h2>
            <div>
                <label htmlFor="title" className={labelClass}>Event Title</label>
                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required />
            </div>
             <div>
                <label htmlFor="date" className={labelClass}>Date</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startTime" className={labelClass}>Start Time</label>
                    <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="endTime" className={labelClass}>End Time</label>
                    <input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} required />
                </div>
            </div>
            <div>
                <label htmlFor="description" className={labelClass}>Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputClass} />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-[22px] hover:bg-gray-300 dark:hover:bg-white/20">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 rounded-[22px] font-semibold hover:bg-blue-500">Add Event</button>
            </div>
        </form>
    );
};

// --- Event Detail View ---
const EventDetailView: React.FC<{event: CalendarEvent}> = ({ event }) => {
    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                {event.source === 'outlook' && <MicrosoftOutlookIcon className="w-7 h-7 text-blue-500" />}
                <span>{event.title}</span>
            </h2>
            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-[22px] flex items-center space-x-4">
                <ClockIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{event.start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="text-gray-600 dark:text-gray-400">{formatTime(event.start)} - {formatTime(event.end)}</p>
                </div>
            </div>
            {event.description && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Details</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{event.description}</p>
                </div>
            )}
        </div>
    );
};

export default CalendarApp;