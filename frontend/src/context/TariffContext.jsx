import React, { createContext, useContext, useState } from 'react';

const TariffContext = createContext();

export const TariffProvider = ({ children }) => {
  // Menyimpan posisi jumlah data yang sudah dimuat agar tidak ter-reset saat pindah page
  const [visibleCount, setVisibleCount] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <TariffContext.Provider
      value={{
        visibleCount,
        setVisibleCount,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </TariffContext.Provider>
  );
};

export const useTariff = () => useContext(TariffContext);
