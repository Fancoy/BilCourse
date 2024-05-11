import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Grid from '@mui/material/Grid';
import Sidebar from '../components/Sidebar';
import './css/MainPage.css';
import '../styles/Home.css';

function CreateActivity() {
  const { courseId } = useParams();  // Get course ID from URL
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const handleCreateActivity = async () => {
    try {
    const res = await api.post(`/api/courses/${courseId}/create-activity`, {
        title,
        description,
        date,
        course: courseId  // This line is generally not necessary with your current backend logic
        });
      if (res.status === 201) {
        alert('Activity created successfully!');
        navigate(`/courses/${courseId}`);
      } else {
        alert('Failed to create activity.');
      }
    } catch (err) {
      if (err.response) {
        console.log(err.response.data);
        alert(JSON.stringify(err.response.data));
      } else if (err.request) {
        console.log(err.request);
      } else {
        console.log('Error', err.message);
      }
    }
  };

  return (
    <div className="mainPage">
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Sidebar />
        </Grid>
        <Grid item xs={9}>
          <div className='form-container'>
            <h2>Create an Activity for Course ID: {courseId}</h2>
            <label htmlFor='activity-title'>Title:</label>
            <br />
            <input
              type='text'
              id='activity-title'
              name='title'
              required
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
            <br />
            <label htmlFor='activity-description'>Description:</label>
            <br />
            <textarea
              id='activity-description'
              name='description'
              required
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
            <br />
            <label htmlFor='activity-date'>Date:</label>
            <br />
            <input
              type='datetime-local'
              id='activity-date'
              name='date'
              required
              onChange={(e) => setDate(e.target.value)}
              value={date}
            />
            <br />
            <button onClick={handleCreateActivity}>Create Activity</button>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default CreateActivity;
