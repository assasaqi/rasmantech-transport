import React from 'react';

const ModalSummary = ({ formData, onClose, onConfirm }) => {
  if (!formData) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col transform transition-all duration-200 ease-out scale-100">

        {/* Header Modal */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-file-invoice text-sky-600"></i>
            Ringkasan Pemesanan
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-slate-400 hover:text-slate-600 p-1 text-xl leading-none transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Daftar Detail Rincian */}
        <div className="flex flex-col gap-2 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 mb-4">
          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700">
            <span className="text-slate-500 font-medium">Nama Pemesan:</span>
            <span className="font-semibold text-right max-w-[60%] break-words">{formData.custName || '-'}</span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700">
            <span className="text-slate-500 font-medium">No. WhatsApp:</span>
            <span className="font-semibold text-right max-w-[60%] break-words">{formData.custWa || '-'}</span>
          </div>

          {formData.jenisLayanan && (
            <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700">
              <span className="text-slate-500 font-medium">Layanan:</span>
              <span className="font-semibold text-right max-w-[60%] break-words">{formData.jenisLayanan}</span>
            </div>
          )}

          {formData.armada && (
            <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700">
              <span className="text-slate-500 font-medium">Armada / Mobil:</span>
              <span className="font-semibold text-right max-w-[60%] break-words">{formData.armada}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700">
            <span className="text-slate-500 font-medium">Jadwal Penjemputan:</span>
            <span className="font-semibold text-right max-w-[60%] break-words">
              {formData.pickupDate || '-'} {formData.pickupTime ? `(${formData.pickupTime} WITA)` : ''}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700">
            <span className="text-slate-500 font-medium">Lokasi Jemput:</span>
            <span className="font-semibold text-right max-w-[60%] break-words">{formData.pickupLoc || '-'}</span>
          </div>

          {formData.dropLoc && (
            <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700">
              <span className="text-slate-500 font-medium">Lokasi Tujuan:</span>
              <span className="font-semibold text-right max-w-[60%] break-words">{formData.dropLoc}</span>
            </div>
          )}

          {/* Estimasi Tarif */}
          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700 mt-1 pt-2.5 border-t border-dashed border-slate-300">
            <span className="text-slate-500 font-medium">Estimasi Tarif:</span>
            <span className="text-sky-600 text-base sm:text-lg font-extrabold text-right">
              Rp {new Intl.NumberFormat('id-ID').format(formData.price || 0)}
            </span>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-white border border-slate-300 text-slate-600 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Ubah Data
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-[1.2] py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-base"></i> Kirim ke WA
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalSummary;
