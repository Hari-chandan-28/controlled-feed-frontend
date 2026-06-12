import  { useState, useEffect, useCallback } from 'react';
import { getFeed, getF1Articles, getCricketArticles } from '../services/api';

// Single video card component
const VideoCard = ({ video }) => (
  <div className="card-hover bg-card border border-border rounded-xl overflow-hidden">
    {/* Thumbnail */}
    {video.thumbnailUrl && (
      <div className="relative">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-44 object-cover"
        />
        {/* Category badge */}
        <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
          video.category === 'F1'
            ? 'bg-primary text-white'
            : 'bg-blue-600 text-white'
        }`}>
          {video.category === 'F1' ? '🏎️ F1' : '🏏 Cricket'}
        </span>
      </div>
    )}
    <div className="p-4">
      <h3 className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2">
        {video.title}
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs">{video.channelTitle}</span>
        <span className="text-muted text-xs">{video.publishedAt?.slice(0, 10)}</span>
      </div>
    </div>
  </div>
);

// Single article card component
const ArticleCard = ({ article }) => (
  <a
    href={article.link}
    target="_blank"
    rel="noopener noreferrer"
    className="card-hover block bg-card border border-border rounded-xl p-4"
  >
    
    <div className="flex items-start gap-3">
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt=""
          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
          article.category === 'F1'
            ? 'bg-primary/20 text-primary'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {article.source}
        </span>
        <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 mt-1">
          {article.title}
        </h3>
        <p className="text-muted text-xs mt-1">{article.publishedAt?.slice(0, 16)}</p>
      </div>
    </div>
  </a>
);

const Feed = () => {
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState('all');

  // Load videos from feed API
  const loadFeed = useCallback(async (pageNum = 0) => {
    try {
      const res = await getFeed(pageNum, 12);
      if (pageNum === 0) setVideos(res.data);
      else setVideos((prev) => [...prev, ...res.data]);
      if (res.data.length < 12) setHasMore(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Load articles from RSS
  const loadArticles = useCallback(async () => {
    try {
      const [f1Res, cricketRes] = await Promise.all([
        getF1Articles(),
        getCricketArticles()
      ]);
      setArticles([...f1Res.data, ...cricketRes.data].slice(0, 20));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Load everything on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadFeed(0), loadArticles()]);
      setLoading(false);
    };
    init();
  }, [loadFeed, loadArticles]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadFeed(next);
  };

  // Filter based on active tab
  const filteredVideos = tab === 'cricket'
    ? videos.filter(v => v.category === 'CRICKET')
    : tab === 'f1'
    ? videos.filter(v => v.category === 'F1')
    : videos;

  const filteredArticles = tab === 'cricket'
    ? articles.filter(a => a.category === 'CRICKET')
    : tab === 'f1'
    ? articles.filter(a => a.category === 'F1')
    : articles;

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

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wider text-white">YOUR FEED</h1>
          <p className="text-muted text-sm mt-1">Personalized content from your favorite sports</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'all', label: 'All' },
            { key: 'f1', label: '🏎️ F1' },
            { key: 'cricket', label: '🏏 Cricket' },
            { key: 'news', label: '📰 News Only' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
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

        {/* Videos section */}
        {tab !== 'news' && (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">Latest Videos</h2>
            {filteredVideos.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <p className="text-4xl mb-3">📺</p>
                <p>No videos found.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {filteredVideos.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            )}
            {hasMore && (
              <div className="text-center mb-12">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 border border-border text-muted hover:border-primary hover:text-primary rounded-lg transition-all text-sm"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

        {/* Articles section */}
        {tab !== 'f1' && tab !== 'cricket' ? (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">Latest News</h2>
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <p className="text-4xl mb-3">📰</p>
                <p>No articles found.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">Latest News</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Feed;