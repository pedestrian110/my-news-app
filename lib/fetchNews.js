// lib/fetchNews.js
import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

export const fetchNews = async (category = 'general', page = 1) => {
  try {
    const url = `https://newsapi.org/v2/top-headlines?category=${category}&pageSize=10&page=${page}&apiKey=${apiKey}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Because News API is not available free for production uses. You can see localy it will work');
  }
};
