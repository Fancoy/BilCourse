import React, { useState } from 'react';
import Course from '../components/Course';
import api from '../api';
import '../styles/Search.css';

function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searchPerformed, setSearchPerformed] = useState(false); // Track if a search has been performed
    const [error, setError] = useState(''); // State to store error messages

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResults();
        setSearchPerformed(true); // Set that a search has been performed
    }

    const fetchResults = async () => {
        try {
            const response = await api.get(`/api/search/?q=${query}`);
            setResults(response.data);
            if (response.data.length === 0) {
                setError('No courses found matching your criteria.');
            } else {
                setError(''); // Clear any existing error messages
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            setError('Failed to fetch courses. Please try again.');
            setResults([]);
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch} className='search-group-container'>
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
            {error && <div>{error}</div>}
            <div className='results-container'>
                {results.map((course) => (
                    <div key={course.id}>
                        <Course course={course} />                            
                    </div>
                ))}
                {!error && results.length === 0 && searchPerformed && (
                    <div>No courses found. Try a different search.</div>
                )}
            </div>
        </div>
    );
}

export default Search;
