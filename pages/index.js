// pages/index.js
import Link from 'next/link';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the News Aggregator</h1>
      <nav>
        <ul>
          <li><Link href="/register">Register</Link></li>
          <li><Link href="/login">Login</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
