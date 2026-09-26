import React from 'react';
import { X, Bookmark, Clock, Trash2, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import { Article, ARTICLES } from '../data/pulsewireData';
import { getHighResImageUrl } from '../utils/imageOptimizer';

interface SavedArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedIds: string[];
  onToggleBookmark: (articleId: string) => void;
  onClearAll: () => void;
  onSelectArticle: (article: Article) => void;
  articles?: Article[];
}

export const SavedArticlesModal: React.FC<SavedArticlesModalProps> = ({
  isOpen,
  onClose,
  savedIds,
  onToggleBookmark,
  onClearAll,
  onSelectArticle,
  articles = ARTICLES
}) => {
  if (!isOpen) return null;

  const savedArticles = articles.filter((article) => savedIds.includes(article.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="bg-white text-neutral-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-neutral-200 flex flex-col relative max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-neutral-950">
                  Saved Field Dispatches
                </h3>
                <span className="text-xs font-mono-data font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  {savedArticles.length}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono-data">
                Stored locally in your browser's persistent storage
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {savedArticles.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-1"
                title="Clear all saved articles"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear List</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {savedArticles.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-neutral-900">
                  Your reading list is empty
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Click the bookmark icon on any field investigation or dispatch to save it here for offline reading or future reference.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Browse Dispatches
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 rounded-xl border border-neutral-200 hover:border-cyan-500 bg-white hover:bg-neutral-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div 
                    onClick={() => {
                      onSelectArticle(article);
                      onClose();
                    }}
                    className="flex items-start space-x-3.5 cursor-pointer flex-1"
                  >
                    <img
                      src={getHighResImageUrl(article.imageUrl, 800, 88)}
                      alt={article.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-neutral-200 group-hover:scale-103 transition-transform"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-[10px] font-mono-data text-neutral-500">
                        <span className="font-bold text-cyan-700 uppercase">{article.category}</span>
                        <span>•</span>
                        <span>{article.region}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-0.5 text-neutral-400" />
                          {article.readTime}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-950 group-hover:text-cyan-700 transition-colors line-clamp-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        onSelectArticle(article);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-cyan-900 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(article.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        {savedArticles.length > 0 && (
          <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Saved stories persist across browser refreshes and private sessions.
            </span>
            <button
              onClick={onClose}
              className="text-xs font-bold text-cyan-700 hover:underline"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
