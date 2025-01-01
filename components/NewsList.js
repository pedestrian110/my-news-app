// components/NewsList.js
import { useEffect, useState } from 'react';
import { fetchNews } from '../lib/fetchNews';

const NewsList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getNews = async () => {
      const data = await fetchNews();
      if (data.articles.length > 0) {
        setArticles(data.articles);
      } else {
        setError('No articles found.');
      }
      setLoading(false);
    };

    getNews();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Latest News Articles</h2>
      <p>Total Articles: {articles.length}</p>
      <ul>
        {articles.map((article) => (
          <li key={article.url}>
            <h3>{article.title}</h3>
            <p>Author: {article.author || 'Unknown'}</p>
            <p>Date: {new Date(article.publishedAt).toLocaleDateString()}</p>
            <p>Type: {article.source.name}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsList;
