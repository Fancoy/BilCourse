import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ACCESS_TOKEN } from '../../src/constants';

function UserProfile() {
    const navigate = useNavigate();
    const { email } = useParams(); // Assuming you're using React Router and the email is part of the URL
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [myEmail, setMyEmail] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/users/${email}/`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` // Assuming token-based authentication
                    }
                });
                const myInfo = await axios.get(`http://127.0.0.1:8000/api/user/`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` // Assuming token-based authentication
                    }
                });
                setUser(response.data);
                setMyEmail(myInfo.data.email);
            } catch (err) {
                setError('Failed to fetch user data');
                console.error(err);
            }
        };

        fetchUserData();
    }, [email]);

    const handleNavigate = () => {
        const userEmail = user.email; 
        const chatUrl = `/privatechat/${myEmail}and${userEmail}`;
        navigate(chatUrl);
    };

    return (
        <div>
            <h1>User Profile</h1>
            {error && <p className="error">{error}</p>}
            {user ? (
                <div>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>First Name:</strong> {user.first_name}</p>
                    <p><strong>Last Name:</strong> {user.last_name}</p>
                    <p><strong>Role:</strong> {user.account_type}</p>
                    <button onClick={handleNavigate}>Go to Private Chat</button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default UserProfile;