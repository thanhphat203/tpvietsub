/**
 * @file src/App.tsx
 * Primary application router container for Lù Phim Donghua
 */

import React, { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { GenrePage } from './pages/GenrePage';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';

// Scroll to top automatically on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Router Container supporting both standard routes & GitHub Pages hash routing
function AppContent() {
  const { pathname } = useLocation();
  const isAdmin = pathname.includes('admintpvietsubdeptrai03');

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f14] font-sans antialiased text-gray-100 selection:bg-[#e50914] selection:text-white">
      <ScrollToTop />
      {!isAdmin && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/phim/:slug" element={<MovieDetailPage />} />
          <Route path="/the-loai/:genre" element={<GenrePage />} />
          <Route path="/tim-kiem" element={<SearchPage />} />
          <Route path="/admintpvietsubdeptrai03" element={<AdminPage />} />
          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  // Use HashRouter if on GitHub Pages subpath to avoid 404s on refresh
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    return (
      <HashRouter>
        <AppContent />
      </HashRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
