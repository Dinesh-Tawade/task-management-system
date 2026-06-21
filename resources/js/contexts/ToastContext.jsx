import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Web Notification trigger
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification('Taskify Alert', {
                    body: message,
                    tag: 'taskify-notification'
                });
            } catch (error) {
                console.warn('Notification failed', error);
            }
        }

        // Automatically remove toast after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getToastColors = (type) => {
        switch (type) {
            case 'error': return 'bg-rose-950/90 border-rose-800 text-rose-300 shadow-rose-500/5';
            case 'warning': return 'bg-amber-950/90 border-amber-800 text-amber-300 shadow-amber-500/5';
            case 'info': return 'bg-sky-950/90 border-sky-800 text-sky-300 shadow-sky-500/5';
            default: return 'bg-emerald-950/90 border-emerald-800 text-emerald-300 shadow-emerald-500/5';
        }
    };

    const getToastIcon = (type) => {
        switch (type) {
            case 'error':
                return (
                    <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* FLOATING TOAST CONTAINERS */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition duration-300 animate-in slide-in-from-bottom-5 fade-in ${getToastColors(toast.type)}`}
                    >
                        {getToastIcon(toast.type)}
                        <p className="text-xs font-semibold leading-relaxed flex-1">{toast.message}</p>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
