import axios from 'axios';

const ANILIST_API = 'https://graphql.anilist.co';

// GraphQL query para obtener anime trending
const TRENDING_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(type: ANIME, sort: TRENDING_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
      }
      bannerImage
      averageScore
      genres
      episodes
      status
      description
      seasonYear
      format
    }
  }
}
`;

// GraphQL query para búsqueda
const SEARCH_QUERY = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(type: ANIME, search: $search, sort: SEARCH_MATCH) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
      }
      bannerImage
      averageScore
      genres
      episodes
      status
      description
      seasonYear
      format
    }
  }
}
`;

// GraphQL query para anime específico
const ANIME_DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      large
      extraLarge
    }
    bannerImage
    averageScore
    genres
    episodes
    duration
    status
    description
    seasonYear
    season
    format
    studios {
      nodes {
        name
      }
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
  }
}
`;

// Fetch trending anime
export const getTrendingAnime = async (page = 1, perPage = 20) => {
  try {
    const response = await axios.post(ANILIST_API, {
      query: TRENDING_QUERY,
      variables: { page, perPage }
    });

    return response.data.data.Page;
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    throw error;
  }
};

// Search anime
export const searchAnime = async (searchTerm, page = 1, perPage = 20) => {
  try {
    const response = await axios.post(ANILIST_API, {
      query: SEARCH_QUERY,
      variables: { search: searchTerm, page, perPage }
    });

    return response.data.data.Page;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

// Get anime details
export const getAnimeDetails = async (animeId) => {
  try {
    const response = await axios.post(ANILIST_API, {
      query: ANIME_DETAIL_QUERY,
      variables: { id: parseInt(animeId) }
    });

    return response.data.data.Media;
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw error;
  }
};

export default {
  getTrendingAnime,
  searchAnime,
  getAnimeDetails
};