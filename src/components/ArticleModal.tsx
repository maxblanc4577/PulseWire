import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Check, 
  Quote, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  ArrowUp, 
  Headphones, 
  BookOpen, 
  FileText, 
  Timer,
  Type,
  Edit3,
  Printer
} from 'lucide-react';
import { Article } from '../data/pulsewireData';
import { analyzeArticleReadingTime, calculateRemainingReadingTime } from '../utils/readingTime';
import { getHighResImageUrl, getResponsiveSrcSet, getAvatarSrcSet } from '../utils/imageOptimizer';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onSelectPillar: (pillarId: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (articleId: string) => void;
  onOpenAdminEdit?: (articleId: string) => void;
}

interface SpeechItem {
  id: string;
  type: 'title' | 'finding' | 'body';
  label: string;
  text: string;
  paragraphIndex?: number;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectPillar,
  isBookmarked = false,
  onToggleBookmark,
  onOpenAdminEdit
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoverScrubPercent, setHoverScrubPercent] = useState<number | null>(null);
  const [hoverScrubX, setHoverScrubX] = useState<number>(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReadingDetails, setShowReadingDetails] = useState(false);
  const [readingSpeedWpm, setReadingSpeedWpm] = useState<number>(200);
  const contentRef = useRef<HTMLDivElement>(null);

  // Article reading font size state ('sm' | 'base' | 'lg' | 'xl')
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsewire_reading_fontsize');
      if (saved === 'sm' || saved === 'base' || saved === 'lg' || saved === 'xl') return saved;
    }
    return 'base';
  });

  const bodyFontSizeClasses = useMemo(() => {
    switch (fontSize) {
      case 'sm': return 'text-sm sm:text-base leading-relaxed';
      case 'base': return 'text-base sm:text-lg leading-relaxed';
      case 'lg': return 'text-lg sm:text-xl leading-loose';
      case 'xl': return 'text-xl sm:text-2xl leading-loose';
      default: return 'text-base sm:text-lg leading-relaxed';
    }
  }, [fontSize]);

  const quoteFontSizeClasses = useMemo(() => {
    switch (fontSize) {
      case 'sm': return 'text-lg sm:text-xl';
      case 'base': return 'text-xl sm:text-2xl';
      case 'lg': return 'text-2xl sm:text-3xl';
      case 'xl': return 'text-3xl sm:text-4xl';
      default: return 'text-xl sm:text-2xl';
    }
  }, [fontSize]);

  // Web Speech API state
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [currentWord, setCurrentWord] = useState<string>('');
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Build ordered speech playlist items
  const speechItems: SpeechItem[] = useMemo(() => {
    if (!article) return [];
    const items: SpeechItem[] = [
      {
        id: 'header-lead',
        type: 'title',
        label: 'Headline & Executive Context',
        text: `${article.title}. ${article.subtitle}`
      }
    ];

    if (article.keyFindings && article.keyFindings.length > 0) {
      article.keyFindings.forEach((kf, idx) => {
        items.push({
          id: `finding-${idx}`,
          type: 'finding',
          label: `Key Finding 0${idx + 1}`,
          text: `Key finding ${idx + 1}: ${kf}`
        });
      });
    }

    if (article.content && article.content.length > 0) {
      article.content.forEach((paragraph, idx) => {
        items.push({
          id: `body-${idx}`,
          type: 'body',
          label: `Paragraph ${idx + 1}`,
          text: paragraph,
          paragraphIndex: idx
        });
      });
    }

    return items;
  }, [article]);

  // Analyze article body content, calculate total and body word counts, and determine estimated reading time
  const readingAnalysis = useMemo(() => {
    return analyzeArticleReadingTime(article, readingSpeedWpm);
  }, [article, readingSpeedWpm]);

  // Aliases for compatibility
  const wordCount = readingAnalysis.totalWordCount;
  const estimatedMinutes = readingAnalysis.estimatedMinutes;

  // Compute live remaining reading time based on reader's scroll progress
  const remainingMinutes = useMemo(() => {
    return calculateRemainingReadingTime(readingAnalysis.estimatedMinutes, scrollProgress);
  }, [readingAnalysis.estimatedMinutes, scrollProgress]);

  // Stop speech synthesis helper
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeechStatus('idle');
    setCurrentWord('');
  }, []);

  // Play a specific chunk index using Web Speech API
  const playSpeechChunk = useCallback((index: number, rate = speechRate) => {
    if (!isSpeechSupported || !speechItems[index]) {
      setSpeechStatus('idle');
      return;
    }

    window.speechSynthesis.cancel();
    const item = speechItems[index];
    const utterance = new SpeechSynthesisUtterance(item.text);
    speechUtteranceRef.current = utterance;

    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) 
      || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setSpeechStatus('playing');
      setCurrentSpeechIndex(index);
    };

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const spokenWord = item.text.slice(e.charIndex, e.charIndex + e.charLength);
        setCurrentWord(spokenWord.trim());
      }
    };

    utterance.onend = () => {
      setCurrentWord('');
      if (index + 1 < speechItems.length) {
        playSpeechChunk(index + 1, rate);
      } else {
        setSpeechStatus('idle');
        setCurrentSpeechIndex(0);
      }
    };

    utterance.onerror = (e) => {
      // Ignore if canceled deliberately
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e);
      }
      setSpeechStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeechSupported, speechItems, speechRate]);

  // Master speech toggle button
  const handleToggleSpeech = useCallback(() => {
    if (!isSpeechSupported) {
      alert("Web Speech API is not supported in this browser. Please use Chrome, Edge, Safari, or Firefox.");
      return;
    }

    if (speechStatus === 'playing') {
      window.speechSynthesis.pause();
      setSpeechStatus('paused');
    } else if (speechStatus === 'paused') {
      window.speechSynthesis.resume();
      setSpeechStatus('playing');
    } else {
      // Start from currentSpeechIndex or 0
      playSpeechChunk(currentSpeechIndex);
    }
  }, [isSpeechSupported, speechStatus, currentSpeechIndex, playSpeechChunk]);

  // Skip next / prev chunk
  const handleSkipChunk = (direction: 'next' | 'prev') => {
    const nextIdx = direction === 'next' 
      ? Math.min(speechItems.length - 1, currentSpeechIndex + 1)
      : Math.max(0, currentSpeechIndex - 1);
    
    setCurrentSpeechIndex(nextIdx);
    if (speechStatus === 'playing') {
      playSpeechChunk(nextIdx);
    }
  };

  // Change playback speed
  const handleChangeRate = (rate: number) => {
    setSpeechRate(rate);
    if (speechStatus === 'playing') {
      playSpeechChunk(currentSpeechIndex, rate);
    }
  };

  // Reset and cleanup when modal closes or article changes
  useEffect(() => {
    stopSpeech();
    setCurrentSpeechIndex(0);
    setScrollProgress(0);
    setShowShareMenu(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    return () => {
      stopSpeech();
    };
  }, [article, stopSpeech]);

  // Track scroll position on article content with passive listener
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateScrollProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll > 0) {
        const percentage = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
        setScrollProgress(percentage);
      } else {
        setScrollProgress(0);
      }
    };

    el.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();

    return () => {
      el.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, [article]);

  // Close handler with speech cancel
  const handleClose = () => {
    stopSpeech();
    onClose();
  };

  // Print handler for print-friendly view
  const handlePrint = () => {
    window.print();
  };

  if (!article) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      const percentage = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      setScrollProgress(percentage);
    } else {
      setScrollProgress(0);
    }
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Allow clicking/scrubbing on the scrolling progress bar to navigate long-form content
  const handleScrubProgressBar = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contentRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const maxScroll = contentRef.current.scrollHeight - contentRef.current.clientHeight;
    if (maxScroll > 0) {
      contentRef.current.scrollTo({
        top: ratio * maxScroll,
        behavior: 'smooth'
      });
      setScrollProgress(ratio * 100);
    }
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, currentX / rect.width));
    setHoverScrubPercent(Math.round(ratio * 100));
    setHoverScrubX(currentX);
  };

  const getArticleUrl = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('article', article.id);
      return url.toString();
    }
    return `https://pulsewire.com/dispatch/${article.id}`;
  };

  const handleCopyLink = () => {
    const url = getArticleUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareTwitter = () => {
    const url = getArticleUrl();
    const text = `Field Dispatch: "${article.title}" via @Pulsewire`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const handleShareEmail = () => {
    const url = getArticleUrl();
    const subject = `Pulsewire Field Dispatch: ${article.title}`;
    const body = `Hi,\n\nI thought you would find this investigation from Pulsewire.com insightful:\n\n"${article.title}"\n${article.subtitle}\n\nRead the full report with satellite data and field notes here:\n${url}\n\n— Shared via Pulsewire Global Intelligence`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleToggleSave = () => {
    if (onToggleBookmark && article) {
      onToggleBookmark(article.id);
      const willBeSaved = !isBookmarked;
      setBookmarkToast(willBeSaved ? 'Saved to your reading list' : 'Removed from reading list');
      setTimeout(() => setBookmarkToast(null), 2500);
    }
  };

  const activeSpeechItem = speechItems[currentSpeechIndex];
  const activeParagraphSpoken = speechStatus !== 'idle' && activeSpeechItem?.type === 'body' 
    ? activeSpeechItem.paragraphIndex 
    : undefined;

  const speechPercentage = speechItems.length > 0
    ? Math.round(((currentSpeechIndex + 1) / speechItems.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 article-modal-backdrop">
      
      {/* Modal Container */}
      <div 
        className="bg-white text-neutral-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-neutral-200 flex flex-col relative article-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Subtle Horizontal Reading Progress Bar at the Top of the ArticleModal */}
        <div 
          onClick={handleScrubProgressBar}
          onMouseMove={handleProgressBarMouseMove}
          onMouseLeave={() => setHoverScrubPercent(null)}
          className="w-full h-1 sm:h-1.5 bg-neutral-200/70 hover:h-2 transition-all shrink-0 print:hidden relative cursor-pointer select-none group z-30"
          aria-label={`Article reading progress: ${Math.round(scrollProgress)}%`}
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          title={`Read progress: ${Math.round(scrollProgress)}% completed · Click to jump to section`}
        >
          {/* Smooth Subtle Gradient Progress Bar Fill */}
          <div 
            className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-400 transition-[width] duration-100 ease-out shadow-[0_0_6px_rgba(6,182,212,0.6)] relative"
            style={{ width: `${scrollProgress}%` }}
          >
            {scrollProgress > 1 && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full shadow-[0_0_6px_#06b6d4] opacity-90 group-hover:scale-125 transition-transform" />
            )}
          </div>

          {/* Interactive Scrub Preview Tooltip */}
          {hoverScrubPercent !== null && (
            <div 
              className="absolute top-full mt-1.5 -translate-x-1/2 px-2 py-0.5 bg-neutral-950/90 backdrop-blur text-white text-[10px] font-mono-data rounded shadow-lg pointer-events-none z-40 whitespace-nowrap border border-neutral-700 flex items-center space-x-1 animate-in fade-in duration-75"
              style={{ left: `${hoverScrubX}px` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{hoverScrubPercent}%</span>
              <span className="text-neutral-400">·</span>
              <span className="text-cyan-300">{Math.max(0, Math.ceil(readingAnalysis.estimatedMinutes * (1 - hoverScrubPercent / 100)))}m left</span>
            </div>
          )}
        </div>

        {/* Sticky Action Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 py-3 flex items-center justify-between z-20 print:hidden">
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 font-mono-data">
              {article.category}
            </span>
            <span className="hidden sm:inline-flex items-center text-xs text-neutral-500">
              <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-600" />
              {article.region}
            </span>

            {/* Reading Time Pill (prominently displayed at top of modal) */}
            <button
              onClick={() => {
                if (contentRef.current && contentRef.current.scrollTop > 60) {
                  contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setShowReadingDetails((prev) => !prev);
              }}
              title="Click to view article body content analysis & reading time metrics"
              className="inline-flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-xs font-mono-data font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 px-2 sm:px-2.5 py-1 rounded-md border border-neutral-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-600 shrink-0" />
              <span>{readingAnalysis.formattedTime}</span>
              <span className="text-neutral-500 font-normal hidden md:inline">({readingAnalysis.bodyWordCount} body words)</span>
            </button>
            
            {/* Live Reading Scroll Percentage Indicator Badge with dynamic remaining time */}
            <div 
              className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200 text-[10px] sm:text-[11px] font-mono-data font-bold shadow-2xs"
              title={`Read progress: ${Math.round(scrollProgress)}% completed`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shrink-0"></span>
              <span className="hidden xs:inline text-cyan-700 font-medium">Progress:</span>
              <span className="text-cyan-950 font-black">
                {scrollProgress >= 98
                  ? '100% (Finished)'
                  : scrollProgress > 5
                  ? `${Math.round(scrollProgress)}% (${remainingMinutes}m left)`
                  : `${Math.round(scrollProgress)}%`}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 relative">
            {/* Font-size toggle for article text readability */}
            <div 
              className="flex items-center space-x-0.5 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 shadow-2xs"
              title="Adjust article reading font size"
            >
              <button
                type="button"
                onClick={() => {
                  const next = fontSize === 'xl' ? 'lg' : fontSize === 'lg' ? 'base' : 'sm';
                  setFontSize(next);
                  try { localStorage.setItem('pulsewire_reading_fontsize', next); } catch(e){}
                }}
                disabled={fontSize === 'sm'}
                title="Decrease font size (A-)"
                className="px-1.5 py-1 text-neutral-600 hover:text-neutral-950 disabled:opacity-30 disabled:hover:text-neutral-600 rounded transition-colors font-serif font-bold text-xs"
              >
                A-
              </button>

              <span className="px-1.5 py-0.5 text-[10px] font-mono-data font-bold text-neutral-800 bg-white rounded shadow-2xs">
                {fontSize === 'sm' ? '85%' : fontSize === 'base' ? '100%' : fontSize === 'lg' ? '120%' : '140%'}
              </span>

              <button
                type="button"
                onClick={() => {
                  const next = fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'xl';
                  setFontSize(next);
                  try { localStorage.setItem('pulsewire_reading_fontsize', next); } catch(e){}
                }}
                disabled={fontSize === 'xl'}
                title="Increase font size (A+)"
                className="px-1.5 py-1 text-neutral-600 hover:text-neutral-950 disabled:opacity-30 disabled:hover:text-neutral-600 rounded transition-colors font-serif font-black text-xs"
              >
                A+
              </button>
            </div>

            {/* Quick Listen Button in Header */}
            <button
              onClick={handleToggleSpeech}
              title={speechStatus === 'playing' ? "Pause audio speech" : "Listen to article with Web Speech API"}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                speechStatus === 'playing'
                  ? 'bg-cyan-600 text-white'
                  : speechStatus === 'paused'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              {speechStatus === 'playing' ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span className="hidden md:inline font-mono-data text-[11px]">Speaking...</span>
                </>
              ) : (
                <>
                  <Headphones className="w-4 h-4 text-cyan-600" />
                  <span className="hidden md:inline text-[11px]">Listen</span>
                </>
              )}
            </button>

            {/* Print Button (Triggers clean simplified print-friendly view) */}
            <button
              type="button"
              onClick={handlePrint}
              title="Print Article (Clean, simplified print-friendly view)"
              aria-label="Print article in print-friendly format"
              className="p-2 rounded-lg text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors flex items-center space-x-1.5 text-xs font-semibold cursor-pointer border border-transparent hover:border-neutral-200"
            >
              <Printer className="w-4 h-4 text-cyan-600 shrink-0" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Share Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                title="Share Article"
                className={`p-2 rounded-lg transition-colors flex items-center text-xs space-x-1.5 font-medium ${
                  showShareMenu 
                    ? 'bg-neutral-900 text-white' 
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                <Share2 className="w-4 h-4 text-cyan-600" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Share Popover Menu */}
              {showShareMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono-data font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                    Share Field Dispatch
                  </div>

                  {/* Copy Link Option */}
                  <button
                    onClick={() => {
                      handleCopyLink();
                      setTimeout(() => setShowShareMenu(false), 1200);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors text-left"
                  >
                    <span className="flex items-center space-x-2">
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-neutral-500" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Article Link'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono-data">URL</span>
                  </button>

                  {/* Twitter / X Option */}
                  <button
                    onClick={() => {
                      handleShareTwitter();
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors text-left"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-3.5 h-3.5 text-neutral-900 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>Share on Twitter / X</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </button>

                  {/* Email Option */}
                  <button
                    onClick={() => {
                      handleShareEmail();
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors text-left"
                  >
                    <span className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-cyan-600" />
                      <span>Share via Email</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono-data">Email</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bookmark Action Button */}
            <button
              onClick={handleToggleSave}
              title={isBookmarked ? "Remove from Saved Dispatches" : "Save for Later"}
              className={`p-2 rounded-lg transition-colors flex items-center space-x-1.5 text-xs font-medium ${
                isBookmarked 
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' 
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-600 text-cyan-600' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            {/* Optional Admin Edit Button */}
            {onOpenAdminEdit && (
              <button
                onClick={() => onOpenAdminEdit(article.id)}
                title="Correct or edit this article in Admin Portal"
                className="p-2 rounded-lg text-neutral-600 hover:text-amber-600 hover:bg-amber-50 transition-colors text-xs font-semibold flex items-center space-x-1"
              >
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span className="hidden lg:inline text-[11px] font-mono-data">Correct</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={handleClose}
              title="Close Story (Esc)"
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bookmark Action Notification Toast */}
        {bookmarkToast && (
          <div className="absolute top-16 right-6 z-30 bg-neutral-950 text-white text-xs py-2 px-3.5 rounded-xl shadow-xl border border-neutral-800 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-150 print:hidden">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{bookmarkToast}</span>
          </div>
        )}

        {/* Story Body Scrollable Content */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="p-6 sm:p-10 space-y-8 overflow-y-auto max-h-[85vh] scroll-smooth relative article-modal-content"
        >
          
          {/* Print-Only Professional Editorial Masthead */}
          <div className="hidden print:block border-b-2 border-neutral-900 pb-4 mb-6">
            <div className="flex items-center justify-between text-xs font-mono-data text-neutral-800 uppercase tracking-widest border-b border-neutral-300 pb-2 mb-2">
              <span className="font-extrabold text-neutral-950 text-sm">PULSEWIRE GLOBAL INTELLIGENCE DISPATCH</span>
              <span>{article.region} • {article.publishedAt}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono-data text-neutral-600">
              <span>Category: {article.category} • Bureau Correspondent: {article.author.name} ({article.author.role})</span>
              <span>Dispatch ID: {article.id}</span>
            </div>
          </div>

          {/* Article Header & Metadata Section */}
          <div className="space-y-4">
            
            {/* Top Metadata Strip: Category, Region, Date, and Estimated Reading Time */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 font-mono-data">
              <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                {article.category}
              </span>
              <span>•</span>
              <span className="flex items-center text-neutral-600">
                <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                {article.region}
              </span>
              <span>•</span>
              <span className="flex items-center text-neutral-600">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {article.publishedAt}
              </span>
              <span>•</span>

              {/* Prominent Estimated Reading Time in Metadata Strip */}
              <span 
                className="flex items-center text-cyan-900 font-semibold bg-cyan-50/80 border border-cyan-200/80 px-2 py-0.5 rounded shadow-2xs" 
                title={`Calculated at ${readingSpeedWpm} words per minute based on ${readingAnalysis.bodyWordCount} body words (${readingAnalysis.totalWordCount} total readable corpus)`}
              >
                <Clock className="w-3.5 h-3.5 mr-1 text-cyan-600 shrink-0" />
                <span>{readingAnalysis.formattedTime}</span>
                <span className="ml-1 text-[11px] text-cyan-700 font-normal hidden sm:inline">
                  (~{readingAnalysis.formattedExact} at {readingSpeedWpm} WPM)
                </span>
              </span>

              {article.breaking && (
                <>
                  <span>•</span>
                  <span className="text-red-600 font-bold uppercase tracking-wider text-[11px] flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1 animate-pulse"></span>
                    Field Alert
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-lg text-neutral-600 font-normal leading-relaxed">
              {article.subtitle}
            </p>

            {/* Author Byline & Social Sharing Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-4 border-b border-neutral-200">
              <div className="flex items-center space-x-3">
                <img
                  src={getHighResImageUrl(article.author.avatar, 400, 90, 'square')}
                  srcSet={getAvatarSrcSet(article.author.avatar)}
                  alt={article.author.name}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-300 shadow-2xs"
                  decoding="async"
                />
                <div>
                  <p className="text-sm font-bold text-neutral-900">{article.author.name}</p>
                  <p className="text-xs text-neutral-500">{article.author.role}</p>
                </div>
              </div>

              {/* Social Media Sharing Component */}
              <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-neutral-50 p-1.5 rounded-xl border border-neutral-200 print:hidden">
                <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-neutral-400 px-2 hidden sm:inline">
                  Share:
                </span>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  title="Copy permanent article link"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    copiedLink
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-2xs'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                {/* Twitter / X Share Button */}
                <button
                  onClick={handleShareTwitter}
                  title="Share to Twitter / X"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-neutral-900 hover:text-white text-neutral-800 border border-neutral-200 shadow-2xs transition-colors flex items-center space-x-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter</span>
                </button>

                {/* Email Share Button */}
                <button
                  onClick={handleShareEmail}
                  title="Share via Email"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-cyan-50 hover:text-cyan-800 text-neutral-800 border border-neutral-200 shadow-2xs transition-colors flex items-center space-x-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Email</span>
                </button>

                {/* Save for Later Button */}
                <button
                  onClick={handleToggleSave}
                  title={isBookmarked ? "Remove from Saved" : "Save for Later"}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border shadow-2xs transition-all flex items-center space-x-1.5 ${
                    isBookmarked
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-cyan-600 fill-cyan-600' : 'text-neutral-500'}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Dedicated Article Metadata Header: Estimated Reading Time & Reading Speed Controls */}
            <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-cyan-50/30 p-4 shadow-2xs space-y-3 print:hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100/80 px-2 py-0.5 rounded">
                        Estimated Reading Time
                      </span>
                      <span className="text-[11px] font-mono-data text-neutral-500">
                        Based on {readingSpeedWpm} WPM average reading speed
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-lg font-black text-neutral-950 font-mono-data">
                        {readingAnalysis.formattedTime}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono-data">
                        (~{readingAnalysis.formattedExact})
                      </span>
                      <span className="text-xs text-neutral-400 font-mono-data">
                        • {readingAnalysis.bodyWordCount.toLocaleString()} body words across {readingAnalysis.paragraphCount} paragraphs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Average Reading Speed Selector */}
                <div className="flex items-center space-x-1.5 self-start md:self-auto bg-white p-1 rounded-lg border border-neutral-200 text-[11px] font-mono-data shadow-2xs">
                  <span className="text-neutral-400 px-1.5 text-[10px] uppercase font-bold tracking-wider">
                    Speed:
                  </span>
                  {[
                    { label: 'Relaxed', wpm: 160 },
                    { label: 'Average', wpm: 200 },
                    { label: 'Brisk', wpm: 250 }
                  ].map((pace) => (
                    <button
                      key={pace.wpm}
                      onClick={() => setReadingSpeedWpm(pace.wpm)}
                      title={`Calculate reading time at ${pace.wpm} words per minute (${pace.label} pace)`}
                      className={`px-2 py-0.5 rounded transition-all font-semibold cursor-pointer ${
                        readingSpeedWpm === pace.wpm
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                      }`}
                    >
                      {pace.label} ({pace.wpm})
                    </button>
                  ))}
                  <button
                    onClick={() => setShowReadingDetails(!showReadingDetails)}
                    title="Toggle detailed word count breakdown"
                    className="ml-1 text-[10px] text-cyan-700 hover:underline px-1 font-semibold"
                  >
                    {showReadingDetails ? 'Less' : 'Details'}
                  </button>
                </div>
              </div>

              {/* Dynamic scroll reading progress readout in metadata header */}
              {scrollProgress > 2 && (
                <div className="flex items-center justify-between text-[11px] font-mono-data bg-cyan-50/90 border border-cyan-200/70 rounded-lg px-3 py-1.5 text-cyan-900">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse mr-2" />
                    <span>Scroll read progress: <strong>{Math.round(scrollProgress)}% completed</strong></span>
                  </span>
                  <span className="text-cyan-800 font-semibold">
                    {scrollProgress >= 95 ? (
                      'Article completed! 🎉'
                    ) : (
                      `~${remainingMinutes} min reading time remaining`
                    )}
                  </span>
                </div>
              )}

              {/* Expandable Corpus Analysis Breakdown */}
              {showReadingDetails && (
                <div className="pt-2 border-t border-neutral-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white/90 p-2 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono-data text-neutral-400 block uppercase">Body Words</span>
                    <strong className="text-neutral-900 font-mono-data">{readingAnalysis.bodyWordCount.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono-data text-neutral-400 block uppercase">Total Readable</span>
                    <strong className="text-neutral-900 font-mono-data">{readingAnalysis.totalWordCount.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono-data text-neutral-400 block uppercase">Paragraphs</span>
                    <strong className="text-neutral-900 font-mono-data">{readingAnalysis.paragraphCount} (~{readingAnalysis.avgWordsPerParagraph} w/para)</strong>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono-data text-neutral-400 block uppercase">Audio Narration</span>
                    <strong className="text-neutral-900 font-mono-data">~{readingAnalysis.audioEstimatedMinutes} min spoken</strong>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* REAL WEB SPEECH API AUDIO DISPATCH NARRATION PLAYER */}
          <div className="bg-neutral-950 text-white rounded-2xl p-5 sm:p-6 space-y-4 border border-neutral-800 shadow-lg relative overflow-hidden print:hidden">
            
            {/* Background Ambient Glow */}
            {speechStatus === 'playing' && (
              <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left Play Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleToggleSpeech}
                  title={speechStatus === 'playing' ? "Pause spoken reading" : "Listen to article via Web Speech"}
                  className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-neutral-950 flex items-center justify-center transition-all shrink-0 shadow-md hover:scale-105"
                >
                  {speechStatus === 'playing' ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono-data uppercase font-bold tracking-wider text-cyan-400 flex items-center">
                      <Headphones className="w-3.5 h-3.5 mr-1.5" />
                      Browser Speech Synthesis
                    </span>
                    {speechStatus === 'playing' && (
                      <span className="flex items-center space-x-0.5 h-3">
                        <span className="w-1 bg-cyan-400 h-full animate-[bounce_0.6s_ease-in-out_infinite]"></span>
                        <span className="w-1 bg-cyan-400 h-3/4 animate-[bounce_0.8s_ease-in-out_infinite]"></span>
                        <span className="w-1 bg-cyan-400 h-1/2 animate-[bounce_0.5s_ease-in-out_infinite]"></span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {speechStatus === 'playing'
                      ? `Reading: ${activeSpeechItem?.label || 'Article'}`
                      : speechStatus === 'paused'
                      ? `Paused: ${activeSpeechItem?.label || 'Article'}`
                      : 'Listen to Article (Aloud)'}
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    {speechStatus === 'playing' && currentWord ? (
                      <span className="text-cyan-300 font-medium">Currently speaking: "{currentWord}"</span>
                    ) : (
                      'Powered by Web Speech API • Paragraph follow-along enabled'
                    )}
                  </p>
                </div>
              </div>

              {/* Right Controls: Skip, Stop, Speed */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                {/* Skip back */}
                <button
                  onClick={() => handleSkipChunk('prev')}
                  disabled={currentSpeechIndex === 0}
                  title="Previous Section"
                  className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-neutral-300 transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Stop */}
                <button
                  onClick={stopSpeech}
                  disabled={speechStatus === 'idle'}
                  title="Stop Audio"
                  className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-neutral-300 transition-colors"
                >
                  <Square className="w-4 h-4" />
                </button>

                {/* Skip forward */}
                <button
                  onClick={() => handleSkipChunk('next')}
                  disabled={currentSpeechIndex >= speechItems.length - 1}
                  title="Next Section"
                  className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-neutral-300 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Speed selector */}
                <div className="flex items-center space-x-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono-data">
                  {[0.85, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleChangeRate(rate)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        speechRate === rate
                          ? 'bg-cyan-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Speech Playlist Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono-data text-neutral-400">
                <span>
                  Section {currentSpeechIndex + 1} of {speechItems.length} ({activeSpeechItem?.label})
                </span>
                <span>{speechPercentage}% Narrated</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${speechPercentage}%` }}
                />
              </div>
            </div>

          </div>

          {/* Lead Photo & Caption */}
          <div className="space-y-2">
            <div className="rounded-xl overflow-hidden bg-neutral-100 aspect-16/9 relative shadow">
              <img
                src={getHighResImageUrl(article.imageUrl, 2400, 88)}
                srcSet={getResponsiveSrcSet(article.imageUrl, [800, 1200, 1800, 2400])}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
                alt={article.title}
                className="w-full h-full object-cover"
                decoding="async"
                fetchPriority="high"
              />
            </div>
            <p className="text-xs text-neutral-500 italic px-1">
              Photo & Field Dispatch: {article.imageCaption}
            </p>
          </div>

          {/* Key Findings Callout Box */}
          {article.keyFindings && article.keyFindings.length > 0 && (
            <div className="bg-cyan-50/70 border border-cyan-200/80 rounded-xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-900 font-bold text-xs uppercase tracking-wider font-mono-data">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>Field Investigation Key Takeaways</span>
              </div>
              <ul className="space-y-2.5">
                {article.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-neutral-800">
                    <span className="font-mono-data text-xs font-bold text-cyan-700 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <span className="leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Body Paragraphs with Web Speech Paragraph Highlighting & Dynamic Font Size */}
          <div className="space-y-6 text-neutral-800 font-serif-editorial">
            {article.content.map((paragraph, idx) => {
              const isCurrentlySpeakingThis = activeParagraphSpoken === idx;

              if (idx === 2) {
                return (
                  <div 
                    key={idx} 
                    className={`my-8 pl-6 border-l-4 transition-all duration-300 py-2 ${
                      isCurrentlySpeakingThis
                        ? 'border-cyan-500 bg-cyan-50/80 p-4 rounded-r-xl shadow-xs'
                        : 'border-cyan-500'
                    }`}
                  >
                    <p className={`font-serif-editorial italic text-neutral-900 leading-snug transition-all ${quoteFontSizeClasses}`}>
                      "{paragraph}"
                    </p>
                    {isCurrentlySpeakingThis && (
                      <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-cyan-700 flex items-center mt-1">
                        <Volume2 className="w-3 h-3 mr-1 animate-pulse" />
                        Speaking quote
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`transition-all duration-300 rounded-xl ${
                    isCurrentlySpeakingThis 
                      ? 'p-3 -mx-3 bg-cyan-50/80 border-l-4 border-cyan-500 shadow-xs' 
                      : ''
                  }`}
                >
                  <p className={`text-neutral-800 transition-all ${bodyFontSizeClasses}`}>
                    {paragraph}
                  </p>
                  {isCurrentlySpeakingThis && (
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono-data text-cyan-800 font-bold mt-1.5">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse text-cyan-600" />
                      <span>Reading Paragraph {idx + 1} aloud</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* End of Article Social Media Sharing Component */}
          <div className="my-8 p-6 rounded-2xl bg-neutral-900 text-white space-y-4 shadow-sm border border-neutral-800 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono-data uppercase font-bold tracking-wider">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Disseminate Field Intelligence</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Share this independent field report with your network
                </h4>
                <p className="text-xs text-neutral-400">
                  Help ensure verified development telemetry reaches researchers, civil servants, and grassroots leaders.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    copiedLink
                      ? 'bg-emerald-500 text-neutral-950 shadow-md'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4 text-neutral-950" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                {/* Twitter / X */}
                <button
                  onClick={handleShareTwitter}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Share on X</span>
                </button>

                {/* Email */}
                <button
                  onClick={handleShareEmail}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-colors flex items-center space-x-2 shadow"
                >
                  <Mail className="w-4 h-4" />
                  <span>Share via Email</span>
                </button>

                {/* Save for Later */}
                <button
                  onClick={handleToggleSave}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 border ${
                    isBookmarked
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : 'text-neutral-400'}`} />
                  <span>{isBookmarked ? 'Saved to Reading List' : 'Save for Later'}</span>
                </button>
              </div>
            </div>

            {/* Quick URL Display Pill */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono-data text-neutral-400">
              <span className="truncate pr-4 text-neutral-400">
                Permalink: <span className="text-cyan-300 font-medium">{getArticleUrl()}</span>
              </span>
              <button
                onClick={handleCopyLink}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 shrink-0 hover:underline"
              >
                {copiedLink ? 'Copied' : 'Click to copy'}
              </button>
            </div>
          </div>

          {/* Print-Only Editorial Citation & Certification */}
          <div className="hidden print:block pt-6 border-t-2 border-neutral-900 text-xs font-mono-data text-neutral-600 mt-8 print-page-break-avoid">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-neutral-950 font-bold uppercase tracking-wider">Pulsewire Global Intelligence Bureau</strong>
              <span>Dispatch ID: {article.id}</span>
            </div>
            <p className="text-[10pt] text-neutral-800 leading-normal">
              Official Field Report • Published: {article.publishedAt} • Region: {article.region} • Author: {article.author.name} ({article.author.role})
            </p>
            <p className="text-[9pt] text-neutral-500 mt-1">
              Verified independent development intelligence. Permanent link: {getArticleUrl()}
            </p>
          </div>

          {/* Article Footer & Related Focus Pillar */}
          <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
            <div className="text-xs text-neutral-500">
              Published by <strong className="text-neutral-900">Pulsewire.com Editorial Investigations Bureau</strong>.
              <br />All data sets, orbital telemetry, and interview transcripts verified independently.
            </div>

            <button
              onClick={() => {
                handleClose();
                onSelectPillar(article.pillarId);
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition-colors"
            >
              <span>Explore Associated Pillar</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>

          {/* Floating Back-to-Top with Scroll Progress Indicator */}
          {scrollProgress > 25 && (
            <button
              onClick={scrollToTop}
              title={`Scroll back to top (${Math.round(scrollProgress)}% read)`}
              className="sticky bottom-4 ml-auto flex items-center space-x-2 px-3.5 py-2 rounded-full bg-neutral-950/90 hover:bg-neutral-900 text-white backdrop-blur shadow-lg border border-neutral-700 text-xs font-mono-data transition-all hover:scale-105 z-20 print:hidden"
            >
              <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>{Math.round(scrollProgress)}%</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

