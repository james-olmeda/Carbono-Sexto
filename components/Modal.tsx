
import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from './IconComponents';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const backdropClasses = isOpen 
    ? 'opacity-100' 
    : 'opacity-0 pointer-events-none';
    
  const panelClasses = isOpen 
    ? 'opacity-100 scale-100' 
    : 'opacity-0 scale-95 pointer-events-none';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${backdropClasses}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[22px] shadow-2xl text-gray-900 dark:text-white overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${panelClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-8">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;