import React, { createContext, useContext, useState } from 'react';

const HomeContext = createContext();

export const HomeProvider = ({ children }) => {
  const [visibleCount, setVisibleCount] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <HomeContext.Provider
      value={{
        visibleCount,
        setVisibleCount,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => useContext(HomeContext);
