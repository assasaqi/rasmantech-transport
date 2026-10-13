import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getVehicles, createBooking } from '@/services/api';
import { useToast } from '@/context/ToastContext';

const FormSewaMobil = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const formatDateToISO = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayObj = new Date();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pricePerDay, setPricePerDay] = useState(0);

  // Initial Form State
  const initialForm = {
    custName: '',
    custWa: '',
    custEmail: '',
    jenisLayanan: 'Sewa Mobil',
    vehicleId: null,
    armada: '',
    pickupDate: '',
    pickupTime: '',
    pickupLoc: '',
    duration: '',
    price: 0
  };

  const [formData, setFormData] = useState(initialForm);

  const [isArmadaOpen, setIsArmadaOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(
    new Date(todayObj.getFullYear(), todayObj.getMonth(), 1)
  );

  const armadaRef = useRef(null);
  const calendarRef = useRef(null);
  const timePickerRef = useRef(null);

  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesList = ['00', '15', '30', '45'];

  // Pre-fill data user dari localStorage jika sudah login
  useEffect(() => {
    try {
      const storedClient = localStorage.getItem('clientUser') || localStorage.getItem('user');
      if (storedClient) {
        const user = JSON.parse(storedClient);
        setFormData((prev) => ({
          ...prev,
          custName: prev.custName || user.name || user.fullName || '',
          custWa: prev.custWa || user.phone || user.whatsapp || '',
          custEmail: prev.custEmail || user.email || ''
        }));
      }
    } catch (e) {
      console.error('Gagal membaca data profil lokal:', e);
    }
  }, []);

  useEffect(() => {
    getVehicles()
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setVehicles(res.data.data);
        } else if (Array.isArray(res.data)) {
          setVehicles(res.data);
        }
      })
      .catch((err) => console.error('Gagal memuat data armada:', err));
  }, []);

  useEffect(() => {
    if (location.state && Object.keys(location.state).length > 0) {
      const stateData = location.state;
      const isRentalData = stateData.jenisLayanan === 'Sewa Mobil' || !!stateData.carType || !!stateData.namaArmada || !!stateData.vehicle_id || !!stateData.id;

      if (!isRentalData) return;

      const matchedName = stateData.carType || stateData.namaArmada || stateData.name || stateData.model || '';
      const unitPrice = Number(stateData.price || stateData.price_per_day || stateData.harga || 0);
      const rawDuration = stateData.duration ? (typeof stateData.duration === 'number' ? `${stateData.duration} Hari` : stateData.duration) : '';
      const durNum = parseInt(rawDuration) || 1;

      if (unitPrice > 0) {
        setPricePerDay(unitPrice);
      }

      setFormData((prev) => ({
        ...prev,
        jenisLayanan: 'Sewa Mobil',
        vehicleId: stateData.vehicle_id || stateData.vehicleId || stateData.id || prev.vehicleId,
        armada: matchedName || prev.armada,
        duration: rawDuration || prev.duration,
        price: stateData.totalPrice || (unitPrice > 0 ? unitPrice * durNum : prev.price),
        pickupDate: stateData.date || stateData.startDate || prev.pickupDate,
        pickupTime: stateData.time || stateData.pickupTime || prev.pickupTime,
        pickupLoc: stateData.pickup || stateData.location || prev.pickupLoc
      }));
    }
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (armadaRef.current && !armadaRef.current.contains(e.target)) setIsArmadaOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setIsCalendarOpen(false);
      if (timePickerRef.current && !timePickerRef.current.contains(e.target)) setIsTimePickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetForm = () => {
    setFormData(initialForm);
    setSelectedHour('08');
    setSelectedMinute('00');
    setPricePerDay(0);
    setIsArmadaOpen(false);
    setIsCalendarOpen(false);
    setIsTimePickerOpen(false);
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleSelectArmada = (veh) => {
    const vehName = veh.name || veh.model || veh.carType || 'Armada Mobil';
    const unitPrice = Number(veh.price_per_day || veh.price || veh.harga || 0);
    const durNum = parseInt(formData.duration) || 1;

    setPricePerDay(unitPrice);
    setFormData((prev) => ({
      ...prev,
      vehicleId: veh.id,
      armada: vehName,
      price: unitPrice > 0 ? unitPrice * durNum : prev.price
    }));
    setIsArmadaOpen(false);
  };

  const handleDurationChange = (e) => {
    const val = e.target.value;
    const durNum = parseInt(val) || 0;
    const durStr = durNum > 0 ? `${durNum} Hari` : '';

    setFormData((prev) => ({
      ...prev,
      duration: durStr,
      price: pricePerDay > 0 && durNum > 0 ? pricePerDay * durNum : prev.price
    }));
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

  const calendarDays = generateCalendarDays();

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = (field) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
  };

  const handleToggleTimePicker = () => {
    if (!isTimePickerOpen) {
      if (formData.pickupTime) {
        const [h, m] = formData.pickupTime.split(':');
        if (h) setSelectedHour(h);
        if (m) setSelectedMinute(m);
      } else {
        setSelectedHour('08');
        setSelectedMinute('00');
      }
    }
    setIsTimePickerOpen(!isTimePickerOpen);
    setIsArmadaOpen(false);
    setIsCalendarOpen(false);
  };

  const handleApplyTime = () => {
    setFormData((prev) => ({ ...prev, pickupTime: `${selectedHour}:${selectedMinute}` }));
    setIsTimePickerOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token') || localStorage.getItem('clientToken');
    if (!token) {
      showToast('Silakan login terlebih dahulu untuk melakukan pemesanan!', 'info');
      navigate('/login');
      return;
    }

    // Validasi notifikasi kustom Toast
    if (!formData.custName.trim()) return showToast('Silakan isi nama pemesan!', 'warning');
    if (!formData.custWa.trim()) return showToast('Silakan isi nomor WhatsApp!', 'warning');
    if (!formData.pickupLoc.trim()) return showToast('Silakan isi lokasi penjemputan / hotel!', 'warning');
    if (!formData.armada) return showToast('Silakan pilih armada / mobil terlebih dahulu!', 'warning');
    if (!formData.pickupDate) return showToast('Silakan pilih tanggal mulai rental!', 'warning');
    if (!formData.pickupTime) return showToast('Silakan pilih waktu penjemputan!', 'warning');
    if (!formData.duration || parseInt(formData.duration) <= 0) return showToast('Silakan isi durasi rental (jumlah hari)!', 'warning');

    setIsLoading(true);

    const selectedVeh = vehicles.find(
      (v) => (v.name || v.model || '').toLowerCase().trim() === (formData.armada || '').toLowerCase().trim()
    );

    const validVehicleId = formData.vehicleId || selectedVeh?.id ? Number(formData.vehicleId || selectedVeh?.id) : undefined;

    const newBookingPayload = {
      service_type: 'Sewa_Mobil',
      serviceType: 'Sewa_Mobil',

      vehicle_id: validVehicleId,
      vehicleId: validVehicleId,

      customer_name: formData.custName.trim(),
      customerName: formData.custName.trim(),
      customer_phone: formData.custWa.trim(),
      customerPhone: formData.custWa.trim(),
      customer_email: formData.custEmail?.trim() || undefined,
      customerEmail: formData.custEmail?.trim() || undefined,

      pickup_address: formData.pickupLoc,
      pickupAddress: formData.pickupLoc,
      pickup_location: formData.pickupLoc,

      pickup_date: formData.pickupDate,
      pickupDate: formData.pickupDate,
      start_date: formData.pickupDate,
      startDate: formData.pickupDate,

      pickup_time: formData.pickupTime,
      pickupTime: formData.pickupTime,

      total_price: Number(formData.price || 0),
      totalPrice: Number(formData.price || 0),

      notes: `Durasi: ${formData.duration || '1 Hari'}`,
      status: 'pending'
    };

    try {
      const response = await createBooking(newBookingPayload);
      if (response.data?.success) {
        showToast('Pemesanan sewa mobil berhasil dibuat!', 'success');
      }
    } catch (error) {
      console.warn('API error/offline, data disimpan ke LocalStorage.', error);
      showToast(error.response?.data?.message || 'Gagal mengirim ke server, disimpan di penyimpanan lokal.', 'warning');
    } finally {
      const existingTemp = JSON.parse(localStorage.getItem('temp_bookings') || '[]');
      localStorage.setItem('temp_bookings', JSON.stringify([newBookingPayload, ...existingTemp]));

      setIsLoading(false);
      navigate('/pesanan-saya', { state: { newBooking: newBookingPayload } });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs transition-all relative">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-car text-[#0194F3]"></i>
            <span>Layanan Sewa Mobil</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
            Lengkapi data pemesanan sewa mobil Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetForm}
          className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 border border-rose-100"
        >
          <i className="fa-solid fa-rotate-left text-[10px]"></i>
          <span>Reset</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* JENIS LAYANAN (LOCKED BADGE FIELD) */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Jenis Layanan
          </label>
          <div className="relative flex items-center">
            <div className="w-full h-11 px-3.5 bg-sky-50/60 rounded-xl border border-sky-100 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#0194F3] flex items-center gap-2">
                <i className="fa-solid fa-car-side text-[#0194F3]"></i>
                {formData.jenisLayanan}
              </span>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                <i className="fa-solid fa-lock text-[9px]"></i>
                Otomatis
              </span>
            </div>
          </div>
        </div>

        {/* NAMA & WA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Nama Pemesan *
            </label>
            <div className="relative flex items-center">
              <i className="fa-solid fa-user text-slate-400 text-xs absolute left-3.5"></i>
              <input
                type="text"
                name="custName"
                placeholder="Contoh: Dafatih Alamsyah"
                value={formData.custName}
                onChange={handleChange}
                className="w-full h-11 pl-9 pr-8 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
              />
              {formData.custName && (
                <button
                  type="button"
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  onClick={() => handleClear('custName')}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Nomor WhatsApp / HP *
            </label>
            <div className="relative flex items-center">
              <i className="fa-brands fa-whatsapp text-slate-400 text-xs absolute left-3.5"></i>
              <input
                type="tel"
                name="custWa"
                placeholder="Contoh: 0812xxxxxxxx"
                value={formData.custWa}
                onChange={handleChange}
                className="w-full h-11 pl-9 pr-8 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
              />
              {formData.custWa && (
                <button
                  type="button"
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  onClick={() => handleClear('custWa')}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LOKASI PENJEMPUTAN & ARMADA MOBIL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lokasi Penjemputan / Hotel *
            </label>
            <div className="relative flex items-center">
              <i className="fa-solid fa-location-dot text-slate-400 text-xs absolute left-3.5"></i>
              <input
                type="text"
                name="pickupLoc"
                placeholder="Contoh: Bandara LOP / Hotel Senggigi"
                value={formData.pickupLoc}
                onChange={handleChange}
                className="w-full h-11 pl-9 pr-8 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
              />
              {formData.pickupLoc && (
                <button
                  type="button"
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  onClick={() => handleClear('pickupLoc')}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="relative" ref={armadaRef}>
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Armada / Mobil *
            </label>
            <div
              onClick={() => {
                setIsArmadaOpen(!isArmadaOpen);
                setIsCalendarOpen(false);
                setIsTimePickerOpen(false);
              }}
              className={`border rounded-xl p-2.5 sm:p-3 bg-white flex items-center justify-between cursor-pointer transition-all ${
                isArmadaOpen
                  ? 'border-[#0194F3] ring-2 ring-sky-100'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <i className="fa-solid fa-car text-[#0194F3] text-sm shrink-0"></i>
                <span
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    formData.armada ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {formData.armada || 'Pilih Armada Mobil'}
                </span>
              </div>
              <i
                className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                  isArmadaOpen ? 'rotate-180 text-[#0194F3]' : ''
                }`}
              ></i>
            </div>

            {isArmadaOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] overflow-hidden">
                <div className="max-h-56 overflow-y-auto py-1">
                  {vehicles.length > 0 ? (
                    vehicles.map((v, idx) => {
                      const vName = v.name || v.model || v.carType || 'Mobil';
                      const isSelected = formData.armada === vName;
                      return (
                        <div
                          key={v.id || idx}
                          onClick={() => handleSelectArmada(v)}
                          className={`px-3 py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-between hover:bg-sky-50 ${
                            isSelected ? 'text-[#0194F3] bg-sky-50/50 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{vName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {v.price || v.price_per_day
                                ? `Rp ${new Intl.NumberFormat('id-ID').format(v.price || v.price_per_day)} / hari`
                                : 'Harga menyesuaikan'}
                            </span>
                          </div>
                          {isSelected && <i className="fa-solid fa-check text-xs"></i>}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-3 text-xs text-slate-400 text-center">
                      Tidak ada data armada
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TANGGAL, WAKTU & DURASI RENTAL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* TANGGAL */}
          <div className="relative" ref={calendarRef}>
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Tanggal Mulai Rental *
            </label>
            <div
              onClick={() => {
                setIsCalendarOpen(!isCalendarOpen);
                setIsArmadaOpen(false);
                setIsTimePickerOpen(false);
              }}
              className={`border rounded-xl p-2.5 sm:p-3 bg-white flex items-center justify-between cursor-pointer transition-all ${
                isCalendarOpen
                  ? 'border-[#0194F3] ring-2 ring-sky-100'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <i className="fa-solid fa-calendar-days text-[#0194F3] text-sm shrink-0"></i>
                <span
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    formData.pickupDate ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {formData.pickupDate
                    ? formatDisplayDate(formData.pickupDate)
                    : 'Pilih Tanggal'}
                </span>
              </div>
              <i
                className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                  isCalendarOpen ? 'rotate-180 text-[#0194F3]' : ''
                }`}
              ></i>
            </div>

            {/* MODAL KALENDER TERPUSAT DI MOBILE */}
            {isCalendarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[70] sm:hidden"
                  onClick={() => setIsCalendarOpen(false)}
                />
                <div className="fixed inset-0 sm:inset-auto sm:absolute sm:left-0 sm:top-full sm:mt-2 z-[75] flex items-center justify-center sm:block p-4 sm:p-0 pointer-events-none sm:pointer-events-auto">
                  <div className="w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 pointer-events-auto">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentCalendarMonth(
                            new Date(
                              currentCalendarMonth.getFullYear(),
                              currentCalendarMonth.getMonth() - 1,
                              1
                            )
                          );
                        }}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-chevron-left text-xs"></i>
                      </button>
                      <span className="text-xs font-bold text-slate-800">
                        {currentCalendarMonth.toLocaleDateString('id-ID', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentCalendarMonth(
                            new Date(
                              currentCalendarMonth.getFullYear(),
                              currentCalendarMonth.getMonth() + 1,
                              1
                            )
                          );
                        }}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-7 text-center mb-1">
                      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-slate-400">
                          {dayName}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {calendarDays.map((dateObj, idx) => {
                        if (!dateObj) return <div key={idx} className="h-8" />;
                        const isoStr = formatDateToISO(dateObj);
                        const isSelected = isoStr === formData.pickupDate;
                        const isPast =
                          dateObj <
                          new Date(
                            todayObj.getFullYear(),
                            todayObj.getMonth(),
                            todayObj.getDate()
                          );
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isPast}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, pickupDate: isoStr }));
                              setIsCalendarOpen(false);
                            }}
                            className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
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
                </div>
              </>
            )}
          </div>

          {/* WAKTU PENJEMPUTAN */}
          <div className="relative" ref={timePickerRef}>
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Waktu Penjemputan *
            </label>
            <div
              onClick={handleToggleTimePicker}
              className={`border rounded-xl p-2.5 sm:p-3 bg-white flex items-center justify-between cursor-pointer transition-all ${
                isTimePickerOpen
                  ? 'border-[#0194F3] ring-2 ring-sky-100'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <i className="fa-regular fa-clock text-[#0194F3] text-sm shrink-0"></i>
                <span
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    formData.pickupTime ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {formData.pickupTime || 'Pilih Waktu'}
                </span>
              </div>
              <i
                className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                  isTimePickerOpen ? 'rotate-180 text-[#0194F3]' : ''
                }`}
              ></i>
            </div>

            {/* MODAL PEMILIH WAKTU TERPUSAT DI MOBILE */}
            {isTimePickerOpen && (
              <>
                <div
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[70] sm:hidden"
                  onClick={() => setIsTimePickerOpen(false)}
                />
                <div className="fixed inset-0 sm:inset-auto sm:absolute sm:right-0 sm:left-auto sm:top-full sm:mt-2 z-[75] flex items-center justify-center sm:block p-4 sm:p-0 pointer-events-none sm:pointer-events-auto">
                  <div className="w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 pointer-events-auto">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <i className="fa-regular fa-clock text-[#0194F3]"></i> Pilih Jam
                      </span>
                      <span className="text-[11px] font-bold text-[#0194F3] bg-sky-50 px-2 py-0.5 rounded-md">
                        {selectedHour}:{selectedMinute}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 text-center uppercase">
                          Jam
                        </span>
                        <div className="h-36 overflow-y-auto border border-slate-200 rounded-xl p-1 bg-slate-50/50 space-y-1">
                          {hoursList.map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => setSelectedHour(h)}
                              className={`w-full py-1 rounded-lg text-xs font-bold text-center transition-colors ${
                                selectedHour === h
                                  ? 'bg-[#0194F3] text-white'
                                  : 'text-slate-700 hover:bg-sky-100'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 text-center uppercase">
                          Menit
                        </span>
                        <div className="h-36 border border-slate-200 rounded-xl p-1 bg-slate-50/50 space-y-1">
                          {minutesList.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setSelectedMinute(m)}
                              className={`w-full py-1.5 rounded-lg text-xs font-bold text-center transition-colors ${
                                selectedMinute === m
                                  ? 'bg-[#0194F3] text-white'
                                  : 'text-slate-700 hover:bg-sky-100'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsTimePickerOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyTime}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0194F3] text-white hover:bg-sky-600 transition-colors"
                      >
                        Pilih
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* DURASI RENTAL (HARI) - INPUT LANGSUNG */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Durasi Rental *
            </label>
            <div className="relative flex items-center">
              <i className="fa-solid fa-clock-rotate-left text-[#0194F3] text-xs absolute left-3.5"></i>
              <input
                type="number"
                min="1"
                max="30"
                placeholder="Contoh: 1"
                value={formData.duration ? parseInt(formData.duration) || '' : ''}
                onChange={handleDurationChange}
                className="w-full h-11 pl-9 pr-12 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                Hari
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM ESTIMATED PRICE & ACTION BANNER */}
        <div className="pt-4 mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border">
          <div className="text-left">
            <span className="block text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              Estimasi Tarif Terpilih
            </span>
            <strong className="text-base sm:text-xl font-extrabold text-[#0194F3]">
              {formData.price > 0
                ? `Rp ${new Intl.NumberFormat('id-ID').format(formData.price)}`
                : 'Pilih Mobil dari Daftar'}
            </strong>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {!formData.armada && (
              <button
                type="button"
                onClick={() => navigate('/mobil')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#0194F3] text-[#0194F3] hover:bg-sky-50 font-bold text-xs text-center cursor-pointer transition-colors"
              >
                Pilih Mobil
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0194F3] hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Lanjutkan Pemesanan</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormSewaMobil;
