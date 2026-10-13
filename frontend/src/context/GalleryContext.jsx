import React, { createContext, useContext, useState } from 'react';

const GalleryContext = createContext();

export const GalleryProvider = ({ children }) => {
  const [visibleCount, setVisibleCount] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <GalleryContext.Provider
      value={{ visibleCount, setVisibleCount, activeCategory, setActiveCategory }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => useContext(GalleryContext);
