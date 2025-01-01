// pages/dashboard.js
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchNews } from '../lib/fetchNews';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Payout related states
  const [payoutPerArticle, setPayoutPerArticle] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  
  const [errorMessage, setErrorMessage] = useState('');
  
  // Validation messages
  const [searchError, setSearchError] = useState('');
  const [authorError, setAuthorError] = useState('');
  const [dateError, setDateError] = useState('');

  // Load user and news articles
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = '/'; // Redirect to home page if not authenticated
      } else {
        setUser(user);
        loadNews(); // Fetch news articles when user is authenticated
        loadPayout(); // Load payout data from local storage
      }
    });

    return () => unsubscribe();
  }, []);

  const loadNews = async () => {
    try {
      const data = await fetchNews();
      setArticles(data.articles);
      setFilteredArticles(data.articles || []); // Ensure it's an array
      setErrorMessage(''); // Clear any previous error messages
    } catch (error) {
      setErrorMessage(error.message); // Set error message if API call fails
      setArticles([]); // Clear articles in case of an error
      setFilteredArticles([]); // Clear filtered articles in case of an error
    }
  };

  // Load payout data from local storage
  const loadPayout = () => {
    const storedPayout = localStorage.getItem('payoutPerArticle');
    if (storedPayout) {
      setPayoutPerArticle(Number(storedPayout));
    }
    calculateTotalPayout(); // Calculate total payouts on load
  };

   // Validate inputs
   const validateInputs = () => {
     let valid = true;

     // Validate search input
     if (!search.trim()) {
       setSearchError('Search cannot be empty.');
       valid = false;
     } else {
       setSearchError('');
     }

     // Validate author filter input
     if (!authorFilter.trim()) {
       setAuthorError('Author filter cannot be empty.');
       valid = false;
     } else {
       setAuthorError('');
     }

     // Validate date range
     if (dateRange.start && dateRange.end) {
       if (new Date(dateRange.start) > new Date(dateRange.end)) {
         setDateError('Start date must be before end date.');
         valid = false;
       } else {
         setDateError('');
       }
     }

     return valid;
   };

   // Filter articles based on user input
   const filterArticles = () => {
     if (!validateInputs()) return; // Only proceed if inputs are valid

     let results = articles;

     // Filter by author
     if (authorFilter) {
       results = results.filter(article =>
         article.author?.toLowerCase().includes(authorFilter.toLowerCase())
       );
     }

     // Filter by date range
     if (dateRange.start || dateRange.end) {
       results = results.filter(article => {
         const publishedDate = new Date(article.publishedAt);
         return (
           (!dateRange.start || publishedDate >= new Date(dateRange.start)) &&
           (!dateRange.end || publishedDate <= new Date(dateRange.end))
         );
       });
     }

     // Global search
     if (search) {
       results = results.filter(article =>
         article.title.toLowerCase().includes(search.toLowerCase())
       );
     }

     setFilteredArticles(results);
     calculateTotalPayout(); // Recalculate total payout whenever articles are filtered
   };

   useEffect(() => {
     filterArticles();
   }, [search, authorFilter, dateRange]);

   // Handle payout rate change and store in local storage
   const handlePayoutChange = (e) => {
     const value = Number(e.target.value);
     setPayoutPerArticle(value);
     localStorage.setItem('payoutPerArticle', value);
     calculateTotalPayout(); // Recalculate total payout when payout rate changes
   };

   // Calculate total payouts based on articles and payout rate
   const calculateTotalPayout = () => {
     const total = filteredArticles.length * payoutPerArticle;
     setTotalPayout(total);
   };

   // Data for analytics charts
   const getAnalyticsData = () => {
     const authorsCount = {};
     
     if (Array.isArray(filteredArticles)) { 
       filteredArticles.forEach(article => {
         authorsCount[article.author || 'Unknown'] = (authorsCount[article.author || 'Unknown'] || 0) + 1;
       });
     }

     return {
       labels: Object.keys(authorsCount),
       values: Object.values(authorsCount),
     };
   };

   const { labels, values } = getAnalyticsData();

   return (
     <div className="container mx-auto p-4">
       <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h1>
       
       {/* Error Messages */}
       {searchError && <p className="text-red-500">{searchError}</p>}
       {authorError && <p className="text-red-500">{authorError}</p>}
       {dateError && <p className="text-red-500">{dateError}</p>}
       {errorMessage && <p className="text-red-500">{errorMessage}</p>}

       {/* Payout Settings */}
       <div className="mb-4">
         <label className="block mb-2">Set Payout Per Article:</label>
         <input
           type="number"
           value={payoutPerArticle}
           onChange={handlePayoutChange}
           className="border p-2 rounded w-full md:w-1/3"
           placeholder="Enter payout amount"
         />
         <p className="mt-2">Total Payout: ${totalPayout.toFixed(2)}</p>
       </div>

       {/* Search Bar */}
       <input
         type="text"
         placeholder="Search by title..."
         value={search}
         onChange={(e) => setSearch(e.target.value)}
         className="border p-2 rounded w-full md:w-1/3 mb-4"
       />

       {/* Author Filter */}
       <input
         type="text"
         placeholder="Filter by author..."
         value={authorFilter}
         onChange={(e) => setAuthorFilter(e.target.value)}
         className="border p-2 rounded w-full md:w-1/3 mb-4"
       />

       {/* Date Range Filter */}
       <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
         <input
           type="date"
           placeholder="Start Date"
           value={dateRange.start}
           onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
           className="border p-2 rounded w-full md:w-1/3"
         />
         <input
           type="date"
           placeholder="End Date"
           value={dateRange.end}
           onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
           className="border p-2 rounded w-full md:w-1/3"
         />
       </div>

       {/* Display Charts */}
       {filteredArticles.length > 0 && (
         <div className="mb-8">
           <h3 className="text-lg font-semibold">Article Trends by Author</h3>
           <div style={{ maxWidth: '800px', margin: '0 auto' }}>
             <Bar 
               data={{
                 labels,
                 datasets: [{
                   label: 'Number of Articles',
                   data: values,
                   backgroundColor: 'rgba(75,192,192,0.6)',
                   borderColor: 'rgba(75,192,192,1)',
                   borderWidth: 1,
                 }],
               }}
               options={{
                 scales: {
                   y: { beginAtZero: true },
                 },
               }}
             />
           </div>

           <h3 className="text-lg font-semibold mt-8">Article Distribution</h3>
           <div style={{ maxWidth: '400px', margin: '0 auto' }}>
             <Pie 
               data={{
                 labels,
                 datasets: [{
                   label: 'Number of Articles',
                   data: values,
                   backgroundColor: [
                     '#FF6384',
                     '#36A2EB',
                     '#FFCE56',
                     '#4BC0C0',
                     '#9966FF',
                     '#FF9F40',
                   ],
                 }],
               }}
               options={{
                 responsive: true,
                 plugins: {
                   legend: { position: 'top' },
                 },
               }}
             />
           </div>
         </div>
       )}

       {filteredArticles.length > 0 ? (
         <ul className="space-y-4">
           {filteredArticles.map((article) => (
             <li key={article.url} className="border p-4 rounded shadow">
               <h3 className="text-lg font-bold">{article.title}</h3>
               <p>Author: {article.author || 'Unknown'}</p>
               <p>Date: {new Date(article.publishedAt).toLocaleDateString()}</p>
               <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Read more</a>
             </li>
           ))}
         </ul>
       ) : (
         !errorMessage && <p>No articles found.</p> 
       )}
     </div>
   );
};

export default DashboardPage;
