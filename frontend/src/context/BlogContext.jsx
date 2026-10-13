import React, { createContext, useContext, useState } from 'react';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  // State terpusat agar posisi scroll / paginasi blog tidak ter-reset saat pindah halaman
  const [visibleCount, setVisibleCount] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <BlogContext.Provider
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
    </BlogContext.Provider>
  );
};

// Custom hook agar mudah dipanggil di komponen mana saja
export const useBlog = () => useContext(BlogContext);
