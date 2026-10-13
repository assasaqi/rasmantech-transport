import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, autoCloseDuration = 4000 }) => {
  const location = useLocation();
  const [notification, setNotification] = useState(null);
  const isProcessedRef = useRef(false);

  // Tangkap pesan dari navigation state saat pindah halaman
  useEffect(() => {
    if (location.state?.message && !isProcessedRef.current) {
      setNotification({
        type: location.state.type || 'success',
        message: location.state.message,
      });
      isProcessedRef.current = true;
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    isProcessedRef.current = false;
  }, [location.pathname]);

  // Auto close timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [notification, autoCloseDuration]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const isSuccess = notification?.type === 'success';

  return (
    <NotificationContext.Provider value={{ showNotification, closeNotification }}>
      {/* Toast Menempel Penuh di Paling Atas Layar */}
      {notification && (
        <div className="fixed top-0 left-0 right-0 z-[999999] w-full px-4 py-3 flex items-center justify-between shadow-md text-white transition-all duration-300 bg-[#00B973]">
          <div className="flex items-center space-x-3 max-w-[90%]">
            <i className={`fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'} text-lg shrink-0`}></i>
            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase break-words">
              {notification.message}
            </span>
          </div>
          <button
            type="button"
            onClick={closeNotification}
            className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer focus:outline-none"
            aria-label="Tutup"
          >
            <i className="fa-solid fa-xmark text-sm block"></i>
          </button>
        </div>
      )}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
