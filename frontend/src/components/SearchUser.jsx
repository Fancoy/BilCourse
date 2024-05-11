import React, { useState } from 'react';
import api from '../api';
import ProfileCard from './ProfileCard';
import '../styles/Search.css';

function SearchUser() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]); 
    const [searchPerformed, setSearchPerformed] = useState(false); // Track if a search has been performed
    const [error, setError] = useState(''); // State to store error messages

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
        setSearchPerformed(true); // Set that a search has been performed
    }

    const fetchUsers = async () => {    
        try {
            const response = await api.get(`/api/search-user/?q=${query}`);
            setUsers(response.data);
            if (response.data.length === 0) {
                setError('No users found matching your criteria.');
            } else {
                setError(''); // Clear any existing error messages
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            setError('Failed to fetch users. Please try again.');
            setUsers([]);
        }
    }

    return (
        <div>
            <form onSubmit={handleSearch} className='search-group-container'>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
            {error && <div>{error}</div>}
            <div className='results-container'>
                {users.map((user) => (
                    <div key={user.email}>
                        <ProfileCard user={user} />                            
                    </div>
                ))}
                {!error && users.length === 0 && searchPerformed && (
                    <div>No users found. Try a different search.</div>
                )}
            </div>
        </div>
    );
}

export default SearchUser;
