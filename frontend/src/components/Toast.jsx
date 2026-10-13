import React, { useEffect } from 'react';

const Toast = ({ show, message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const typeStyles = {
    success: 'bg-emerald-600 text-white border-emerald-500',
    error: 'bg-rose-600 text-white border-rose-500',
    warning: 'bg-amber-500 text-white border-amber-400',
    info: 'bg-[#0194F3] text-white border-sky-400'
  };

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-max max-w-[90vw]">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold transition-all ${typeStyles[type] || typeStyles.info}`}>
        <i className={`fa-solid ${icons[type] || icons.info} text-base`} />
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 opacity-80 hover:opacity-100 p-1 cursor-pointer"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
