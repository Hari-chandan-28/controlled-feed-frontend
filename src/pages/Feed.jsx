import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFeed, getArticlesFeed } from '../services/api';
import PageWrapper from '../components/PageWrapper';

const ARTICLES_PER_PAGE = 20;

const filterArticlesByTab = (articles, currentTab) => {
  if (currentTab === 'cricket') return articles.filter(a => a.category === 'CRICKET');
  if (currentTab === 'f1') return articles.filter(a => a.category === 'F1');
  return articles;
};

// ─── Video Card ───────────────────────────────────────────
const VideoCard = ({ video }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="glass rounded-2xl overflow-hidden hover:border-white/15
                    transition-all hover:-translate-y-0.5 duration-200">
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
            <img src={video.thumbnailUrl} alt={video.title}
                 className="w-full h-44 object-cover" />
            <div className="absolute inset-0 flex items-center justify-center
                            bg-black/30 group-hover:bg-black/50 transition-all">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center
                              justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white text-lg ml-1">▶</span>
              </div>
            </div>
            <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg
                             text-xs font-bold backdrop-blur-sm
                             ${video.category === 'F1'
                               ? 'bg-primary/80 text-white'
                               : 'bg-blue-500/80 text-white'}`}>
              {video.category === 'F1' ? 'F1' : 'Cricket'}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-snug mb-3
                       line-clamp-2">{video.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs font-medium">{video.channelTitle}</span>
          <a href={`https://youtube.com/watch?v=${video.videoId}`}
             target="_blank" rel="noopener noreferrer"
             className="text-primary text-xs font-semibold hover:text-white
                        transition-colors">
            Watch →
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Article Card ─────────────────────────────────────────
const ArticleCard = ({ article }) => (
  <a href={article.link} target="_blank" rel="noopener noreferrer"
     className="glass rounded-2xl p-4 flex items-start gap-3 hover:border-white/15
                transition-all hover:-translate-y-0.5 duration-200 block">
    {article.imageUrl && (
      <img src={article.imageUrl} alt=""
           className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
        article.category === 'F1'
          ? 'bg-primary/15 text-primary'
          : 'bg-blue-500/15 text-blue-400'
      }`}>
        {article.source}
      </span>
      <h3 className="text-white text-sm font-semibold leading-snug
                     line-clamp-2 mt-1.5">{article.title}</h3>
      <p className="text-white/35 text-xs mt-1.5 font-medium">
        {article.publishedAt?.slice(0, 16)}
      </p>
    </div>
  </a>
);

// ─── Loading Skeleton ─────────────────────────────────────
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

  const [videos, setVideos] = useState([]);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [loading, setLoading] = useState(true);

  const [allArticles, setAllArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [articlePage, setArticlePage] = useState(0);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [loadingMoreArticles, setLoadingMoreArticles] = useState(false);
  const articleObserverRef = useRef(null);

  const loadFeed = useCallback(async (pageNum = 0) => {
    try {
      const res = await getFeed(pageNum, 20);
      setVideos(res.data);
      setHasMoreVideos(res.data.length === 20);
    } catch (err) {
      console.error('Feed error:', err);
    }
  }, []);

  const loadArticles = useCallback(async (source = [], currentTab = 'all', pageNum = 0, append = false) => {
    if (!append) setLoadingMoreArticles(false);
    else setLoadingMoreArticles(true);
    try {
      let all = source;
      if (source.length === 0) {
        const res = await getArticlesFeed();
        all = res.data;
        all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        setAllArticles(all);
      }
      const filtered = filterArticlesByTab(all, currentTab);
      const start = pageNum * ARTICLES_PER_PAGE;
      const end = start + ARTICLES_PER_PAGE;
      const pageArticles = filtered.slice(start, end);
      if (append) setArticles(prev => [...prev, ...pageArticles]);
      else setArticles(pageArticles);
      setHasMoreArticles(end < filtered.length);
    } catch (err) {
      console.error('Articles error:', err);
    } finally {
      setLoadingMoreArticles(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadFeed(page), loadArticles([], tab, 0, false)]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (allArticles.length === 0) return;
    setArticlePage(0);
    const filtered = filterArticlesByTab(allArticles, tab);
    setArticles(filtered.slice(0, ARTICLES_PER_PAGE));
    setHasMoreArticles(filtered.length > ARTICLES_PER_PAGE);
  }, [tab, allArticles]);

  useEffect(() => { loadFeed(page); }, [page, loadFeed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreArticles && !loadingMoreArticles) {
          const next = articlePage + 1;
          setArticlePage(next);
          const filtered = filterArticlesByTab(allArticles, tab);
          const start = next * ARTICLES_PER_PAGE;
          const end = start + ARTICLES_PER_PAGE;
          setArticles(prev => [...prev, ...filtered.slice(start, end)]);
          setHasMoreArticles(end < filtered.length);
        }
      },
      { threshold: 0.1 }
    );
    if (articleObserverRef.current) observer.observe(articleObserverRef.current);
    return () => observer.disconnect();
  }, [hasMoreArticles, loadingMoreArticles, articlePage, allArticles, tab]);

  const handleTabChange = (newTab) => setSearchParams({ tab: newTab, page: '0' });

  const filteredVideos = tab === 'cricket'
    ? videos.filter(v => v.category === 'CRICKET')
    : tab === 'f1'
      ? videos.filter(v => v.category === 'F1')
      : videos;

  const tabs = [
    { key: 'all',     label: 'All' },
    { key: 'f1',      label: 'F1' },
    { key: 'cricket', label: 'Cricket' },
    { key: 'news',    label: 'News' },
  ];

  if (loading) return (
    <PageWrapper beam="feed">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="h-8 bg-white/5 rounded-xl w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-72 animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
        </div>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper beam="feed">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">
            Your Feed
          </h1>
          <p className="text-white/40 text-sm font-medium">
            Personalized content from your favourite sports
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
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
        {tab !== 'news' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white tracking-tight">
                Latest Videos
              </h2>
              <span className="text-white/30 text-xs font-semibold">
                {filteredVideos.length} videos
              </span>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="glass rounded-2xl py-16 text-center">
                <p className="text-4xl mb-3"></p>
                <p className="text-white/40 text-sm font-medium">No videos found</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredVideos.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => { setSearchParams({ tab, page: '0' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 0}
                className="px-3 py-2 glass rounded-xl text-white/40 hover:text-white
                           text-sm font-semibold transition-all disabled:opacity-30"
              >«</button>
              <button
                onClick={() => { setSearchParams({ tab, page: String(page - 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 0}
                className="px-4 py-2 glass rounded-xl text-white/40 hover:text-white
                           text-sm font-semibold transition-all disabled:opacity-30"
              >← Prev</button>
              <span className="px-5 py-2 bg-primary text-white text-sm
                               font-bold rounded-xl">
                Page {page + 1}
              </span>
              <button
                onClick={() => { setSearchParams({ tab, page: String(page + 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={!hasMoreVideos}
                className="px-4 py-2 glass rounded-xl text-white/40 hover:text-white
                           text-sm font-semibold transition-all disabled:opacity-30"
              >Next →</button>
            </div>
          </div>
        )}

        {/* ── ARTICLES ── */}
        {tab !== 'videos' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white tracking-tight">
                {tab === 'f1' ? 'F1 News' : tab === 'cricket' ? 'Cricket News' : 'Latest News'}
              </h2>
              <span className="text-white/30 text-xs font-semibold">
                {articles.length} of {filterArticlesByTab(allArticles, tab).length}
              </span>
            </div>

            {articles.length === 0 ? (
              <div className="glass rounded-2xl py-16 text-center">
                <p className="text-4xl mb-3"></p>
                <p className="text-white/40 text-sm font-medium">No articles found</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles.map((a, i) => (
                    <ArticleCard key={`${a.id}-${i}`} article={a} />
                  ))}
                </div>

                <div ref={articleObserverRef} className="py-10 flex justify-center">
                  {loadingMoreArticles && (
                    <div className="flex items-center gap-3 text-white/40 text-sm font-medium">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent
                                      rounded-full animate-spin" />
                      Loading more...
                    </div>
                  )}
                  {!hasMoreArticles && articles.length > 0 && (
                    <div className="glass px-5 py-2.5 rounded-full">
                      <p className="text-white/30 text-xs font-semibold">
                        All articles loaded
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
};

export default Feed;