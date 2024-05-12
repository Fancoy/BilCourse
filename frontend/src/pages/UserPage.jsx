import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function UserPage() {
  const { email } = useParams();
  const [user, setUser] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (email) {
        api.get(`/api/users/${email}`)
            .then((res) => {
                setUser(res.data);
                setError(null); // Clear errors if data fetched successfully
            })
            .catch((err) => {
                setError('Error fetching course data');
                console.error(err);
            });
    }
}, [email]);

  return (
    <div>
      <h1>User Page</h1>
      <p>Welcome, {user.email}!</p>
    </div>
  );
} export default UserPage;