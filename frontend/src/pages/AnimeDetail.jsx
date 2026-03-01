import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnimeDetails } from '../services/anilist';
import { favoritesAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

const AnimeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [anime, setAnime] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch anime details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch anime details
        const animeData = await getAnimeDetails(id);
        setAnime(animeData);

        // Check if favorited
        if (user) {
          const { data } = await favoritesAPI.check(id);
          setIsFavorite(data.isFavorite);
        }
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user) return;

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        await favoritesAPI.removeByAnimeId(anime.id);
        setIsFavorite(false);
      } else {
        const title = anime.title.english || anime.title.romaji;
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
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-700 rounded-lg mb-6" />
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !anime) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error || 'Anime not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;
  const description = anime.description?.replace(/<[^>]*>/g, '') || 'No description available.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Banner */}
      {anime.bannerImage && (
        <div className="relative h-64 rounded-lg overflow-hidden mb-6">
          <img
            src={anime.bannerImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Cover & Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <img
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt={title}
              className="w-full rounded-lg shadow-2xl mb-4"
            />

            {/* Favorite Button */}
            {user && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isFavorite
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {favoriteLoading ? 'Loading...' : isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
              </button>
            )}

            {/* Stats */}
            <div className="mt-4 space-y-2 text-sm">
              {anime.averageScore && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Score</span>
                  <span className="text-white font-semibold">{anime.averageScore}%</span>
                </div>
              )}
              {anime.episodes && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Episodes</span>
                  <span className="text-white">{anime.episodes}</span>
                </div>
              )}
              {anime.status && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white">{anime.status}</span>
                </div>
              )}
              {anime.format && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Format</span>
                  <span className="text-white">{anime.format}</span>
                </div>
              )}
              {anime.seasonYear && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Year</span>
                  <span className="text-white">{anime.seasonYear}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - Details */}
        <div className="lg:col-span-2">
          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            {title}
          </h1>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Studios */}
          {anime.studios?.nodes && anime.studios.nodes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-2">Studio</h3>
              <p className="text-white">
                {anime.studios.nodes.map(s => s.name).join(', ')}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-3">Synopsis</h3>
            <p className="text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Comments Section */}
          <CommentSection animeId={parseInt(id)} animeTitle={title} />
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;