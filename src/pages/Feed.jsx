import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFeed, getArticlesFeed } from '../services/api';

const ARTICLES_PER_PAGE = 20;

// ─── Filter helper ────────────────────────────────────────
const filterArticlesByTab = (articles, currentTab) => {
  if (currentTab === 'cricket') return articles.filter(a => a.category === 'CRICKET');
  if (currentTab === 'f1') return articles.filter(a => a.category === 'F1');
  return articles;
};

// ─── Video Card ───────────────────────────────────────────
const VideoCard = ({ video }) => {
  const [playing, setPlaying] = useState(false);
  return (
      <div className="card-hover bg-card border border-border rounded-xl overflow-hidden">
        <div className="relative">
          {playing ? (
              <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                  className="w-full h-44"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  allowFullScreen
                  title={video.title}
              />
          ) : (
              <div className="relative cursor-pointer group" onClick={() => setPlaying(true)}>
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-44 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-lg ml-1">▶</span>
                  </div>
                </div>
                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                    video.category === 'F1' ? 'bg-primary text-white' : 'bg-blue-600 text-white'
                }`}>
              {video.category === 'F1' ? '🏎️ F1' : '🏏 Cricket'}
            </span>
              </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2">{video.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">{video.channelTitle}</span>

          <a  href={`https://youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-xs hover:underline"
            >
            Watch on YT →
          </a>
        </div>
      </div>
</div>
);
};

// ─── Article Card ─────────────────────────────────────────
const ArticleCard = ({ article }) => (

   <a href={article.link}
target="_blank"
rel="noopener noreferrer"
className="card-hover block bg-card border border-border rounded-xl p-4"
    >
    <div className="flex items-start gap-3">
    {article.imageUrl && (
          <img src={article.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
      )}
<div className="flex-1 min-w-0">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
            article.category === 'F1' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {article.source}
        </span>
  <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 mt-1">{article.title}</h3>
  <p className="text-muted text-xs mt-1">{article.publishedAt?.slice(0, 16)}</p>
</div>
</div>
</a>
);

// ─── Main Feed ────────────────────────────────────────────
const Feed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const page = parseInt(searchParams.get('page') || '0');

  // Video states
  const [videos, setVideos] = useState([]);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [loading, setLoading] = useState(true);

  // Article states
  const [allArticles, setAllArticles] = useState([]);  // ALL articles never cleared
  const [articles, setArticles] = useState([]);         // visible articles
  const [articlePage, setArticlePage] = useState(0);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [loadingMoreArticles, setLoadingMoreArticles] = useState(false);
  const articleObserverRef = useRef(null);

  // ─── Load Videos ───────────────────────────────────────
  const loadFeed = useCallback(async (pageNum = 0) => {
    try {
      const res = await getFeed(pageNum, 20);
      setVideos(res.data);
      setHasMoreVideos(res.data.length === 20);
    } catch (err) {
      console.error('Feed error:', err);
    }
  }, []);

  // ─── Load Articles ─────────────────────────────────────
  const loadArticles = useCallback(async (source = [], currentTab = 'all', pageNum = 0, append = false) => {
    if (!append) setLoadingMoreArticles(false);
    else setLoadingMoreArticles(true);

    try {
      let all = source;

      // Fetch only on first load
      if (source.length === 0) {
        const res = await getArticlesFeed();
        all = res.data;
        all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        setAllArticles(all);
      }

      // Filter by tab
      const filtered = filterArticlesByTab(all, currentTab);
      const start = pageNum * ARTICLES_PER_PAGE;
      const end = start + ARTICLES_PER_PAGE;
      const pageArticles = filtered.slice(start, end);

      if (append) {
        setArticles(prev => [...prev, ...pageArticles]);
      } else {
        setArticles(pageArticles);
      }

      setHasMoreArticles(end < filtered.length);
    } catch (err) {
      console.error('Articles error:', err);
    } finally {
      setLoadingMoreArticles(false);
    }
  }, []);

  // ─── Initial Load ──────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadFeed(page),
        loadArticles([], tab, 0, false)
      ]);
      setLoading(false);
    };
    init();
  }, []); // only on mount

  // ─── When Tab Changes ──────────────────────────────────
  useEffect(() => {
    if (allArticles.length === 0) return; // not loaded yet
    setArticlePage(0);
    const filtered = filterArticlesByTab(allArticles, tab);
    const pageArticles = filtered.slice(0, ARTICLES_PER_PAGE);
    setArticles(pageArticles);
    setHasMoreArticles(filtered.length > ARTICLES_PER_PAGE);
  }, [tab, allArticles]);

  // ─── When Page Changes (videos) ────────────────────────
  useEffect(() => {
    loadFeed(page);
  }, [page, loadFeed]);

  // ─── Infinite Scroll for Articles ─────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreArticles && !loadingMoreArticles) {
            const next = articlePage + 1;
            setArticlePage(next);
            const filtered = filterArticlesByTab(allArticles, tab);
            const start = next * ARTICLES_PER_PAGE;
            const end = start + ARTICLES_PER_PAGE;
            const nextArticles = filtered.slice(start, end);
            setArticles(prev => [...prev, ...nextArticles]);
            setHasMoreArticles(end < filtered.length);
          }
        },
        { threshold: 0.1 }
    );
    if (articleObserverRef.current) observer.observe(articleObserverRef.current);
    return () => observer.disconnect();
  }, [hasMoreArticles, loadingMoreArticles, articlePage, allArticles, tab]);

  // ─── Tab Change Handler ────────────────────────────────
  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab, page: '0' });
    // article filtering handled by useEffect above
  };

  // ─── Filter Videos by Tab ─────────────────────────────
  const filteredVideos = tab === 'cricket'
      ? videos.filter(v => v.category === 'CRICKET')
      : tab === 'f1'
          ? videos.filter(v => v.category === 'F1')
          : videos;

  if (loading) return (
      <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">Loading your feed...</p>
        </div>
      </div>
  );

  return (
      <div className="min-h-screen bg-dark pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display tracking-wider text-white">YOUR FEED</h1>
            <p className="text-muted text-sm mt-1">Personalized content from your favorite sports</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { key: 'all', label: 'All' },
              { key: 'f1', label: '🏎️ F1' },
              { key: 'cricket', label: '🏏 Cricket' },
              { key: 'news', label: '📰 News Only' },
            ].map((t) => (
                <button
                    key={t.key}
                    onClick={() => handleTabChange(t.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tab === t.key
                            ? 'bg-primary text-white'
                            : 'bg-surface text-muted hover:text-white border border-border'
                    }`}
                >
                  {t.label}
                </button>
            ))}
          </div>

          {/* ── VIDEOS SECTION ── */}
          {tab !== 'news' && (
              <>
                <h2 className="text-lg font-semibold text-white mb-4">Latest Videos</h2>
                {filteredVideos.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                      <p className="text-4xl mb-3">📺</p>
                      <p>No videos found.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-3 gap-4 mb-6">
                      {filteredVideos.map((v) => <VideoCard key={v.id} video={v} />)}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-6 mb-12">
                  <button
                      onClick={() => { setSearchParams({ tab, page: '0' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={page === 0}
                      className="px-3 py-2 border border-border text-muted hover:border-primary hover:text-primary rounded-lg transition-all text-sm disabled:opacity-30"
                  >«</button>
                  <button
                      onClick={() => { setSearchParams({ tab, page: String(page - 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={page === 0}
                      className="px-4 py-2 border border-border text-muted hover:border-primary hover:text-primary rounded-lg transition-all text-sm disabled:opacity-30"
                  >← Prev</button>
                  <span className="px-5 py-2 bg-primary text-white text-sm rounded-lg font-medium">
                Page {page + 1}
              </span>
                  <button
                      onClick={() => { setSearchParams({ tab, page: String(page + 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={!hasMoreVideos}
                      className="px-4 py-2 border border-border text-muted hover:border-primary hover:text-primary rounded-lg transition-all text-sm disabled:opacity-30"
                  >Next →</button>
                </div>
              </>
          )}

          {/* ── ARTICLES SECTION ── */}
          {tab !== 'videos' && (
              <>
                <h2 className="text-lg font-semibold text-white mb-4">
                  {tab === 'f1' ? '🏎️ F1 News' :
                      tab === 'cricket' ? '🏏 Cricket News' :
                          '📰 Latest News'}
                  <span className="ml-2 text-muted text-sm font-normal">
                ({articles.length} of {filterArticlesByTab(allArticles, tab).length})
              </span>
                </h2>

                {articles.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                      <p className="text-4xl mb-3">📰</p>
                      <p>No articles found.</p>
                    </div>
                ) : (
                    <>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {articles.map((a, i) => (
                            <ArticleCard key={`${a.id}-${i}`} article={a} />
                        ))}
                      </div>

                      {/* Infinite scroll trigger */}
                      <div ref={articleObserverRef} className="py-8 flex justify-center">
                        {loadingMoreArticles && (
                            <div className="flex items-center gap-3 text-muted text-sm">
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Loading more articles...
                            </div>
                        )}
                        {!hasMoreArticles && articles.length > 0 && (
                            <p className="text-muted text-sm">✅ All articles loaded</p>
                        )}
                      </div>
                    </>
                )}
              </>
          )}

        </div>
      </div>
  );
};

export default Feed;