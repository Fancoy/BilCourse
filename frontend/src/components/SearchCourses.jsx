import React, { useState } from 'react';
import Course from './Course';
import api from '../api';
import '../styles/Search.css';

function SearchCourses() {
    const [query, setQuery] = useState('');
    const [courses, setCourses] = useState([]);
    const [searchPerformed, setSearchPerformed] = useState(false); // Track if a search has been performed
    const [error, setError] = useState(''); // State to store error messages

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCourses();
        setSearchPerformed(true); // Set that a search has been performed
    }

    const fetchCourses = async () => {
        try {
            const response = await api.get(`/api/search-course/?q=${query}`);
            setCourses(response.data);
            if (response.data.length === 0) {
                setError('No courses found matching your criteria.');
            } else {
                setError(''); // Clear any existing error messages
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            setError('Failed to fetch courses. Please try again.');
            setCourses([]);
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
                {courses.map((course) => (
                    <div key={course.id}>
                        <Course course={course} />                            
                    </div>
                ))}
                {!error && courses.length === 0 && searchPerformed && (
                    <div>No courses found. Try a different search.</div>
                )}
            </div>
        </div>
    );
}

export default SearchCourses;
