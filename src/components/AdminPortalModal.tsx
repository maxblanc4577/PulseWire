import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShieldAlert, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Save, 
  Sparkles, 
  Search, 
  FileText, 
  Clock, 
  Eye, 
  EyeOff,
  Radio, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Image as ImageIcon,
  User,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  MapPin,
  Flame,
  Star,
  Lock,
  Unlock,
  Key,
  LogOut
} from 'lucide-react';
import { Article, IMPACT_PILLARS, REGIONAL_DESKS, LiveVitalityMetric } from '../data/pulsewireData';
import { countWords } from '../utils/readingTime';
import { getHighResImageUrl } from '../utils/imageOptimizer';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  vitalityMetrics: LiveVitalityMetric[];
  onCreateArticle: (article: Omit<Article, 'id'> & { id?: string }) => Article;
  onUpdateArticle: (id: string, updated: Partial<Article>) => void;
  onDeleteArticle: (id: string) => void;
  onToggleBreaking: (id: string) => void;
  onSetFeaturedLead: (id: string) => void;
  onUpdateVitalityMetric: (index: number, metric: LiveVitalityMetric) => void;
  onResetToDefaults: () => void;
  onSelectArticlePreview?: (article: Article) => void;
  initialEditingArticleId?: string | null;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  articles,
  vitalityMetrics,
  onCreateArticle,
  onUpdateArticle,
  onDeleteArticle,
  onToggleBreaking,
  onSetFeaturedLead,
  onUpdateVitalityMetric,
  onResetToDefaults,
  onSelectArticlePreview,
  initialEditingArticleId
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'create' | 'telemetry'>('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPillar, setFilterPillar] = useState('all');

  // Admin Portal Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('pulsewire_admin_auth') === 'true' ||
             sessionStorage.getItem('pulsewire_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberAuth, setRememberAuth] = useState(true);
  const [currentAdminUser, setCurrentAdminUser] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dominica_admin';
    return localStorage.getItem('pulsewire_admin_user') || 
           sessionStorage.getItem('pulsewire_admin_user') || 
           'dominica_admin';
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = authUsername.trim();
    const p = authPassword.trim();
    
    // Authorized credentials for Dominica and Caribbean newsroom administration
    const validUsers = ['dominica_admin', 'caribbean_editor', 'admin', 'editor'];
    const validPasswords = ['Dominica2026!Resilience', 'Pulsewire@2026', 'admin123', 'caribbean2026'];

    if (validUsers.includes(u.toLowerCase()) && validPasswords.includes(p)) {
      setIsAuthenticated(true);
      setAuthError(null);
      setCurrentAdminUser(u);
      try {
        if (rememberAuth) {
          localStorage.setItem('pulsewire_admin_auth', 'true');
          localStorage.setItem('pulsewire_admin_user', u);
        } else {
          sessionStorage.setItem('pulsewire_admin_auth', 'true');
          sessionStorage.setItem('pulsewire_admin_user', u);
        }
      } catch (err) {}
      showToast(`Welcome, ${u} — Editorial CMS access unlocked`);
    } else {
      setAuthError('Invalid credentials. Please verify your editorial username and password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('pulsewire_admin_auth');
      localStorage.removeItem('pulsewire_admin_user');
      sessionStorage.removeItem('pulsewire_admin_auth');
      sessionStorage.removeItem('pulsewire_admin_user');
    } catch (err) {}
    setAuthUsername('');
    setAuthPassword('');
    showToast('Logged out of Admin Portal');
  };

  const handleAutofillCredentials = () => {
    setAuthUsername('dominica_admin');
    setAuthPassword('Dominica2026!Resilience');
    setAuthError(null);
  };

  const [editingArticle, setEditingArticle] = useState<Article | null>(() => {
    if (initialEditingArticleId) {
      return articles.find(a => a.id === initialEditingArticleId) || null;
    }
    return null;
  });

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newCategory, setNewCategory] = useState('Energy Transition');
  const [newPillarId, setNewPillarId] = useState('clean-energy');
  const [newRegion, setNewRegion] = useState('Commonwealth of Dominica');
  const [newAuthorName, setNewAuthorName] = useState('Daphne Etienne');
  const [newAuthorRole, setNewAuthorRole] = useState('Senior Energy & Climate Correspondent, Roseau Bureau');
  const [newAuthorAvatar, setNewAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&w=400&h=400&q=90');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=2400&q=88');
  const [newImageCaption, setNewImageCaption] = useState('Field team conducts on-site verification testing.');
  const [newIsBreaking, setNewIsBreaking] = useState(false);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newKeyFindings, setNewKeyFindings] = useState<string[]>([
    'Field telemetry confirms 42% acceleration in community adoption over the preceding quarter.',
    'Decentralized governance model eliminates overhead intermediaries by over 70%.'
  ]);
  const [newContent, setNewContent] = useState<string[]>([
    'In this comprehensive field investigation, correspondents review the operational infrastructure driving sovereign resilience.',
    'Local stakeholder trusts and technical engineers report unprecedented reliability even amidst harsh climatic extremes.',
    'The project provides a transparent blueprint for peer communities seeking non-extractive autonomy.'
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // If initialEditingArticleId changes, load it
  React.useEffect(() => {
    if (initialEditingArticleId) {
      const art = articles.find(a => a.id === initialEditingArticleId);
      if (art) {
        setEditingArticle({ ...art });
        setActiveTab('articles');
      }
    }
  }, [initialEditingArticleId, articles]);

  // Compute total words and estimated reading time for the creation form
  const createFormWords = useMemo(() => {
    const text = [
      newTitle,
      newSubtitle,
      newExcerpt,
      ...newContent,
      ...newKeyFindings
    ].join(' ');
    return countWords(text);
  }, [newTitle, newSubtitle, newExcerpt, newContent, newKeyFindings]);

  const createFormMinutes = Math.max(1, Math.ceil(createFormWords / 200));

  // Compute total words and estimated reading time for the edit form
  const editFormWords = useMemo(() => {
    if (!editingArticle) return 0;
    const text = [
      editingArticle.title || '',
      editingArticle.subtitle || '',
      editingArticle.excerpt || '',
      ...(editingArticle.content || []),
      ...(editingArticle.keyFindings || [])
    ].join(' ');
    return countWords(text);
  }, [editingArticle]);

  const editFormMinutes = Math.max(1, Math.ceil(editFormWords / 200));

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesSearch = 
        !searchQuery ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPillar = filterPillar === 'all' || art.pillarId === filterPillar;
      return matchesSearch && matchesPillar;
    });
  }, [articles, searchQuery, filterPillar]);

  // Handler to post new article
  const handlePublishNewArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please provide an article headline.');
      return;
    }

    const created = onCreateArticle({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Field dispatch investigation and telemetry.',
      excerpt: newExcerpt.trim() || newSubtitle.trim() || 'Independent investigation from the Pulsewire Field Bureau.',
      category: newCategory,
      pillarId: newPillarId,
      region: newRegion,
      author: {
        name: newAuthorName.trim() || 'Pulsewire Bureau Correspondent',
        role: newAuthorRole.trim() || 'Field Investigator',
        avatar: getHighResImageUrl(newAuthorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 400, 90, 'square')
      },
      publishedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: `${createFormMinutes} min read`,
      imageUrl: getHighResImageUrl(newImageUrl.trim() || 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9', 2400, 88),
      imageCaption: newImageCaption.trim() || 'Field documentation provided by the regional bureau.',
      breaking: newIsBreaking,
      featured: newIsFeatured,
      keyFindings: newKeyFindings.filter(Boolean),
      content: newContent.filter(Boolean)
    });

    showToast(`Published "${created.title.slice(0, 30)}..." to website!`);
    
    // Reset form
    setNewTitle('');
    setNewSubtitle('');
    setNewExcerpt('');
    setNewIsBreaking(false);
    setNewIsFeatured(false);
    setActiveTab('articles');
  };

  // Handler to save edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    onUpdateArticle(editingArticle.id, {
      ...editingArticle,
      readTime: `${editFormMinutes} min read`
    });

    showToast(`Saved corrections to "${editingArticle.title.slice(0, 30)}..."`);
    setEditingArticle(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-emerald-950 border border-emerald-500 text-emerald-100 text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Admin Modal Window */}
      <div 
        className="bg-neutral-900 text-neutral-100 w-full max-w-5xl rounded-2xl shadow-2xl border border-neutral-800 flex flex-col relative my-auto max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-xs shrink-0">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Editorial Newsroom Admin Portal
                </h2>
                <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Level 5 Clearance
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Create, edit, post, correct all articles, and manage live website telemetry in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {isAuthenticated && (
              <div className="hidden sm:flex items-center space-x-2 bg-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-800 text-xs font-mono-data">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-neutral-400">Editor:</span>
                <span className="text-white font-bold">{currentAdminUser}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-neutral-400 hover:text-red-400 transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Log out of Admin Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Log Out</span>
                </button>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={() => {
                  if (confirm('Reset all dispatches and live telemetry to original newsroom defaults? Any custom articles will be refreshed.')) {
                    onResetToDefaults();
                    showToast('Articles and telemetry reset to factory defaults.');
                  }
                }}
                title="Reset all articles to original newsroom defaults"
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono-data text-neutral-400 hover:text-red-400 hover:bg-neutral-800/80 transition-colors border border-transparent hover:border-neutral-700 flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            )}

            <button
              onClick={onClose}
              title="Close Admin Portal"
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If not authenticated, render login form; otherwise render CMS */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center my-auto max-w-lg mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Newsroom Admin Portal Authentication
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
                Enter your authorized editorial credentials to manage dispatches, edit headlines, and update live Caribbean vitality telemetry.
              </p>
            </div>

            {authError && (
              <div className="w-full p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center space-x-2 text-left animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-mono-data uppercase font-bold text-neutral-300 flex items-center justify-between">
                  <span>Username</span>
                  <span className="text-[10px] text-neutral-500 font-sans">Default: dominica_admin</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Enter editorial username"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono-data uppercase font-bold text-neutral-300 flex items-center justify-between">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-sans"
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberAuth}
                    onChange={(e) => setRememberAuth(e.target.checked)}
                    className="rounded border-neutral-700 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Sign In to Admin Portal</span>
              </button>
            </form>

            {/* Quick Demo Credentials Box */}
            <div className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-cyan-400">
                  Authorized Newsroom Credentials
                </span>
                <button
                  type="button"
                  onClick={handleAutofillCredentials}
                  className="text-[11px] font-mono-data font-bold text-cyan-400 hover:text-white underline cursor-pointer"
                >
                  Fill Demo Credentials
                </button>
              </div>
              <div className="font-mono-data text-xs space-y-1.5 text-neutral-300">
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-500 w-20">Username:</span>
                  <code className="text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 font-bold">dominica_admin</code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-500 w-20">Password:</span>
                  <code className="text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 font-bold">Dominica2026!Resilience</code>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-4 sm:px-6 pt-3 pb-1 border-b border-neutral-800 bg-neutral-950/60 shrink-0 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('articles'); setEditingArticle(null); }}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-colors flex items-center space-x-2 border-b-2 ${
              activeTab === 'articles' && !editingArticle
                ? 'border-cyan-400 text-cyan-300 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Articles Directory ({articles.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('create'); setEditingArticle(null); }}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-colors flex items-center space-x-2 border-b-2 ${
              activeTab === 'create'
                ? 'border-cyan-400 text-cyan-300 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create & Post New Dispatch</span>
          </button>

          <button
            onClick={() => { setActiveTab('telemetry'); setEditingArticle(null); }}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-colors flex items-center space-x-2 border-b-2 ${
              activeTab === 'telemetry'
                ? 'border-cyan-400 text-cyan-300 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Vitality Telemetry ({vitalityMetrics.length})</span>
          </button>

          {editingArticle && (
            <button
              onClick={() => setActiveTab('articles')}
              className="px-3.5 py-2 rounded-t-lg text-xs font-bold transition-colors flex items-center space-x-2 border-b-2 border-amber-400 text-amber-300 bg-neutral-900 ml-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Correcting: "{editingArticle.title.slice(0, 22)}..."</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: EDITING ARTICLE FORM (Inline Correction Mode) */}
          {editingArticle ? (
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Edit3 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono-data">
                    Correcting Dispatch: {editingArticle.id}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono-data text-neutral-400">
                    Calculated: ~{editFormMinutes} min read ({editFormWords} words)
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingArticle(null)}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Corrections</span>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Subtitle / Context
                  </label>
                  <input
                    type="text"
                    value={editingArticle.subtitle}
                    onChange={(e) => setEditingArticle({ ...editingArticle, subtitle: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Executive Excerpt (Search & Cards Preview)
                  </label>
                  <textarea
                    rows={2}
                    value={editingArticle.excerpt}
                    onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Category, Pillar, Region, Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Pillar *
                  </label>
                  <select
                    value={editingArticle.pillarId}
                    onChange={(e) => {
                      const selected = IMPACT_PILLARS.find(p => p.id === e.target.value);
                      setEditingArticle({ 
                        ...editingArticle, 
                        pillarId: e.target.value,
                        category: selected?.title || editingArticle.category
                      });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {IMPACT_PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Regional Desk
                  </label>
                  <select
                    value={editingArticle.region}
                    onChange={(e) => setEditingArticle({ ...editingArticle, region: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {REGIONAL_DESKS.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                    <option value="Global / Transnational">Global / Transnational</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-2 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingArticle.breaking || false}
                      onChange={(e) => setEditingArticle({ ...editingArticle, breaking: e.target.checked })}
                      className="rounded text-red-500 focus:ring-red-500 bg-neutral-950 border-neutral-700"
                    />
                    <span className="font-bold text-red-400">🚨 Field Alert (Breaking)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingArticle.featured || false}
                      onChange={(e) => setEditingArticle({ ...editingArticle, featured: e.target.checked })}
                      className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-950 border-neutral-700"
                    />
                    <span className="font-bold text-cyan-300">⭐ Featured Lead Story</span>
                  </label>
                </div>
              </div>

              {/* Author and Hero Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="flex items-center space-x-2 text-xs font-mono-data font-bold text-neutral-300">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Author Profile</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Author Name</label>
                    <input
                      type="text"
                      value={editingArticle.author.name}
                      onChange={(e) => setEditingArticle({
                        ...editingArticle,
                        author: { ...editingArticle.author, name: e.target.value }
                      })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Author Role / Bureau</label>
                    <input
                      type="text"
                      value={editingArticle.author.role}
                      onChange={(e) => setEditingArticle({
                        ...editingArticle,
                        author: { ...editingArticle.author, role: e.target.value }
                      })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Avatar Image URL</label>
                    <input
                      type="text"
                      value={editingArticle.author.avatar}
                      onChange={(e) => setEditingArticle({
                        ...editingArticle,
                        author: { ...editingArticle.author, avatar: e.target.value }
                      })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono-data"
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="flex items-center space-x-2 text-xs font-mono-data font-bold text-neutral-300">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hero Media & Caption</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Image URL</label>
                    <input
                      type="text"
                      value={editingArticle.imageUrl}
                      onChange={(e) => setEditingArticle({ ...editingArticle, imageUrl: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono-data"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Image Caption & Credit</label>
                    <input
                      type="text"
                      value={editingArticle.imageCaption}
                      onChange={(e) => setEditingArticle({ ...editingArticle, imageCaption: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Key Findings Editor */}
              <div className="space-y-2 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono-data font-bold text-cyan-400 uppercase">
                    <span>Key Investigation Findings ({editingArticle.keyFindings.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingArticle({
                      ...editingArticle,
                      keyFindings: [...editingArticle.keyFindings, '']
                    })}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded text-xs font-mono-data flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Finding</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editingArticle.keyFindings.map((finding, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-xs font-mono-data text-neutral-500 shrink-0">0{idx + 1}.</span>
                      <input
                        type="text"
                        value={finding}
                        onChange={(e) => {
                          const updated = [...editingArticle.keyFindings];
                          updated[idx] = e.target.value;
                          setEditingArticle({ ...editingArticle, keyFindings: updated });
                        }}
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingArticle.keyFindings.filter((_, i) => i !== idx);
                          setEditingArticle({ ...editingArticle, keyFindings: updated });
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Content Paragraphs Editor */}
              <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono-data font-bold uppercase text-cyan-400">
                      Article Body Content ({editingArticle.content.length} paragraphs)
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Total body words: {countWords(editingArticle.content.join(' '))} words • Used for reading time analysis
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingArticle({
                      ...editingArticle,
                      content: [...editingArticle.content, '']
                    })}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded-lg text-xs font-mono-data flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Paragraph</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editingArticle.content.map((paragraph, idx) => (
                    <div key={idx} className="space-y-1 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span className="font-mono-data font-semibold">
                          Paragraph {idx + 1} {idx === 2 ? '(Formatted as Editorial Pull-Quote)' : ''}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-mono-data text-neutral-500">
                            {countWords(paragraph)} words
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingArticle.content.filter((_, i) => i !== idx);
                              setEditingArticle({ ...editingArticle, content: updated });
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400 transition-colors ml-2"
                            title="Delete this paragraph"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={3}
                        value={paragraph}
                        onChange={(e) => {
                          const updated = [...editingArticle.content];
                          updated[idx] = e.target.value;
                          setEditingArticle({ ...editingArticle, content: updated });
                        }}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-100 focus:outline-none focus:border-cyan-400 font-serif"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Corrections</span>
                </button>
              </div>
            </form>
          ) : activeTab === 'articles' ? (
            /* TAB 1: ARTICLES DIRECTORY & MANAGEMENT */
            <div className="space-y-4">
              
              {/* Controls bar: search and filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles by title, author, category..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={filterPillar}
                    onChange={(e) => setFilterPillar(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-300 focus:outline-none"
                  >
                    <option value="all">All Pillars ({articles.length})</option>
                    {IMPACT_PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center space-x-1.5 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Article</span>
                  </button>
                </div>
              </div>

              {/* Articles Grid / Table */}
              <div className="space-y-3">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 text-xs font-mono-data">
                    No articles match your query.
                  </div>
                ) : (
                  filteredArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <img
                          src={getHighResImageUrl(art.imageUrl, 400, 88)}
                          alt={art.title}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-neutral-800"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-cyan-300">
                              {art.category}
                            </span>
                            <span className="text-[10px] font-mono-data text-neutral-400">
                              • {art.region}
                            </span>
                            {art.breaking && (
                              <span className="text-[10px] font-mono-data font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1 animate-pulse" />
                                Alert
                              </span>
                            )}
                            {art.featured && (
                              <span className="text-[10px] font-mono-data font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center">
                                <Star className="w-2.5 h-2.5 mr-1 fill-cyan-400" />
                                Lead Story
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-white truncate" title={art.title}>
                            {art.title}
                          </h3>

                          <div className="flex items-center space-x-3 text-[11px] text-neutral-400">
                            <span>By {art.author.name}</span>
                            <span>•</span>
                            <span className="flex items-center font-mono-data text-neutral-400">
                              <Clock className="w-3 h-3 mr-1 text-cyan-500" />
                              {art.readTime}
                            </span>
                            <span>•</span>
                            <span className="text-neutral-500">
                              {countWords((art.content || []).join(' '))} body words
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 self-end md:self-auto shrink-0">
                        {/* Quick preview */}
                        {onSelectArticlePreview && (
                          <button
                            onClick={() => {
                              onClose();
                              onSelectArticlePreview(art);
                            }}
                            title="Preview Article on Live Site"
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Toggle breaking */}
                        <button
                          onClick={() => {
                            onToggleBreaking(art.id);
                            showToast(`Updated breaking status for "${art.title.slice(0, 25)}..."`);
                          }}
                          title={art.breaking ? "Remove field alert status" : "Set as urgent field alert"}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-data font-bold transition-colors ${
                            art.breaking
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400'
                          }`}
                        >
                          Alert
                        </button>

                        {/* Set featured */}
                        <button
                          onClick={() => {
                            onSetFeaturedLead(art.id);
                            showToast(`Set "${art.title.slice(0, 25)}..." as Lead Story!`);
                          }}
                          title={art.featured ? "Currently Lead Story" : "Set as Homepage Lead Story"}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-data font-bold transition-colors ${
                            art.featured
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-cyan-300'
                          }`}
                        >
                          {art.featured ? 'Lead' : 'Make Lead'}
                        </button>

                        {/* Edit / Correct Article */}
                        <button
                          onClick={() => {
                            setEditingArticle({ ...art });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-cyan-500 hover:text-neutral-950 text-neutral-200 text-xs font-bold transition-colors flex items-center space-x-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </button>

                        {/* Delete Article */}
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${art.title}"?`)) {
                              onDeleteArticle(art.id);
                              showToast(`Deleted "${art.title.slice(0, 25)}..."`);
                            }
                          }}
                          title="Delete Article"
                          className="p-2 rounded-lg bg-neutral-900 hover:bg-red-950 text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === 'create' ? (
            /* TAB 2: CREATE & POST NEW DISPATCH FORM */
            <form onSubmit={handlePublishNewArticle} className="space-y-6">
              
              <div className="bg-cyan-950/40 border border-cyan-800/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Publish New Field Dispatch to Pulsewire.com</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Articles published here appear live immediately in the global feed, search, and reading modal.
                  </p>
                </div>
                <div className="text-right font-mono-data text-xs text-cyan-300">
                  <span>Calculated: ~{createFormMinutes} min read ({createFormWords} words)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Decentralized Water Purification: How 40 Municipalities Ended Bottled Monopolies"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Subtitle / Context
                  </label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="e.g., Independent telemetry reveals a 90% cost drop using open ultraviolet filtration arrays."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Executive Excerpt
                  </label>
                  <textarea
                    rows={2}
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    placeholder="Brief 1-2 sentence executive overview for social sharing and search cards..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Pillar, Category, Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Pillar *
                  </label>
                  <select
                    value={newPillarId}
                    onChange={(e) => {
                      const selected = IMPACT_PILLARS.find(p => p.id === e.target.value);
                      setNewPillarId(e.target.value);
                      if (selected) setNewCategory(selected.title);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {IMPACT_PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold uppercase text-neutral-400 mb-1">
                    Regional Desk
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {REGIONAL_DESKS.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                    <option value="Global / Transnational">Global / Transnational</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-2 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsBreaking}
                      onChange={(e) => setNewIsBreaking(e.target.checked)}
                      className="rounded text-red-500 focus:ring-red-500 bg-neutral-950 border-neutral-700"
                    />
                    <span className="font-bold text-red-400">🚨 Field Alert (Breaking)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsFeatured}
                      onChange={(e) => setNewIsFeatured(e.target.checked)}
                      className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-950 border-neutral-700"
                    />
                    <span className="font-bold text-cyan-300">⭐ Set as Lead Story</span>
                  </label>
                </div>
              </div>

              {/* Author & Media Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="flex items-center space-x-2 text-xs font-mono-data font-bold text-neutral-300">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Author Profile</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Author Name</label>
                    <input
                      type="text"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Author Role</label>
                    <input
                      type="text"
                      value={newAuthorRole}
                      onChange={(e) => setNewAuthorRole(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="flex items-center space-x-2 text-xs font-mono-data font-bold text-neutral-300">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hero Media</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Image URL</label>
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono-data"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">Image Caption</label>
                    <input
                      type="text"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="space-y-2 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-data font-bold text-cyan-400 uppercase">
                    Key Investigation Findings ({newKeyFindings.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewKeyFindings([...newKeyFindings, ''])}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded text-xs font-mono-data flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Finding</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newKeyFindings.map((finding, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-xs font-mono-data text-neutral-500 shrink-0">0{idx + 1}.</span>
                      <input
                        type="text"
                        value={finding}
                        onChange={(e) => {
                          const updated = [...newKeyFindings];
                          updated[idx] = e.target.value;
                          setNewKeyFindings(updated);
                        }}
                        placeholder="Key quantitative or factual takeaway..."
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setNewKeyFindings(newKeyFindings.filter((_, i) => i !== idx))}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Content Paragraphs */}
              <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono-data font-bold uppercase text-cyan-400">
                      Article Body Paragraphs ({newContent.length} paragraphs)
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Total body words: {countWords(newContent.join(' '))} words • Auto-calculates reading time
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewContent([...newContent, ''])}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded-lg text-xs font-mono-data flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Paragraph</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newContent.map((paragraph, idx) => (
                    <div key={idx} className="space-y-1 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span className="font-mono-data font-semibold">
                          Paragraph {idx + 1} {idx === 2 ? '(Pull-Quote styling applied)' : ''}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-mono-data text-neutral-500">
                            {countWords(paragraph)} words
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewContent(newContent.filter((_, i) => i !== idx))}
                            className="p-1 text-neutral-500 hover:text-red-400 transition-colors ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={3}
                        value={paragraph}
                        onChange={(e) => {
                          const updated = [...newContent];
                          updated[idx] = e.target.value;
                          setNewContent(updated);
                        }}
                        placeholder="Write investigative reporting content here..."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-100 focus:outline-none focus:border-cyan-400 font-serif"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish button */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="submit"
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish & Post to Website</span>
                </button>
              </div>

            </form>
          ) : (
            /* TAB 3: LIVE TELEMETRY & VITALITY METRICS */
            <div className="space-y-6">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>Live Homepage Vitality Telemetry Ticker</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Directly adjust the key planetary progress indicators displayed on the live homepage tracker.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vitalityMetrics.map((metric, idx) => (
                  <div key={idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-data font-bold uppercase text-cyan-400">
                        Metric #{idx + 1}
                      </span>
                      <select
                        value={metric.status}
                        onChange={(e) => onUpdateVitalityMetric(idx, {
                          ...metric,
                          status: e.target.value as LiveVitalityMetric['status']
                        })}
                        className="bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs text-white"
                      >
                        <option value="positive">Positive (Green)</option>
                        <option value="warning">Warning (Amber)</option>
                        <option value="critical">Critical (Red)</option>
                        <option value="neutral">Neutral (Blue)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-0.5">Title / Index Name</label>
                      <input
                        type="text"
                        value={metric.title}
                        onChange={(e) => onUpdateVitalityMetric(idx, { ...metric, title: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-0.5">Value</label>
                        <input
                          type="text"
                          value={metric.value}
                          onChange={(e) => onUpdateVitalityMetric(idx, { ...metric, value: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono-data"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-0.5">Unit</label>
                        <input
                          type="text"
                          value={metric.unit}
                          onChange={(e) => onUpdateVitalityMetric(idx, { ...metric, unit: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono-data"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-0.5">Change Rate</label>
                        <input
                          type="text"
                          value={metric.change}
                          onChange={(e) => onUpdateVitalityMetric(idx, { ...metric, change: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono-data"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-0.5">Descriptor Summary</label>
                      <input
                        type="text"
                        value={metric.descriptor}
                        onChange={(e) => onUpdateVitalityMetric(idx, { ...metric, descriptor: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
          </>
        )}

      </div>
    </div>
  );
};
