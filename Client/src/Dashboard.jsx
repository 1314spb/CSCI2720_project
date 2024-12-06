import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = Cookies.get('userId');
    const username = Cookies.get('username');
    const userEmail = Cookies.get('email');
    const userAdmin = Cookies.get('admin');

    if (!userEmail) {
      // Redirect to login if not logged in
      navigate('/login');
    } else {
      setUser({ userId: userId, username: username ,email: userEmail, admin: userAdmin === 'true' });
    }
  }, [navigate]);

  return (
    <div>
      {user ? (
        <>
          <h1>Welcome, {user.username}, ID: {user.userId}</h1>
          <h1>Email: {user.email}</h1>
          <p>Admin: {user.admin ? 'Yes' : 'No'}</p>
          <button onClick={() => {
            Cookies.remove('userId');
            Cookies.remove('username');
            Cookies.remove('email');
            Cookies.remove('admin');
            navigate('/login');
          }}>Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}