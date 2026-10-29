/**
 * @file src/services/storage.ts
 * LocalStorage management for Watch History, Bookmarks, and Watched Episodes
 */

import { Movie, WatchHistoryItem } from '../types';

const HISTORY_KEY = 'tp_donghua_watch_history_v2';
const BOOKMARKS_KEY = 'tp_donghua_bookmarks_v2';
let bookmarkCache: Movie[] | undefined;
if (typeof window !== 'undefined') window.addEventListener('storage', () => { bookmarkCache = undefined; window.dispatchEvent(new Event('tp_storage_updated')); });

export function getWatchHistory(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading watch history', e);
    return [];
  }
}

export function saveWatchProgress(item: Omit<WatchHistoryItem, 'updatedAt'>): void {
  try {
    const list = getWatchHistory();
    const filtered = list.filter((h) => h.slug !== item.slug);
    const updated: WatchHistoryItem[] = [
      {
        ...item,
        updatedAt: Date.now(),
      },
      ...filtered,
    ].slice(0, 30); // Keep last 30 movies

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('tp_storage_updated'));
  } catch (e) {
    console.error('Error saving watch history', e);
  }
}

export function clearWatchHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('tp_storage_updated'));
  } catch (e) {
    console.error('Error clearing watch history', e);
  }
}

export function getBookmarks(): Movie[] {
  if (bookmarkCache) return bookmarkCache;
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    const value = raw ? JSON.parse(raw) : [];
    bookmarkCache = Array.isArray(value) ? value : [];
    return bookmarkCache;
  } catch (e) {
    console.error('Error reading bookmarks', e);
    return [];
  }
}

export function isBookmarked(slug: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => b.slug === slug);
}

export function toggleBookmark(movie: Movie): boolean {
  try {
    const bookmarks = getBookmarks();
    const exists = bookmarks.some((b) => b.slug === movie.slug);
    let updated: Movie[];
    if (exists) {
      updated = bookmarks.filter((b) => b.slug !== movie.slug);
    } else {
      updated = [movie, ...bookmarks];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    bookmarkCache = updated;
    window.dispatchEvent(new Event('tp_storage_updated'));
    return !exists;
  } catch (e) {
    console.error('Error toggling bookmark', e);
    return false;
  }
}

export function getWatchedEpisodes(slug: string): string[] {
  try {
    const raw = localStorage.getItem(`tp_watched_eps_${slug}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function markEpisodeWatched(slug: string, episode: string): void {
  try {
    const list = getWatchedEpisodes(slug);
    if (!list.includes(episode)) {
      list.push(episode);
      localStorage.setItem(`tp_watched_eps_${slug}`, JSON.stringify(list));
      window.dispatchEvent(new Event('tp_storage_updated'));
    }
  } catch (e) {
    console.error('Error marking episode watched', e);
  }
}
