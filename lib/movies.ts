/**
 * @file lib/movies.ts
 * Helper utilities for accessing, filtering, and managing Donghua movies
 * Integrates real API data with local cached data and storage.
 */

import { Movie, ALL_GENRES } from '../src/types';
import { getStaticMovies, fetchLatestUpdates, fetchAggregatedMovies } from '../src/services/api';

const STORAGE_KEY = 'tp_vietsub_movies_data_v2';

let inMemoryMovies: Movie[] = getStaticMovies();

// Initialize and sync background updates
export async function initializeMovies(): Promise<Movie[]> {
  try {
    const apiMovies = await fetchAggregatedMovies(3);
    if (apiMovies && apiMovies.length > 0) {
      inMemoryMovies = apiMovies;
      window.dispatchEvent(new Event('tp_movies_updated'));
      return apiMovies;
    }
  } catch (err) {
    console.error('Failed to initialize movies from API', err);
  }
  return inMemoryMovies;
}

// Automatically start background sync
if (typeof window !== 'undefined') {
  initializeMovies();
}

/**
 * Helper to get currently active movies array
 */
export function getAllMovies(): Movie[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load movies from localStorage', err);
  }
  return inMemoryMovies;
}

/**
 * Save updated movies array to localStorage and emit custom update event
 */
export function saveMoviesList(updatedList: Movie[]): void {
  try {
    inMemoryMovies = updatedList;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList, null, 2));
    window.dispatchEvent(new Event('tp_movies_updated'));
  } catch (err) {
    console.error('Failed to save movies to localStorage', err);
  }
}

/**
 * Reset stored movies back to default
 */
export function resetMoviesToDefault(): Movie[] {
  localStorage.removeItem(STORAGE_KEY);
  inMemoryMovies = getStaticMovies();
  window.dispatchEvent(new Event('tp_movies_updated'));
  return inMemoryMovies;
}

/**
 * Get a single movie by its slug
 */
export function getMovieBySlug(slug: string): Movie | undefined {
  if (!slug) return undefined;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  return getAllMovies().find((m) => m.slug?.toLowerCase() === decodedSlug);
}

/**
 * Get all movies belonging to a specific genre
 */
export function getMoviesByGenre(genre: string): Movie[] {
  if (!genre) return [];
  const target = decodeURIComponent(genre).toLowerCase().trim();
  return getAllMovies().filter((m) =>
    m.genres.some((g) => g.toLowerCase().trim() === target || target.includes(g.toLowerCase()))
  );
}

/**
 * Get Top X most viewed movies
 */
export function getTopViewed(limit = 10): Movie[] {
  return [...getAllMovies()]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

/**
 * Get movies marked as Hot (isHot === true or high views)
 */
export function getHotMovies(limit = 10): Movie[] {
  const hot = getAllMovies().filter((m) => m.isHot || m.views > 700000);
  return hot.length > 0 ? hot.slice(0, limit) : getAllMovies().slice(0, limit);
}

/**
 * Get movies marked as New
 */
export function getNewMovies(limit = 12): Movie[] {
  return [...getAllMovies()]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

/**
 * Get Phim Bộ (Series)
 */
export function getSeriesMovies(): Movie[] {
  return getAllMovies().filter((m) => m.type !== 'single');
}

/**
 * Get Phim Lẻ (Single Movie / Chiếu Rạp)
 */
export function getSingleMovies(): Movie[] {
  const singles = getAllMovies().filter((m) => m.type === 'single');
  if (singles.length > 0) return singles;
  // If few explicit singles, filter by genre or duration
  return getAllMovies().filter(
    (m) =>
      m.genres.some((g) => g.includes('Lẻ') || g.includes('Chiếu Rạp')) ||
      m.duration?.toLowerCase().includes('phút')
  );
}

/**
 * Get movies by Air Schedule (e.g. T2, T3, CN)
 */
export function getMoviesBySchedule(dayKey: string): Movie[] {
  if (!dayKey || dayKey === 'all') return getAllMovies();
  const target = dayKey.toUpperCase().trim();
  return getAllMovies().filter((m) => {
    if (!m.airSchedule) return false;
    const days = m.airSchedule.toUpperCase().split(/[,\s]+/);
    return days.includes(target);
  });
}

/**
 * Search movies by title, original title, description or genre
 */
export function searchMovies(query: string): Movie[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return getAllMovies().filter((m) => {
    const matchTitle = m.title.toLowerCase().includes(q);
    const matchOriginal = m.titleOriginal ? m.titleOriginal.toLowerCase().includes(q) : false;
    const matchDesc = m.description.toLowerCase().includes(q);
    const matchGenre = m.genres.some((g) => g.toLowerCase().includes(q));
    const matchYear = m.year.toString().includes(q);
    return matchTitle || matchOriginal || matchDesc || matchGenre || matchYear;
  });
}

/**
 * Find related movies based on shared genres
 */
export function getRelatedMovies(currentMovie: Movie, limit = 6): Movie[] {
  if (!currentMovie) return [];
  return getAllMovies()
    .filter((m) => m.id !== currentMovie.id && m.slug !== currentMovie.slug)
    .map((m) => {
      const sharedCount = m.genres.filter((g) => currentMovie.genres.includes(g)).length;
      return { movie: m, score: sharedCount };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.movie)
    .slice(0, limit);
}

/**
 * Get list of all available genres
 */
export function getAllAvailableGenres(): string[] {
  const customGenres = new Set<string>(ALL_GENRES);
  getAllMovies().forEach((m) => {
    m.genres.forEach((g) => {
      if (g && g.trim()) customGenres.add(g.trim());
    });
  });
  return Array.from(customGenres);
}

/**
 * Get genre counts map
 */
export function getGenreCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  getAllAvailableGenres().forEach((g) => {
    counts[g] = 0;
  });
  getAllMovies().forEach((m) => {
    m.genres.forEach((g) => {
      counts[g] = (counts[g] || 0) + 1;
    });
  });
  return counts;
}

/**
 * Save or insert single movie
 */
export function upsertMovie(movieToSave: Movie): Movie[] {
  const list = getAllMovies();
  const index = list.findIndex((m) => m.id === movieToSave.id || m.slug === movieToSave.slug);

  let newList: Movie[];
  if (index >= 0) {
    newList = [...list];
    newList[index] = { ...movieToSave, updatedAt: new Date().toISOString().split('T')[0] };
  } else {
    newList = [{ ...movieToSave, updatedAt: new Date().toISOString().split('T')[0] }, ...list];
  }

  saveMoviesList(newList);
  return newList;
}

/**
 * Delete a movie by ID or Slug
 */
export function deleteMovieById(id: string): Movie[] {
  const list = getAllMovies();
  const newList = list.filter((m) => m.id !== id && m.slug !== id);
  saveMoviesList(newList);
  return newList;
}
