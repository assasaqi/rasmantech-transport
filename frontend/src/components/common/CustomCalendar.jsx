import React, { useState } from 'react';

const CustomCalendar = ({ selectedDate, onSelectDate, onClose }) => {
  const todayObj = new Date();
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(
    new Date(todayObj.getFullYear(), todayObj.getMonth(), 1)
  );

  const formatDateToISO = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateCalendarDays = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1));
  };

  return (
    <div className="absolute left-0 sm:left-auto sm:right-0 lg:left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[60] p-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <button type="button" onClick={handlePrevMonth} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <i className="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <span className="text-xs font-bold text-slate-800">
          {currentCalendarMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={handleNextMonth} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>

      <div className="grid grid-cols-7 text-center mb-1">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName, idx) => (
          <span key={idx} className="text-[10px] font-bold text-slate-400">{dayName}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {generateCalendarDays().map((dateObj, idx) => {
          if (!dateObj) return <div key={idx} className="h-8" />;
          const isoStr = formatDateToISO(dateObj);
          const isSelected = isoStr === selectedDate;
          const isPast = dateObj < new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

          return (
            <button
              key={idx}
              type="button"
              disabled={isPast}
              onClick={() => {
                onSelectDate(isoStr);
                onClose();
              }}
              className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-[#0194F3] text-white shadow-sm'
                  : isPast
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-[#0194F3]'
              }`}
            >
              {dateObj.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
