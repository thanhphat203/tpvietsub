/**
 * @file lib/movies.ts
 * Helper utilities for accessing, filtering, and managing Donghua movies
 */

import moviesData from '../data/movies.json';
import { Movie, ALL_GENRES } from '../src/types';

const STORAGE_KEY = 'tp_vietsub_movies_data_v1';

// Initial default movies list
const defaultMovies: Movie[] = (moviesData as Movie[]).map((movie) => ({
  ...movie,
  genres: movie.genres || [],
  watchLinks: movie.watchLinks || [],
  rating: movie.rating ?? 8.0,
  views: movie.views ?? 0,
  updatedAt: movie.updatedAt || '2026-01-01',
}));

/**
 * Helper to get currently active movies array from localStorage or fallback to default
 */
function getActiveMoviesList(): Movie[] {
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
  return defaultMovies;
}

/**
 * Save updated movies array to localStorage and emit custom update event
 */
export function saveMoviesList(updatedList: Movie[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList, null, 2));
    window.dispatchEvent(new Event('tp_movies_updated'));
  } catch (err) {
    console.error('Failed to save movies to localStorage', err);
  }
}

/**
 * Reset stored movies back to original data/movies.json
 */
export function resetMoviesToDefault(): Movie[] {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('tp_movies_updated'));
  return defaultMovies;
}

/**
 * Get all movies, optionally sorted by newest update first
 */
export function getAllMovies(): Movie[] {
  const currentList = getActiveMoviesList();
  return [...currentList].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Get a single movie by its slug
 */
export function getMovieBySlug(slug: string): Movie | undefined {
  if (!slug) return undefined;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  return getAllMovies().find((m) => m.slug.toLowerCase() === decodedSlug);
}

/**
 * Get all movies belonging to a specific genre
 */
export function getMoviesByGenre(genre: string): Movie[] {
  if (!genre) return [];
  const target = decodeURIComponent(genre).toLowerCase().trim();
  return getAllMovies().filter((m) =>
    m.genres.some((g) => g.toLowerCase().trim() === target)
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
 * Get movies marked as Hot (isHot === true)
 */
export function getHotMovies(limit = 8): Movie[] {
  return getAllMovies()
    .filter((m) => m.isHot)
    .slice(0, limit);
}

/**
 * Get movies marked as New (isNew === true)
 */
export function getNewMovies(limit = 12): Movie[] {
  return getAllMovies()
    .filter((m) => m.isNew)
    .slice(0, limit);
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
    return matchTitle || matchOriginal || matchDesc || matchGenre;
  });
}

/**
 * Find related movies based on shared genres
 */
export function getRelatedMovies(currentMovie: Movie, limit = 6): Movie[] {
  if (!currentMovie) return [];
  return getAllMovies()
    .filter((m) => m.id !== currentMovie.id)
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
  return [...ALL_GENRES];
}

/**
 * Get genre counts map
 */
export function getGenreCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  ALL_GENRES.forEach((g) => {
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
  const list = getActiveMoviesList();
  const index = list.findIndex((m) => m.id === movieToSave.id);
  
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
 * Delete a movie by ID
 */
export function deleteMovieById(id: string): Movie[] {
  const list = getActiveMoviesList();
  const newList = list.filter((m) => m.id !== id);
  saveMoviesList(newList);
  return newList;
}

