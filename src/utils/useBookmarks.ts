import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pulsewire_saved_articles';

export function useBookmarks() {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved articles from localStorage', e);
    }
    return [];
  });

  // Listen for storage changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setSavedIds(parsed);
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveToStorage = useCallback((ids: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save articles to localStorage', e);
    }
  }, []);

  const toggleBookmark = useCallback((articleId: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(articleId);
      const next = exists ? prev.filter((id) => id !== articleId) : [articleId, ...prev];
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const isBookmarked = useCallback((articleId: string) => {
    return savedIds.includes(articleId);
  }, [savedIds]);

  const clearAllBookmarks = useCallback(() => {
    setSavedIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear bookmarks', e);
    }
  }, []);

  return {
    savedIds,
    savedCount: savedIds.length,
    toggleBookmark,
    isBookmarked,
    clearAllBookmarks
  };
}
