/**
 * @file src/App.tsx
 * Primary application router container for TP VietSub Donghua
 */

import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage').then(m => ({ default: m.MovieDetailPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const WeeklySchedulePage = lazy(() => import('./pages/WeeklySchedulePage').then(m => ({ default: m.WeeklySchedulePage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const BookmarksHistoryPage = lazy(() => import('./pages/BookmarksHistoryPage').then(m => ({ default: m.BookmarksHistoryPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

import { CatalogPage } from './pages/CatalogPage';
import { TVNavigation } from './components/TVNavigation';

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
      <ScrollToTop /><TVNavigation />
      {!isAdmin && <Header />}
      <main className="flex-grow">
        <Suspense fallback={<div role="status" className="catalog-shell">Đang tải trang…</div>}><Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/phim/:slug" element={<MovieDetailPage />} />
          <Route path="/kham-pha" element={<CatalogPage />} />
          <Route path="/phim-bo" element={<CatalogPage type="series" />} />
          <Route path="/phim-le" element={<CatalogPage type="single" />} />
          <Route path="/lich-chieu" element={<WeeklySchedulePage />} />
          <Route path="/bang-xep-hang" element={<LeaderboardPage />} />
          <Route path="/lich-su" element={<BookmarksHistoryPage />} />
          <Route path="/the-loai/:genre" element={<CatalogPage />} />
          <Route path="/tim-kiem" element={<SearchPage />} />
          <Route path="/admintpvietsubdeptrai03" element={<AdminPage />} />
          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes></Suspense>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  // Use HashRouter if on GitHub Pages subpath to avoid 404s on refresh
  const isGitHubPages =
    typeof window !== 'undefined' && window.location.hostname.includes('github.io');

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
