import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { router } from './app/router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
