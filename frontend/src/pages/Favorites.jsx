import { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/api';
import AnimeCard from '../components/AnimeCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data } = await favoritesAPI.getAll();
        
        // Transform favorites to anime format for AnimeCard
        const transformedFavorites = data.data.map(fav => ({
          id: fav.animeId,
          title: {
            english: fav.title,
            romaji: fav.title
          },
          coverImage: {
            large: fav.coverImage,
            medium: fav.coverImage
          },
          averageScore: fav.averageScore,
          genres: fav.genres || [],
          episodes: fav.episodes,
          status: fav.status,
          description: `Added to favorites on ${new Date(fav.createdAt).toLocaleDateString()}`
        }));

        setFavorites(transformedFavorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Handle favorite removed (callback from AnimeCard)
  const handleFavoriteRemoved = (animeId) => {
    setFavorites(prev => prev.filter(anime => anime.id !== animeId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          My Favorites
        </h1>
        <p className="text-gray-400">
          {favorites.length > 0 
            ? `You have ${favorites.length} favorite anime` 
            : 'Start adding anime to your favorites'}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-700 rounded-lg mb-3" />
              <div className="h-4 bg-gray-700 rounded mb-2" />
              <div className="h-3 bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Favorites Grid */}
      {!isLoading && (
        <>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {favorites.map((anime) => (
                <AnimeCard 
                  key={anime.id} 
                  anime={anime}
                  onFavoriteChange={() => handleFavoriteRemoved(anime.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-400 mb-6">
                Browse anime and click the heart icon to add favorites
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Browse Anime
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;