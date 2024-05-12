import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';

function ListForums() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      const response = await api.get(`/api/courses/${courseId}/forum-list`);
      if (response.status === 200) {
        setForums(response.data);
      } else {
        alert('Failed to fetch forums.');
      }
    } catch (error) {
      console.error('Error fetching forums:', error);
      alert('Error fetching forums.');
    }
  };

  const handleNavigate = (forumId) => {
    navigate(`/forums/${forumId}`);
  };
  const handleNavigate2 = () => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div>
      <h1>Forums for Course ID: {courseId}</h1>
      {forums.map(forum => (
        <div key={forum.id}>
          <h3>{forum.title}</h3>
          <button onClick={() => handleNavigate(forum.id)}>View Forum</button>

          {/* Additional details and actions can be added here as needed */}
        </div>
      ))}
        <button onClick={() => handleNavigate2()}>Go Back</button>
    </div>
  );
}

export default ListForums;
