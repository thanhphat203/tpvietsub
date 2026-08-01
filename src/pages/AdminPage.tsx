/**
 * @file src/pages/AdminPage.tsx
 * Admin Management Panel for TP VietSub Donghua
 * Allows adding, editing, deleting movies, managing watch links, and exporting data/movies.json
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllMovies,
  upsertMovie,
  deleteMovieById,
  resetMoviesToDefault,
  getAllAvailableGenres,
} from '../../lib/movies';
import { Movie, WatchLink, MoviePart } from '../types';
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  Copy,
  Download,
  RotateCcw,
  Check,
  Search,
  ExternalLink,
  Film,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  ShieldAlert,
  ArrowLeft,
  Lock,
  User,
  Key,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

const EMPTY_MOVIE: Movie = {
  id: '',
  slug: '',
  title: '',
  titleOriginal: '',
  poster: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=600&auto=format&fit=crop&q=80',
  backdrop: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=1200&auto=format&fit=crop&q=80',
  description: '',
  genres: ['Tu Tiên'],
  country: 'Trung Quốc',
  year: new Date().getFullYear(),
  status: 'Đang cập nhật',
  episodeInfo: 'Tập 1',
  rating: 9.0,
  views: 10000,
  updatedAt: new Date().toISOString().split('T')[0],
  isHot: true,
  isNew: true,
  watchLinks: [
    { platform: 'YouTube', url: 'https://youtube.com', quality: 'Full HD Vietsub' },
  ],
};

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('tp_admin_authed') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMovie, setActiveMovie] = useState<Movie>(EMPTY_MOVIE);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const availableGenres = getAllAvailableGenres();

  // Load movies on mount
  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    const list = getAllMovies();
    setMoviesList(list);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (usernameInput.trim() === 'admin' && passwordInput.trim() === 'tpvietsub003') {
      sessionStorage.setItem('tp_admin_authed', 'true');
      setIsAuthenticated(true);
    } else {
      setLoginError('Tài khoản hoặc Mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tp_admin_authed');
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Helper to generate slug from title
  const handleAutoSlug = () => {
    if (!activeMovie.title) return;
    const slug = activeMovie.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setActiveMovie({ ...activeMovie, slug });
  };

  const handleCreateNew = () => {
    const newId = `movie-${Date.now()}`;
    setActiveMovie({
      ...EMPTY_MOVIE,
      id: newId,
      slug: `phim-moi-${Date.now().toString().slice(-4)}`,
    });
    setIsEditing(false);
  };

  const handleSelectMovie = (movie: Movie) => {
    setActiveMovie({ ...movie });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMovie.title.trim()) {
      showNotification('Vui lòng nhập tên phim!', 'error');
      return;
    }

    let finalSlug = activeMovie.slug.trim();
    if (!finalSlug) {
      finalSlug = activeMovie.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-');
    }

    const movieToSave: Movie = {
      ...activeMovie,
      slug: finalSlug,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    upsertMovie(movieToSave);
    refreshList();
    showNotification(`Đã lưu thành công phim "${movieToSave.title}"! Web đã tự động cập nhật.`);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phim "${title}"?`)) {
      deleteMovieById(id);
      refreshList();
      if (activeMovie.id === id) {
        handleCreateNew();
      }
      showNotification(`Đã xóa phim "${title}"!`);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Khôi phục dữ liệu về mặc định ban đầu từ data/movies.json? Mọi chỉnh sửa chưa xuất JSON sẽ bị hủy.')) {
      resetMoviesToDefault();
      refreshList();
      handleCreateNew();
      showNotification('Đã khôi phục dữ liệu gốc từ movies.json!');
    }
  };

  const handleCopyJSON = () => {
    const fullJson = JSON.stringify(moviesList, null, 2);
    navigator.clipboard.writeText(fullJson);
    setCopied(true);
    showNotification('Đã sao chép mã JSON! Hãy dán đè vào file /data/movies.json trong dự án của bạn.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadJSON = () => {
    const fullJson = JSON.stringify(moviesList, null, 2);
    const blob = new Blob([fullJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Đã tải file movies.json về máy!');
  };

  // Genre toggle
  const toggleGenre = (genre: string) => {
    const current = activeMovie.genres || [];
    if (current.includes(genre)) {
      if (current.length === 1) return; // keep at least 1
      setActiveMovie({
        ...activeMovie,
        genres: current.filter((g) => g !== genre),
      });
    } else {
      setActiveMovie({
        ...activeMovie,
        genres: [...current, genre],
      });
    }
  };

  // Watch link handlers
  const handleWatchLinkChange = (index: number, field: keyof WatchLink, value: string) => {
    const updatedLinks = [...activeMovie.watchLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setActiveMovie({ ...activeMovie, watchLinks: updatedLinks });
  };

  const handleAddWatchLink = () => {
    setActiveMovie({
      ...activeMovie,
      watchLinks: [
        ...activeMovie.watchLinks,
        { platform: 'YouTube', url: 'https://youtube.com', quality: 'Full HD Vietsub' },
      ],
    });
  };

  const handleRemoveWatchLink = (index: number) => {
    if (activeMovie.watchLinks.length === 1) {
      showNotification('Phim cần ít nhất 1 link xem!', 'error');
      return;
    }
    const updatedLinks = activeMovie.watchLinks.filter((_, i) => i !== index);
    setActiveMovie({ ...activeMovie, watchLinks: updatedLinks });
  };

  // Multi-part handlers (Phần 1, Phần 2, Phần 3, Phần 4...)
  const handleAddPart = () => {
    const currentParts = activeMovie.parts || [];
    const partNum = currentParts.length + 1;
    const newPart: MoviePart = {
      id: `part-${partNum}-${Date.now()}`,
      partName: `Phần ${partNum}`,
      episodeInfo: `Tập 1 - 24`,
      watchLinks: [
        { platform: 'YouTube', url: 'https://youtube.com', quality: 'Full HD Vietsub' },
      ],
    };
    setActiveMovie({
      ...activeMovie,
      parts: [...currentParts, newPart],
    });
    showNotification(`Đã thêm Phần ${partNum}!`);
  };

  const handleRemovePart = (partIdx: number) => {
    if (!activeMovie.parts) return;
    const updated = activeMovie.parts.filter((_, i) => i !== partIdx);
    setActiveMovie({ ...activeMovie, parts: updated });
    showNotification('Đã xóa phần phim!');
  };

  const handlePartChange = (partIdx: number, field: keyof MoviePart, value: string) => {
    if (!activeMovie.parts) return;
    const updated = [...activeMovie.parts];
    updated[partIdx] = { ...updated[partIdx], [field]: value };
    setActiveMovie({ ...activeMovie, parts: updated });
  };

  const handleAddPartWatchLink = (partIdx: number) => {
    if (!activeMovie.parts) return;
    const updatedParts = [...activeMovie.parts];
    const targetPart = updatedParts[partIdx];
    const updatedLinks = [
      ...targetPart.watchLinks,
      { platform: 'YouTube', url: 'https://youtube.com', quality: 'Full HD Vietsub' },
    ];
    updatedParts[partIdx] = { ...targetPart, watchLinks: updatedLinks };
    setActiveMovie({ ...activeMovie, parts: updatedParts });
  };

  const handlePartWatchLinkChange = (partIdx: number, linkIdx: number, field: keyof WatchLink, value: string) => {
    if (!activeMovie.parts) return;
    const updatedParts = [...activeMovie.parts];
    const targetPart = updatedParts[partIdx];
    const updatedLinks = [...targetPart.watchLinks];
    updatedLinks[linkIdx] = { ...updatedLinks[linkIdx], [field]: value };
    updatedParts[partIdx] = { ...targetPart, watchLinks: updatedLinks };
    setActiveMovie({ ...activeMovie, parts: updatedParts });
  };

  const handleRemovePartWatchLink = (partIdx: number, linkIdx: number) => {
    if (!activeMovie.parts) return;
    const updatedParts = [...activeMovie.parts];
    const targetPart = updatedParts[partIdx];
    if (targetPart.watchLinks.length === 1) {
      showNotification('Mỗi phần cần ít nhất 1 link xem!', 'error');
      return;
    }
    const updatedLinks = targetPart.watchLinks.filter((_, i) => i !== linkIdx);
    updatedParts[partIdx] = { ...targetPart, watchLinks: updatedLinks };
    setActiveMovie({ ...activeMovie, parts: updatedParts });
  };

  const handleQuickCreateParts = () => {
    const defaultParts: MoviePart[] = [
      {
        id: 'p1',
        partName: 'Phần 1',
        episodeInfo: 'Full 52 Tập',
        watchLinks: activeMovie.watchLinks.length > 0 ? activeMovie.watchLinks : [{ platform: 'YouTube', url: 'https://youtube.com', quality: 'Full HD Vietsub' }]
      },
      {
        id: 'p2',
        partName: 'Phần 2',
        episodeInfo: 'Full 52 Tập',
        watchLinks: [{ platform: 'Bilibili', url: 'https://bilibili.tv', quality: '4K Vietsub' }]
      },
      {
        id: 'p3',
        partName: 'Phần 3',
        episodeInfo: 'Full 26 Tập',
        watchLinks: [{ platform: 'iQiyi', url: 'https://iq.com', quality: 'Full HD Thuyết Minh' }]
      },
      {
        id: 'p4',
        partName: 'Phần 4 (Mới Nhất)',
        episodeInfo: 'Đang phát sóng',
        watchLinks: [{ platform: 'Tencent Video', url: 'https://v.qq.com', quality: '4K HDR' }]
      }
    ];
    setActiveMovie({ ...activeMovie, parts: defaultParts });
    showNotification('Đã tự động tạo 4 Phần (Phần 1 - 4) cho bộ phim này!');
  };

  const handleClearParts = () => {
    if (window.confirm('Chuyển về phim 1 Phần duy nhất (xóa danh sách các Phần)?')) {
      setActiveMovie({ ...activeMovie, parts: undefined });
      showNotification('Đã chuyển về phim 1 phần chuẩn.');
    }
  };

  const filteredMovies = moviesList.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#14141d] border border-[#262638] rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          
          {/* Header Badge */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-red-950/80">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                ĐĂNG NHẬP QUẢN TRỊ
              </h2>
              <p className="text-xs text-red-400 font-bold mt-1 bg-red-950/60 border border-red-900/50 inline-block px-3 py-1 rounded-full">
                TP VIETSUB DONGHUA
              </p>
            </div>
          </div>

          {/* Login Error Notification */}
          {loginError && (
            <div className="bg-red-950/80 border border-red-500/80 text-red-200 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Tài Khoản Quản Trị
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Nhập tài khoản admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs font-mono text-white pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                />
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Mật Khẩu Mật
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs font-mono text-white pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                />
                <Key className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-red-950/60 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              ĐĂNG NHẬP VÀO HỆ THỐNG
            </button>

          </form>

          {/* Back to website link */}
          <div className="text-center pt-2 border-t border-[#222232]">
            <Link to="/" className="text-xs text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay về Trang Chủ Web
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-gray-100 pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
            notification.type === 'error'
              ? 'bg-red-950/90 border-red-500 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
          }`}
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="bg-[#14141d] border-b border-[#222232] sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-950/60">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-white leading-tight flex items-center gap-2">
                  TRUNG TÂM QUẢN TRỊ PHIM <span className="text-xs bg-red-600 text-white font-mono px-2 py-0.5 rounded-full">TP VIETSUB</span>
                </h1>
                <p className="text-[10px] text-gray-400 font-medium">Thêm phim, cập nhật link xem & xuất file JSON trực tiếp</p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="inline-flex items-center gap-1.5 bg-[#20202e] hover:bg-[#2b2b3e] text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/10 transition-colors"
              title="Sao chép toàn bộ JSON để dán vào file data/movies.json"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
              <span className="hidden sm:inline">{copied ? 'Đã chép!' : 'Sao Chép JSON'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-red-950/50 transition-colors"
              title="Tải về file movies.json"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải File JSON</span>
            </button>

            <button
              onClick={handleResetDefault}
              className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-950/30 rounded-xl transition-colors border border-transparent hover:border-amber-800/40"
              title="Khôi phục dữ liệu mặc định từ file gốc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-red-950 text-gray-300 hover:text-red-300 text-xs font-bold px-3 py-2 rounded-xl border border-gray-700 hover:border-red-800 transition-colors ml-1"
              title="Đăng xuất khỏi trang quản trị"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* User Guide Banner */}
        <div className="bg-[#181824] border border-[#2d2d42] rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">HƯỚNG DẪN CẬP NHẬT TRÊN WEB VÀ CODE FILE</h3>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                • <strong>Cập nhật tức thì:</strong> Nhấn nút <strong>"Lưu Phim Ngay"</strong> bên dưới, phim sẽ xuất hiện trên giao diện trang web ngay lập tức.<br />
                • <strong>Lưu vĩnh viễn vào Code:</strong> Nhấn <strong>"Sao Chép JSON"</strong> hoặc <strong>"Tải File JSON"</strong>, sau đó dán đè vào thư mục <code className="text-red-400 font-mono bg-black/50 px-1 py-0.5 rounded">/data/movies.json</code> của dự án.
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-950/50 hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" />
            THÊM PHIM MỚI
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Movies List & Search (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-[#14141d] p-4 rounded-2xl border border-[#222232] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-red-500" />
                  Danh Sách Phim ({filteredMovies.length})
                </span>
                <button
                  onClick={handleCreateNew}
                  className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo mới
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm phim theo tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-gray-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-red-500/50"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              </div>

              {/* Movies Scroll List */}
              <div className="max-h-[650px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredMovies.map((m) => {
                  const isSelected = activeMovie.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMovie(m)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isSelected
                          ? 'bg-[#25151c] border-red-500/80 shadow-md shadow-red-950/30'
                          : 'bg-[#1b1b26] border-[#262638] hover:border-gray-700 hover:bg-[#202030]'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg shrink-0 border border-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=150';
                          }}
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-gray-100 truncate group-hover:text-red-400 transition-colors">
                            {m.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 truncate font-mono mt-0.5">
                            {m.episodeInfo} • {m.genres[0] || 'Donghua'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {m.isHot && (
                              <span className="text-[9px] font-black text-red-400 bg-red-950/60 border border-red-900/50 px-1 rounded">
                                HOT
                              </span>
                            )}
                            <span className="text-[9px] text-gray-400">
                              {m.watchLinks.length} link xem
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id, m.title);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Xóa phim này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: Movie Edit Form (8 Cols) */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSave} className="bg-[#14141d] p-6 rounded-2xl border border-[#222232] space-y-6 shadow-xl">
              
              {/* Form Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#222232]">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-red-500" />
                    {isEditing ? `CHỈNH SỬA: ${activeMovie.title}` : 'THÊM PHIM DONGHUA MỚI'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Mã ID: <span className="font-mono text-gray-300">{activeMovie.id || 'Mới'}</span></p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#e50914] hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-950/60 transition-all hover:scale-105"
                  >
                    <Save className="w-4 h-4" />
                    LƯU PHIM NGAY
                  </button>
                </div>
              </div>

              {/* Grid Inputs: Title & Slug & Original Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Tên Phim (Tiếng Việt) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Võ Luyện Đỉnh Phong"
                    value={activeMovie.title}
                    onChange={(e) => setActiveMovie({ ...activeMovie, title: e.target.value })}
                    className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Original Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Tên Gốc / Tên Trung Quốc
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 武炼巅峰"
                    value={activeMovie.titleOriginal || ''}
                    onChange={(e) => setActiveMovie({ ...activeMovie, titleOriginal: e.target.value })}
                    className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Slug URL */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-300">
                      Đường Dẫn URL (Slug) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoSlug}
                      className="text-[11px] text-sky-400 hover:underline font-medium"
                    >
                      ⚡ Tự động tạo slug từ tên phim
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 bg-[#12121a] px-3 py-2.5 rounded-xl border border-[#222232] shrink-0">
                      /phim/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="vo-luyen-dinh-phong"
                      value={activeMovie.slug}
                      onChange={(e) => setActiveMovie({ ...activeMovie, slug: e.target.value })}
                      className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs font-mono text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

              </div>

              {/* Posters & Backdrop Images Section */}
              <div className="p-4 rounded-xl bg-[#181824] border border-[#28283a] space-y-4">
                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  Hình Ảnh Poster & Backdrop Banner
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Poster Link */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Link Ảnh Poster Vertical (Tỉ lệ 2:3)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={activeMovie.poster}
                      onChange={(e) => setActiveMovie({ ...activeMovie, poster: e.target.value })}
                      className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-red-500 mb-2"
                    />
                    {/* Live Preview */}
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
                      <img
                        src={activeMovie.poster}
                        alt="Poster Preview"
                        className="w-12 h-16 object-cover rounded-lg border border-white/10"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=150'; }}
                      />
                      <span className="text-[11px] text-gray-400 italic">Preview ảnh poster</span>
                    </div>
                  </div>

                  {/* Backdrop Link */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Link Ảnh Banner Nằm Ngang (Backdrop)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={activeMovie.backdrop}
                      onChange={(e) => setActiveMovie({ ...activeMovie, backdrop: e.target.value })}
                      className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-red-500 mb-2"
                    />
                    {/* Live Preview */}
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
                      <img
                        src={activeMovie.backdrop}
                        alt="Backdrop Preview"
                        className="w-24 h-16 object-cover rounded-lg border border-white/10"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=300'; }}
                      />
                      <span className="text-[11px] text-gray-400 italic">Preview ảnh banner</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status, Episode, Year, Rating Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Episode Info */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Tập Phim / Tiến Độ</label>
                  <input
                    type="text"
                    placeholder="VD: Tập 95 / Full 24 Tập"
                    value={activeMovie.episodeInfo}
                    onChange={(e) => setActiveMovie({ ...activeMovie, episodeInfo: e.target.value })}
                    className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Trạng Thái</label>
                  <select
                    value={activeMovie.status}
                    onChange={(e) => setActiveMovie({ ...activeMovie, status: e.target.value })}
                    className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-red-500"
                  >
                    <option value="Đang cập nhật">Đang cập nhật</option>
                    <option value="Hoàn thành">Hoàn thành (Full)</option>
                    <option value="Sắp chiếu">Sắp chiếu</option>
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Đánh Giá (1 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={activeMovie.rating}
                    onChange={(e) => setActiveMovie({ ...activeMovie, rating: parseFloat(e.target.value) || 9.0 })}
                    className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Năm Phát Hành</label>
                  <input
                    type="number"
                    value={activeMovie.year}
                    onChange={(e) => setActiveMovie({ ...activeMovie, year: parseInt(e.target.value) || 2026 })}
                    className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>

              </div>

              {/* Toggles (isHot, isNew) */}
              <div className="flex items-center gap-6 p-3 rounded-xl bg-[#181824] border border-[#28283a]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-200">
                  <input
                    type="checkbox"
                    checked={activeMovie.isHot || false}
                    onChange={(e) => setActiveMovie({ ...activeMovie, isHot: e.target.checked })}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  🔥 Gắn Nhãn Phim HOT
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-200">
                  <input
                    type="checkbox"
                    checked={activeMovie.isNew || false}
                    onChange={(e) => setActiveMovie({ ...activeMovie, isNew: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  ✨ Gắn Nhãn Phim MỚI
                </label>
              </div>

              {/* Genres Multi Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  Chọn Thể Loại Phim (Bấm để chọn / bỏ chọn):
                </label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 rounded-xl bg-[#181824] border border-[#28283a]">
                  {availableGenres.map((g) => {
                    const isSelected = activeMovie.genres.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => toggleGenre(g)}
                        className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all border ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/40'
                            : 'bg-[#12121a] text-gray-400 border-gray-800 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Nội Dung Tóm Tắt Phim
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung mô tả cốt truyện phim..."
                  value={activeMovie.description}
                  onChange={(e) => setActiveMovie({ ...activeMovie, description: e.target.value })}
                  className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>

              {/* ⭐ MULTI-PART / SEASONS MANAGEMENT (Phần 1, Phần 2, Phần 3, Phần 4...) */}
              <div className="p-4 rounded-xl bg-[#181824] border-2 border-amber-500/40 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#28283a] pb-3 gap-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Cấu Hình Phim Nhiều Phần (Phần 1 - 2 - 3 - 4...)
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Dành cho bộ phim có nhiều Phần/Mùa như web cogiday.xyz. Bấm để tạo nút chọn Phần 1, 2, 3, 4 trên giao diện.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(!activeMovie.parts || activeMovie.parts.length === 0) ? (
                      <button
                        type="button"
                        onClick={handleQuickCreateParts}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg border border-white/10 shadow transition-all hover:scale-105"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Tạo Nhanh 4 Phần
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleClearParts}
                        className="inline-flex items-center gap-1 bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-800 transition-colors"
                      >
                        Xóa Các Phần (Chuyển về Phim 1 Phần)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="inline-flex items-center gap-1 bg-[#28283a] hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm 1 Phần
                    </button>
                  </div>
                </div>

                {activeMovie.parts && activeMovie.parts.length > 0 ? (
                  <div className="space-y-4">
                    {activeMovie.parts.map((part, pIdx) => (
                      <div
                        key={part.id || pIdx}
                        className="p-4 rounded-xl bg-[#12121a] border border-[#2d2d42] space-y-3"
                      >
                        {/* Part Header Inputs */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#242436]">
                          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <span className="text-xs font-black text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-1 rounded">
                              #{pIdx + 1}
                            </span>
                            <input
                              type="text"
                              required
                              placeholder="Tên Phần (VD: Phần 1, Phần 2...)"
                              value={part.partName}
                              onChange={(e) => handlePartChange(pIdx, 'partName', e.target.value)}
                              className="bg-[#1b1b28] border border-[#33334d] text-xs font-extrabold text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 flex-1"
                            />
                            <input
                              type="text"
                              placeholder="Tiến độ (VD: Full 52 Tập)"
                              value={part.episodeInfo || ''}
                              onChange={(e) => handlePartChange(pIdx, 'episodeInfo', e.target.value)}
                              className="bg-[#1b1b28] border border-[#33334d] text-xs text-gray-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 w-36"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddPartWatchLink(pIdx)}
                              className="text-[11px] bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold px-2.5 py-1 rounded-md border border-emerald-800 transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Thêm Link Cho {part.partName}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePart(pIdx)}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                              title="Xóa phần này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Part Watch Links List */}
                        <div className="space-y-2 pt-1">
                          {part.watchLinks.map((link, lIdx) => (
                            <div
                              key={lIdx}
                              className="p-2.5 rounded-lg bg-[#181824] border border-[#252536] grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                            >
                              <div className="md:col-span-3">
                                <select
                                  value={link.platform}
                                  onChange={(e) => handlePartWatchLinkChange(pIdx, lIdx, 'platform', e.target.value)}
                                  className="w-full bg-[#111118] border border-[#2d2d42] text-xs text-white px-2 py-1.5 rounded focus:outline-none focus:border-amber-500"
                                >
                                  <option value="YouTube">YouTube</option>
                                  <option value="Bilibili">Bilibili</option>
                                  <option value="iQiyi">iQiyi</option>
                                  <option value="Tencent Video">Tencent Video</option>
                                  <option value="Netflix">Netflix</option>
                                  <option value="Khác / Web Phim">Khác / Web Phim</option>
                                </select>
                              </div>

                              <div className="md:col-span-5">
                                <input
                                  type="url"
                                  required
                                  placeholder="Đường link xem video..."
                                  value={link.url}
                                  onChange={(e) => handlePartWatchLinkChange(pIdx, lIdx, 'url', e.target.value)}
                                  className="w-full bg-[#111118] border border-[#2d2d42] text-xs font-mono text-white px-2 py-1.5 rounded focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div className="md:col-span-3">
                                <input
                                  type="text"
                                  placeholder="Full HD Vietsub"
                                  value={link.quality}
                                  onChange={(e) => handlePartWatchLinkChange(pIdx, lIdx, 'quality', e.target.value)}
                                  className="w-full bg-[#111118] border border-[#2d2d42] text-xs text-white px-2 py-1.5 rounded focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div className="md:col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemovePartWatchLink(pIdx, lIdx)}
                                  className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                                  title="Xóa link xem"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-gray-400 italic bg-[#12121a] rounded-xl border border-[#222232]">
                    Chưa kích hoạt phim nhiều phần. Bộ phim hiện tại dùng 1 danh sách link xem duy nhất bên dưới. Bấm nút <strong>"Tạo Nhanh 4 Phần"</strong> hoặc <strong>"Thêm 1 Phần"</strong> để chuyển sang cấu hình dạng Phần 1 - 2 - 3 - 4.
                  </div>
                )}
              </div>

              {/* ⭐ WATCH LINKS SECTION (Crucial Section for Single-Part Mode) */}
              <div className="p-4 rounded-xl bg-[#181824] border-2 border-red-600/30 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#28283a] pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4" />
                      Link Xem Chung (Dành cho Phim 1 Phần / Mặc Định)
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Thêm đường link YouTube, Bilibili, iQiyi, Tencent... cho chế độ phim 1 phần.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWatchLink}
                    className="inline-flex items-center gap-1 bg-[#28283a] hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Link Xem
                  </button>
                </div>

                <div className="space-y-3">
                  {activeMovie.watchLinks.map((link, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#12121a] border border-[#28283a] grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      
                      {/* Platform */}
                      <div className="md:col-span-3">
                        <label className="block text-[10px] text-gray-400 mb-1">Nền Tảng / Kênh</label>
                        <select
                          value={link.platform}
                          onChange={(e) => handleWatchLinkChange(idx, 'platform', e.target.value)}
                          className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-red-500"
                        >
                          <option value="YouTube">YouTube</option>
                          <option value="Bilibili">Bilibili</option>
                          <option value="iQiyi">iQiyi</option>
                          <option value="Tencent Video">Tencent Video</option>
                          <option value="Netflix">Netflix</option>
                          <option value="Khác / Web Phim">Khác / Web Phim</option>
                        </select>
                      </div>

                      {/* URL Stream Link */}
                      <div className="md:col-span-5">
                        <label className="block text-[10px] text-gray-400 mb-1">Đường Link Video (URL)</label>
                        <input
                          type="url"
                          required
                          placeholder="https://youtube.com/watch?v=..."
                          value={link.url}
                          onChange={(e) => handleWatchLinkChange(idx, 'url', e.target.value)}
                          className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs font-mono text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-red-500"
                        />
                      </div>

                      {/* Quality Tag */}
                      <div className="md:col-span-3">
                        <label className="block text-[10px] text-gray-400 mb-1">Chất Lượng / Bản Dịch</label>
                        <input
                          type="text"
                          placeholder="Full HD Vietsub"
                          value={link.quality}
                          onChange={(e) => handleWatchLinkChange(idx, 'quality', e.target.value)}
                          className="w-full bg-[#1b1b28] border border-[#2d2d42] text-xs text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-red-500"
                        />
                      </div>

                      {/* Delete link button */}
                      <div className="md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveWatchLink(idx)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Xóa link này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Form Bottom Save Bar */}
              <div className="pt-4 border-t border-[#222232] flex items-center justify-between">
                <a
                  href={`#/phim/${activeMovie.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline font-medium"
                >
                  <ExternalLink className="w-4 h-4" /> Xem trang phim trong tab mới
                </a>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#e50914] hover:bg-red-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-950/60 transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  LƯU PHIM NGAY
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
