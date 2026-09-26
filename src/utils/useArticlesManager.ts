import { useState, useEffect, useCallback } from 'react';
import { 
  Article, 
  ARTICLES, 
  LiveVitalityMetric, 
  VITALITY_METRICS 
} from '../data/pulsewireData';
import { upgradeArticleImages } from './imageOptimizer';

const ARTICLES_STORAGE_KEY = 'pulsewire_custom_articles_caribbean_v5';
const METRICS_STORAGE_KEY = 'pulsewire_vitality_metrics_caribbean_v5';

// Helper to ensure only Dominica and Caribbean articles circulate
export function isCaribbeanOrDominicaArticle(article: Article): boolean {
  if (!article) return false;
  const searchableText = `${article.region} ${article.title} ${article.subtitle} ${article.excerpt} ${article.author?.role || ''} ${article.imageCaption || ''}`.toLowerCase();
  
  // Explicitly reject non-Caribbean regions or nations
  const nonCaribbeanTerms = [
    'sub-saharan africa', 'nairobi', 'kenya', 'senegal', 'rwanda', 'sahel', 'rift valley',
    'asia & the pacific', 'asia-pacific', 'tuvalu', 'kiribati', 'funafuti', 'bengaluru', 'india',
    'ethiopia', 'oromia', 'middle east', 'north africa', 'amman', 'cairo',
    'eastern europe', 'central asia', 'aral sea', 'geneva', 'almaty',
    'amazon', 'tapajós', 'tapajos', 'munduruku', 'brazil'
  ];
  for (const term of nonCaribbeanTerms) {
    if (searchableText.includes(term)) {
      return false;
    }
  }

  // Ensure region or text explicitly ties to Dominica or Caribbean
  const validCaribbeanTerms = [
    'dominica', 'caribbean', 'roseau', 'laudat', 'portsmouth', 'salybia', 'kalinago', 
    'scotts head', 'soufrière', 'soufriere', 'oecs', 'caricom', 'bridgetown', 
    'antilles', 'antigua', 'barbados', 'st. lucia', 'saint lucia', 'grenada',
    'st. vincent', 'saint vincent', 'trinidad', 'guyana', 'jamaica'
  ];
  return validCaribbeanTerms.some(term => searchableText.includes(term));
}

export function useArticlesManager() {
  // Articles state with automatic high-res picture resolution assurance
  const [articles, setArticles] = useState<Article[]>(() => {
    if (typeof window === 'undefined') return ARTICLES.map(upgradeArticleImages);
    try {
      // Clear legacy storage keys with non-Caribbean articles
      localStorage.removeItem('pulsewire_custom_articles_v4');
      localStorage.removeItem('pulsewire_custom_articles_v3');
      localStorage.removeItem('pulsewire_vitality_metrics_v4');

      const stored = localStorage.getItem(ARTICLES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly filter out any articles from outside Dominica and Caribbean
          const filtered = parsed.filter(isCaribbeanOrDominicaArticle).map(upgradeArticleImages);
          if (filtered.length > 0) {
            return filtered;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load articles from localStorage', e);
    }
    return ARTICLES.map(upgradeArticleImages);
  });

  // Vitality metrics state
  const [vitalityMetrics, setVitalityMetrics] = useState<LiveVitalityMetric[]>(() => {
    if (typeof window === 'undefined') return VITALITY_METRICS;
    try {
      const stored = localStorage.getItem(METRICS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load vitality metrics from localStorage', e);
    }
    return VITALITY_METRICS;
  });

  // Listen for storage events in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ARTICLES_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(isCaribbeanOrDominicaArticle);
            setArticles(filtered.length > 0 ? filtered : ARTICLES.map(upgradeArticleImages));
          }
        } catch (err) {
          // ignore
        }
      }
      if (e.key === METRICS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setVitalityMetrics(parsed);
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveArticles = useCallback((newArticles: Article[]) => {
    const sanitized = newArticles.filter(isCaribbeanOrDominicaArticle);
    setArticles(sanitized);
    try {
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.error('Failed to save articles to localStorage', e);
    }
  }, []);

  const saveVitalityMetrics = useCallback((newMetrics: LiveVitalityMetric[]) => {
    setVitalityMetrics(newMetrics);
    try {
      localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(newMetrics));
    } catch (e) {
      console.error('Failed to save vitality metrics to localStorage', e);
    }
  }, []);

  // Create & post a new article
  const createArticle = useCallback((newArticleData: Omit<Article, 'id'> & { id?: string }): Article => {
    const generatedId = newArticleData.id || `dispatch-${Date.now()}`;
    const newArticle: Article = {
      ...newArticleData,
      id: generatedId
    };

    setArticles((prev) => {
      // If marked as featured, un-feature other articles to maintain a single lead
      let updated = prev;
      if (newArticle.featured) {
        updated = prev.map((a) => ({ ...a, featured: false }));
      }
      const next = [newArticle, ...updated];
      try {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    return newArticle;
  }, []);

  // Update / Correct an existing article
  const updateArticle = useCallback((articleId: string, updatedFields: Partial<Article>) => {
    setArticles((prev) => {
      const next = prev.map((art) => {
        if (art.id === articleId) {
          return { ...art, ...updatedFields };
        }
        // If updating an article to be featured, un-feature all other articles
        if (updatedFields.featured && art.id !== articleId) {
          return { ...art, featured: false };
        }
        return art;
      });

      try {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Delete an article
  const deleteArticle = useCallback((articleId: string) => {
    setArticles((prev) => {
      const next = prev.filter((a) => a.id !== articleId);
      try {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Quick toggle breaking alert
  const toggleBreaking = useCallback((articleId: string) => {
    setArticles((prev) => {
      const next = prev.map((a) => a.id === articleId ? { ...a, breaking: !a.breaking } : a);
      try {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Quick set featured lead
  const setFeaturedLead = useCallback((articleId: string) => {
    setArticles((prev) => {
      const next = prev.map((a) => ({
        ...a,
        featured: a.id === articleId
      }));
      try {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Update live vitality metric
  const updateVitalityMetric = useCallback((index: number, updatedMetric: LiveVitalityMetric) => {
    setVitalityMetrics((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = updatedMetric;
      }
      try {
        localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Reset to original factory defaults
  const resetToDefaults = useCallback(() => {
    setArticles(ARTICLES.map(upgradeArticleImages));
    setVitalityMetrics(VITALITY_METRICS);
    try {
      localStorage.removeItem(ARTICLES_STORAGE_KEY);
      localStorage.removeItem(METRICS_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return {
    articles,
    vitalityMetrics,
    createArticle,
    updateArticle,
    deleteArticle,
    toggleBreaking,
    setFeaturedLead,
    updateVitalityMetric,
    resetToDefaults,
    saveArticles,
    saveVitalityMetrics
  };
}
