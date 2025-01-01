// components/Navbar.js
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link href="/">Home</Link>
      {user ? (
        <>
          <span>{user.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;
