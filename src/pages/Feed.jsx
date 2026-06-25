import { useState, useEffect, useCallback, useRef } from 'react';
import { getFeed, getVideosByCategory, getRandomFeed, getArticlesFeed, getProfile } from '../services/api';

import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const ARTICLES_PER_PAGE = 18;

// ─── Tabs config ──────────────────────────────────────────
const TABS = [
  { key: 'all',       label: 'All',       icon: '' },
  { key: 'F1',        label: 'F1',        icon: '' },
  { key: 'CRICKET',   label: 'Cricket',   icon: '' },
  { key: 'FOOTBALL',  label: 'Football',  icon: '' },
  { key: 'TENNIS',    label: 'Tennis',    icon: '' },
  { key: 'BADMINTON', label: 'Badminton', icon: '' },
  { key: 'random',    label: 'Random',    icon: '' },
];

// ─── Filter articles by active tab ───────────────────────
const filterArticles = (articles, tab) => {
  if (tab === 'all' || tab === 'random') return articles;
  return articles.filter(a => a.category === tab);
};

// ─── Video Card ───────────────────────────────────────────
const VideoCard = ({ video, onPlay }) => (
  <div
    onClick={() => onPlay(video)}
    className="
      rounded-2xl overflow-hidden cursor-pointer group
      bg-gradient-to-br
      from-[#1c212b]
      via-[#181d25]
      to-[#12161d]
      border border-[#2c3440]
      shadow-lg shadow-black/30
      hover:border-[#404958]
      hover:shadow-xl hover:shadow-black/40
      hover:-translate-y-1
      transition-all duration-300
    "
  >
    {/* Thumbnail */}
    <div className="relative overflow-hidden">
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="
          w-full h-44 object-cover
          transition-transform duration-500
          group-hover:scale-105
        "
      />

      {/* Premium dark overlay */}
      <div
        className="
          absolute inset-0
          flex items-center justify-center
          bg-gradient-to-t
          from-black/70
          via-black/25
          to-transparent
          group-hover:from-black/80
          transition-all duration-300
        "
      >
        <div
          className="
            w-12 h-12 rounded-full
            flex items-center justify-center
            transition-all duration-300
            group-hover:scale-110
          "
          style={{
            background: "#FF1E3C",
            boxShadow: "0 8px 24px rgba(255,30,60,0.35)",
          }}
        >
          <span className="text-white text-lg ml-1">▶</span>
        </div>
      </div>

      {/* Category Badge */}
      <span
        className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white ${
          video.category === "F1"
            ? "bg-red-600"
            : video.category === "CRICKET"
            ? "bg-blue-600"
            : video.category === "FOOTBALL"
            ? "bg-green-600"
            : video.category === "TENNIS"
            ? "bg-yellow-500 text-black"
            : "bg-purple-600"
        }`}
      >
        {video.category}
      </span>
    </div>

    {/* Content */}
    <div
      className="p-4 border-t border-[#252a33]"
      style={{
        background:
          "linear-gradient(180deg, #171c24 0%, #12161d 100%)",
      }}
    >
      <h3
        className="
          text-white font-semibold text-sm
          leading-snug line-clamp-2 mb-3
          transition-colors duration-300
          group-hover:text-white
        "
      >
        {video.title}
      </h3>

      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs font-medium truncate">
          {video.channelTitle}
        </span>

        <span
          className="
            text-primary text-xs font-semibold
            flex-shrink-0 ml-2
            transition-transform duration-300
            group-hover:translate-x-1
          "
        >
          Watch →
        </span>
      </div>
    </div>
  </div>
);

// ─── Article Card ─────────────────────────────────────────
const ArticleCard = ({ article }) => (
  
  <a  href={article.link}
    target="_blank"
    rel="noopener noreferrer"
    className="glass rounded-2xl p-4 flex items-start gap-3
               hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 block"
  >
    {article.imageUrl && (
      <img
        src={article.imageUrl}
        alt=""
        className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
      />
    )}
    <div className="flex-1 min-w-0">
      <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
        article.category === 'F1'       ? 'bg-red-500/15 text-red-400'    :
        article.category === 'CRICKET'  ? 'bg-blue-500/15 text-blue-400'  :
        article.category === 'FOOTBALL' ? 'bg-green-500/15 text-green-400':
        article.category === 'TENNIS'   ? 'bg-yellow-500/15 text-yellow-400':
                                          'bg-purple-500/15 text-purple-400'
      }`}>
        {article.source}
      </span>
      <h3 className="text-white text-sm font-semibold leading-snug
                     line-clamp-2 mt-1.5">{article.title}</h3>
      <p className="text-white/35 text-xs mt-1.5">
        {article.publishedAt?.slice(0, 16)}
      </p>
    </div>
  </a>
);

// ─── Video Modal ──────────────────────────────────────────
const VideoModal = ({ video, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backdropFilter: 'blur(24px)',
               WebkitBackdropFilter: 'blur(24px)',
               background: 'rgba(8,9,12,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ background: '#0F1117',
                 border: '1px solid rgba(255,255,255,0.12)',
                 boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac chrome */}
        <div className="flex items-center justify-between px-5 py-3.5"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(0,0,0,0.4)' }}>
          <div className="flex gap-2 group">
            <div onClick={onClose}
                 className="relative w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer
                            flex items-center justify-center">
              <span className="absolute opacity-0 group-hover:opacity-100
                               text-[#800000] text-[8px] font-black transition-opacity">✕</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <p className="text-white/50 text-xs font-semibold truncate max-w-lg mx-4 text-center">
            {video.title}
          </p>
          
          <a  href={`https://youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-white/30 hover:text-primary text-xs font-semibold
                       transition-colors whitespace-nowrap"
          >
            Open in YT →
          </a>
        </div>

        {/* 16:9 video */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media;
                   gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3"
             style={{ borderTop: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(0,0,0,0.3)' }}>
          <span className="text-white/30 text-xs">{video.channelTitle}</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            video.category === 'F1' ? 'bg-primary/15 text-primary' : 'bg-blue-500/15 text-blue-400'
          }`}>
            {video.category}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────
const Skeleton = () => (
  <div className="glass rounded-2xl overflow-hidden animate-pulse">
    <div className="w-full h-44 bg-white/5" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
    </div>
  </div>
);

// ─── Main Feed ────────────────────────────────────────────
const Feed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const page = parseInt(searchParams.get('page') || '0');

  // Video state
  const [videos, setVideos] = useState([]);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  // Article state
  const [allArticles, setAllArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [articlePage, setArticlePage] = useState(0);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const observerRef = useRef(null);
  const [userGenres, setUserGenres] = useState([]);
  const [genresLoaded, setGenresLoaded] = useState(false);
  // ── Load videos based on active tab ──────────────────────
  const loadVideos = useCallback(async (currentTab, pageNum) => {
    setVideosLoading(true);
    try {
      let res;
      if (currentTab === 'random') {
        // Random: no pagination, just a shuffled mix
        res = await getRandomFeed(18);
        setHasMoreVideos(false);
      } else if (currentTab === 'all') {
        // All: user's genre videos, paginated
        res = await getFeed(pageNum, 18);
        setHasMoreVideos(res.data.length === 18);
      } else {
        // Specific sport: always starts at page 0 for that sport
        res = await getVideosByCategory(currentTab, pageNum, 18);
        setHasMoreVideos(res.data.length === 18);
      }
      setVideos(res.data);
    } catch (err) {
      console.error('Video load error:', err);
    } finally {
      setVideosLoading(false);
    }
  }, []);

  useEffect(() => {
  getProfile()
    .then(res => {
      setUserGenres(res.data?.genres || []);
      setGenresLoaded(true);
    })
    .catch(() => setGenresLoaded(true));
}, []);

// Redirect if on a sport tab user doesn't follow
useEffect(() => {
  if (!genresLoaded) return;
  const sportTabs = ['F1', 'CRICKET', 'FOOTBALL', 'TENNIS', 'BADMINTON'];
  if (sportTabs.includes(tab) && !userGenres.includes(tab)) {
    setSearchParams({ tab: 'all', page: '0' });
  }
}, [genresLoaded, userGenres, tab]);

// Filter visible tabs
const visibleTabs = TABS.filter(t =>
  t.key === 'all' ||
  t.key === 'random' ||
  userGenres.includes(t.key)
);

  // ── Load articles once on mount ───────────────────────────
  const loadArticles = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const res = await getArticlesFeed();
      const sorted = res.data.sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      );
      setAllArticles(sorted);
      setArticles(sorted.slice(0, ARTICLES_PER_PAGE));
      setHasMoreArticles(sorted.length > ARTICLES_PER_PAGE);
    } catch (err) {
      console.error('Articles load error:', err);
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  // ── On mount: load articles once ─────────────────────────
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // ── Reload videos when tab or page changes ────────────────
  useEffect(() => {
    loadVideos(tab, page);
    // Reset article page when tab changes
    setArticlePage(0);
  }, [tab, page, loadVideos]);

  // ── Filter articles when tab changes ─────────────────────
  useEffect(() => {
    if (allArticles.length === 0) return;
    const filtered = filterArticles(allArticles, tab);
    setArticles(filtered.slice(0, ARTICLES_PER_PAGE));
    setHasMoreArticles(filtered.length > ARTICLES_PER_PAGE);
    setArticlePage(0);
  }, [tab, allArticles]);

  // ── Infinite scroll for articles ─────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!hasMoreArticles || articlesLoading) return;

        const filtered = filterArticles(allArticles, tab);
        const next = articlePage + 1;
        const nextBatch = filtered.slice(
          next * ARTICLES_PER_PAGE,
          (next + 1) * ARTICLES_PER_PAGE
        );
        if (nextBatch.length === 0) return;

        setArticles(prev => [...prev, ...nextBatch]);
        setArticlePage(next);
        setHasMoreArticles(
          (next + 1) * ARTICLES_PER_PAGE < filtered.length
        );
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMoreArticles, articlesLoading, articlePage, allArticles, tab]);

  // ── Tab change ────────────────────────────────────────────
  const handleTabChange = (newTab) => {
    // Reset to page 0 when switching tabs
    setSearchParams({ tab: newTab, page: '0' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Pagination handlers ───────────────────────────────────
  const goToPage = (newPage) => {
    setSearchParams({ tab, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageWrapper beam="feed">

      {/* Video modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-3xl font-black tracking-tight text-white">Your Feed</h1>
          </div>
          <p className="text-white/40 text-sm font-medium ml-4">
            Videos and news from your favourite sports
          </p>
        </div>

        {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap
                      transition-all ${
              tab === t.key
                ? 'bg-primary text-white shadow-lg'
                : 'glass text-white/50 hover:text-white hover:border-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

        {/* ── VIDEOS ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white tracking-tight">
  {tab === 'all'    ? 'Latest Videos' :
   tab === 'random' ? 'Random Mix'    :
   `${visibleTabs.find(t => t.key === tab)?.label || tab} Videos`}
</h2>
            {!videosLoading && (
              <span className="text-white/30 text-xs font-semibold">
                {videos.length} videos
              </span>
            )}
          </div>

          {videosLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : videos.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center">
              <p className="text-4xl mb-3">📺</p>
              <p className="text-white/40 text-sm font-medium">
                No videos found for this sport yet
              </p>
              <p className="text-white/20 text-xs mt-1">
                Content updates every 6 hours
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-4">
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
              ))}
            </div>
          )}

          {/* Pagination — hidden for random tab */}
          {tab !== 'random' && !videosLoading && videos.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => goToPage(0)}
                disabled={page === 0}
                className="px-3 py-2 glass rounded-xl text-white/40 hover:text-white
                           text-sm font-semibold transition-all disabled:opacity-30"
              >«</button>
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 glass rounded-xl text-white/40 hover:text-white
                           text-sm font-semibold transition-all disabled:opacity-30"
              >← Prev</button>
              <span className="px-5 py-2 bg-primary text-white text-sm
                               font-bold rounded-xl">
                Page {page + 1}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={!hasMoreVideos}
                className="px-4 py-2 glass rounded-xl text-white/40 hover:text-white
                           text-sm font-semibold transition-all disabled:opacity-30"
              >Next →</button>
            </div>
          )}

          {/* Random tab refresh */}
          {tab === 'random' && !videosLoading && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => loadVideos('random', 0)}
                className="glass px-6 py-2.5 rounded-xl text-white/60 hover:text-white
                           text-sm font-semibold transition-all hover:border-white/20"
              >
                 Shuffle again
              </button>
            </div>
          )}
        </div>

        {/* ── ARTICLES ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white tracking-tight">
              {tab === 'all' || tab === 'random'
                ? 'Latest News'
                : `${visibleTabs.find(t => t.key === tab)?.label || tab} News`}
            </h2>
            <span className="text-white/30 text-xs font-semibold">
              {articles.length} of {filterArticles(allArticles, tab).length}
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center">
              <p className="text-4xl mb-3">📰</p>
              <p className="text-white/40 text-sm font-medium">No articles found</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map((a, i) => (
                  <ArticleCard key={`${a.id}-${i}`} article={a} />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={observerRef} className="py-10 flex justify-center">
                {articlesLoading && (
                  <div className="flex items-center gap-3 text-white/40 text-sm">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent
                                    rounded-full animate-spin" />
                    Loading more...
                  </div>
                )}
                {!hasMoreArticles && articles.length > 0 && (
                  <div className="glass px-5 py-2 rounded-full">
                    <p className="text-white/25 text-xs font-semibold">
                      All articles loaded
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </PageWrapper>
  );
};

export default Feed;