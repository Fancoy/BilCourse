import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';

function ListActivities() {
  const { courseId } = useParams();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/api/courses/${courseId}/list-activities`);
      if (response.status === 200) {
        setActivities(response.data);
      } else {
        alert('Failed to fetch activities.');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      alert('Error fetching activities.');
    }
  };

  return (
    <div>
      <h1>Activities for Course ID: {courseId}</h1>
      {activities.map(activity => (
        <div key={activity.id}>
          <h3>{activity.title}</h3>
          <p>{activity.description}</p>
          <p>Date: {new Date(activity.date).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default ListActivities;
