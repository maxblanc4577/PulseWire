/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MainContent } from './components/MainContent';
import { ArticleModal } from './components/ArticleModal';
import { SearchModal } from './components/SearchModal';
import { SupportModal } from './components/SupportModal';
import { PublicationModal } from './components/PublicationModal';
import { SavedArticlesModal } from './components/SavedArticlesModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { Article, Publication } from './data/pulsewireData';
import { useBookmarks } from './utils/useBookmarks';
import { useArticlesManager } from './utils/useArticlesManager';

export default function App() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminEditingArticleId, setAdminEditingArticleId] = useState<string | null>(null);
  const [selectedPillarId, setSelectedPillarId] = useState('clean-energy');
  const [selectedRegionId, setSelectedRegionId] = useState('commonwealth-of-dominica');
  const [activeLanguage, setActiveLanguage] = useState('EN');

  // Articles & live telemetry state manager connected to localStorage
  const {
    articles,
    vitalityMetrics,
    createArticle,
    updateArticle,
    deleteArticle,
    toggleBreaking,
    setFeaturedLead,
    updateVitalityMetric,
    resetToDefaults
  } = useArticlesManager();

  // Bookmarking hook connected to localStorage
  const { savedIds, savedCount, toggleBookmark, isBookmarked, clearAllBookmarks } = useBookmarks();

  // Keyboard shortcut listener: Cmd/Ctrl + K to search, Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSelectedArticle(null);
        setSelectedPublication(null);
        setIsSearchOpen(false);
        setIsSupportOpen(false);
        setIsSavedOpen(false);
        setIsAdminOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-cyan-500 selection:text-white">
      
      {/* Responsive Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        savedCount={savedCount}
        onSelectPillar={(pillarId) => setSelectedPillarId(pillarId)}
        onSelectRegion={(regionId) => setSelectedRegionId(regionId)}
        activeLanguage={activeLanguage}
        onChangeLanguage={(lang) => setActiveLanguage(lang)}
      />

      {/* Main Content Area */}
      <div className="flex-1 print:hidden">
        <MainContent
          articles={articles}
          vitalityMetrics={vitalityMetrics}
          onSelectArticle={(article) => setSelectedArticle(article)}
          onSelectPublication={(pub) => setSelectedPublication(pub)}
          onOpenSupport={() => setIsSupportOpen(true)}
          selectedPillarId={selectedPillarId}
          onSelectPillar={(pillarId) => setSelectedPillarId(pillarId)}
          selectedRegionId={selectedRegionId}
          onSelectRegion={(regionId) => setSelectedRegionId(regionId)}
          savedIds={savedIds}
          onToggleBookmark={toggleBookmark}
        />
      </div>

      {/* Responsive Institutional Footer */}
      <Footer
        onSelectPillar={(pillarId) => setSelectedPillarId(pillarId)}
        onSelectRegion={(regionId) => setSelectedRegionId(regionId)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenAdmin={() => {
          setAdminEditingArticleId(null);
          setIsAdminOpen(true);
        }}
      />

      {/* Interactive Story Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSelectPillar={(pillarId) => setSelectedPillarId(pillarId)}
        isBookmarked={selectedArticle ? isBookmarked(selectedArticle.id) : false}
        onToggleBookmark={toggleBookmark}
        onOpenAdminEdit={(articleId) => {
          setSelectedArticle(null);
          setAdminEditingArticleId(articleId);
          setIsAdminOpen(true);
        }}
      />

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={(article) => setSelectedArticle(article)}
        onSelectPillar={(pillarId) => setSelectedPillarId(pillarId)}
        onSelectRegion={(regionId) => setSelectedRegionId(regionId)}
      />

      {/* Saved Articles / Bookmarks Drawer Modal */}
      <SavedArticlesModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        articles={articles}
        savedIds={savedIds}
        onToggleBookmark={toggleBookmark}
        onClearAll={clearAllBookmarks}
        onSelectArticle={(article) => setSelectedArticle(article)}
      />

      {/* Independent Mission Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Publication & Research Report Preview Modal */}
      <PublicationModal
        publication={selectedPublication}
        onClose={() => setSelectedPublication(null)}
      />

      {/* Newsroom Editorial CMS & Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setAdminEditingArticleId(null);
        }}
        articles={articles}
        vitalityMetrics={vitalityMetrics}
        onCreateArticle={createArticle}
        onUpdateArticle={updateArticle}
        onDeleteArticle={deleteArticle}
        onToggleBreaking={toggleBreaking}
        onSetFeaturedLead={setFeaturedLead}
        onUpdateVitalityMetric={updateVitalityMetric}
        onResetToDefaults={resetToDefaults}
        onSelectArticlePreview={(art) => setSelectedArticle(art)}
        initialEditingArticleId={adminEditingArticleId}
      />

    </div>
  );
}
