import { useState, useEffect } from 'react';
import { getTrendingAnime, searchAnime } from '../services/anilist';
import AnimeCard from '../components/AnimeCard';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch anime (trending or search)
  const fetchAnime = async (pageNum = 1, query = '') => {
    try {
      setIsLoading(true);
      setError(null);

      let result;
      if (query) {
        result = await searchAnime(query, pageNum, 20);
      } else {
        result = await getTrendingAnime(pageNum, 20);
      }

      if (pageNum === 1) {
        setAnimeList(result.media);
      } else {
        setAnimeList(prev => [...prev, ...result.media]);
      }

      setHasMore(result.pageInfo.hasNextPage);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching anime:', err);
      setError('Failed to load anime. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load - trending anime
  useEffect(() => {
    fetchAnime(1, '');
  }, []);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchAnime(1, query);
  };

  // Load more
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchAnime(page + 1, searchQuery);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {searchQuery ? `Search Results: "${searchQuery}"` : 'Trending Anime'}
        </h1>
        <p className="text-gray-400">
          {searchQuery 
            ? `Found ${animeList.length} results` 
            : 'Discover the most popular anime'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State (first load) */}
      {isLoading && page === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-700 rounded-lg mb-3" />
              <div className="h-4 bg-gray-700 rounded mb-2" />
              <div className="h-3 bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Anime Grid */}
      {!isLoading || page > 1 ? (
        <>
          {animeList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {animeList.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {searchQuery 
                  ? 'No anime found. Try a different search term.' 
                  : 'No anime available.'}
              </p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && animeList.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Home;