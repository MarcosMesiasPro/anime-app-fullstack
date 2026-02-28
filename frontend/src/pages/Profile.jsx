import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AnimeCard from '../components/AnimeCard';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = currentUser?._id === id;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data } = await userAPI.getProfile(id);
        
        setProfile(data.data.user);
        
        // Transform favorites for AnimeCard
        const transformedFavorites = data.data.recentFavorites.map(fav => ({
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
          description: ''
        }));

        setFavorites(transformedFavorites);
        setComments(data.data.recentComments);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-700 rounded-lg mb-6" />
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error || 'Profile not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

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

      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">
                {profile.name}
              </h1>
              
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            <p className="text-gray-400 mb-4">
              {profile.email}
            </p>

            {profile.bio && (
              <p className="text-gray-300 mb-4">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6">
              <div>
                <span className="text-2xl font-bold text-white">
                  {favorites.length}
                </span>
                <span className="text-gray-400 ml-2">Favorites</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">
                  {comments.length}
                </span>
                <span className="text-gray-400 ml-2">Comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-4 px-1 border-b-2 transition ${
              activeTab === 'favorites'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-4 px-1 border-b-2 transition ${
              activeTab === 'comments'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Comments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {favorites.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
              
              {favorites.length >= 6 && (
                <div className="mt-8 text-center">
                  <Link
                    to={`/users/${id}/favorites`}
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    View All Favorites
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {isOwnProfile ? "You haven't added any favorites yet" : "No favorites yet"}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div>
          {comments.length > 0 ? (
            <>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-gray-800 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        to={`/anime/${comment.animeId}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        {comment.animeTitle}
                      </Link>
                      <span className="text-sm text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                        {comment.isEdited && ' (edited)'}
                      </span>
                    </div>
                    <p className="text-gray-300">
                      {comment.text}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{comment.likesCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>

              {comments.length >= 10 && (
                <div className="mt-8 text-center">
                  <Link
                    to={`/users/${id}/comments`}
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    View All Comments
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {isOwnProfile ? "You haven't posted any comments yet" : "No comments yet"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;