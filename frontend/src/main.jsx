import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { TariffProvider } from '@/context/TariffContext';
import { BlogProvider } from '@/context/BlogContext';
import { GalleryProvider } from '@/context/GalleryContext';
import { HomeProvider } from '@/context/HomeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider> {/* 2. Bungkus di sini */}
        <NotificationProvider>
          <AuthProvider>
            <TariffProvider>
              <BlogProvider>
                <GalleryProvider>
                  <HomeProvider>
                    <App />
                  </HomeProvider>
                </GalleryProvider>
              </BlogProvider>
            </TariffProvider>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
