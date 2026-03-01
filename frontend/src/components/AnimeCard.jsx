import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AnimeCard = ({ anime, onFavoriteChange }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get display title (prefer English, fallback to Romaji)
  const title = anime.title.english || anime.title.romaji;
  
  // Truncate description
  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'No description available.';
    const cleaned = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return cleaned.length > maxLength 
      ? cleaned.substring(0, maxLength) + '...' 
      : cleaned;
  };

  // Check if anime is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      
      try {
        const { data } = await favoritesAPI.check(anime.id);
        setIsFavorite(data.isFavorite);
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavorite();
  }, [anime.id, user]);

  // Toggle favorite
  const handleFavorite = async (e) => {
    e.preventDefault(); // Prevent Link navigation
    
    if (!user) return;
    
    setIsLoading(true);

    try {
      if (isFavorite) {
        await favoritesAPI.removeByAnimeId(anime.id);
        setIsFavorite(false);
        // ✅ Notify parent component
        if (onFavoriteChange) {
          onFavoriteChange(anime.id, false);
        }
      } else {
        await favoritesAPI.add({
          animeId: anime.id,
          title,
          coverImage: anime.coverImage.large,
          averageScore: anime.averageScore,
          genres: anime.genres,
          episodes: anime.episodes,
          status: anime.status
        });
        setIsFavorite(true);
        // ✅ Notify parent component
        if (onFavoriteChange) {
          onFavoriteChange(anime.id, true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link 
      to={`/anime/${anime.id}`}
      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200"
    >
      {/* Cover Image */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-700">
        <img
          src={anime.coverImage.large}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-white mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Score & Genres */}
        <div className="flex items-center gap-2 mb-2">
          {anime.averageScore && (
            <span className="flex items-center gap-1 text-sm">
              <span className="text-yellow-400">⭐</span>
              <span className="text-gray-300">{anime.averageScore}%</span>
            </span>
          )}
          {anime.genres && anime.genres.length > 0 && (
            <span className="text-sm text-gray-400">
              • {anime.genres[0]}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-2">
          {truncateText(anime.description)}
        </p>

        {/* Favorite Button */}
        {user && (
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite 
                ? 'bg-red-500/80 hover:bg-red-600/80' 
                : 'bg-gray-900/50 hover:bg-gray-900/70'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg
              className="w-5 h-5"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Status Badge */}
      {anime.status && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/80 text-white backdrop-blur-sm">
            {anime.status}
          </span>
        </div>
      )}
    </Link>
  );
};

export default AnimeCard;