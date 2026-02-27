import { useParams } from 'react-router-dom';

const AnimeDetail = () => {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">
        Anime Detail (ID: {id})
      </h1>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <p className="text-gray-400">
          Details and comments coming soon...
        </p>
      </div>
    </div>
  );
};

export default AnimeDetail;