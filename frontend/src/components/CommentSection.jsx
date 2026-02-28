import { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ animeId, animeTitle }) => {
  const { user } = useAuth();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [animeId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data } = await commentsAPI.getByAnime(animeId);
      setComments(data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { data } = await commentsAPI.create({
        animeId,
        animeTitle,
        text: newComment.trim()
      });

      setComments(prev => [data.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing
  const handleStartEdit = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
  };

  // Save edit
  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const { data } = await commentsAPI.update(commentId, editText.trim());
      
      setComments(prev =>
        prev.map(c => c._id === commentId ? data.data : c)
      );
      
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await commentsAPI.delete(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  // Toggle like
  const handleToggleLike = async (commentId) => {
    if (!user) return;

    try {
      const { data } = await commentsAPI.toggleLike(commentId);
      
      setComments(prev =>
        prev.map(c => {
          if (c._id === commentId) {
            return {
              ...c,
              likesCount: data.data.likesCount,
              userLiked: data.data.liked
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-400">
              {newComment.length}/500
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg text-center text-gray-400">
          Sign in to leave a comment
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="p-4 bg-gray-900 rounded-lg"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <Link
                      to={`/profile/${comment.user._id}`}
                      className="text-sm font-semibold text-white hover:text-blue-400 transition"
                    >
                      {comment.user.name}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                      {comment.isEdited && ' (edited)'}
                    </p>
                  </div>
                </div>

                {/* Actions (if own comment) */}
                      {user && comment.user && comment.user._id === user.id && (
                          <div className="flex gap-2">
                              <button
                                  onClick={() => handleStartEdit(comment)}
                                  className="text-gray-400 hover:text-white text-sm"
                              >
                                  Edit
                              </button>
                              <button
                                  onClick={() => handleDelete(comment._id)}
                                  className="text-gray-400 hover:text-red-500 text-sm"
                              >
                                  Delete
                              </button>
                          </div>
                      )}
              </div>

              {/* Comment Content */}
              {editingId === comment._id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white resize-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment._id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 mb-3">
                  {comment.text}
                </p>
              )}

              {/* Like Button */}
              {user && (
                <button
                  onClick={() => handleToggleLike(comment._id)}
                  className={`flex items-center gap-1 text-sm transition ${
                    comment.userLiked
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <svg className="w-4 h-4" fill={comment.userLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{comment.likesCount || 0}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};

export default CommentSection;