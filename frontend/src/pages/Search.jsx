import React, { useState } from 'react';
import SearchUser from '../components/SearchUser';
import SearchCourses from '../components/SearchCourses';
import '../styles/Search.css';

function Search() {
    const [searchType, setSearchType] = useState('users'); // State to control which search type to show
    const handleSearchTypeChange = (newSearchType) => {
        setSearchType(newSearchType);
    };

    return (
        <div className="search">
            <div className="view-buttons">
                <button onClick={() => handleSearchTypeChange('courses')}>Search Courses</button>
                <button onClick={() => handleSearchTypeChange('users')}>Search Users</button>
            </div>  
            {searchType === 'users' && <SearchUser />}
            {searchType === 'courses' && <SearchCourses />}
        </div>
    );   
}

export default Search;
