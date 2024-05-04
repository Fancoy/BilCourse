import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Grid from '@mui/material/Grid';
import Sidebar from '../components/Sidebar';
import './css/MainPage.css';
import '../styles/Home.css';

function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await api.get('/api/user/account-type/');
        if (response.data.account_type === 'instructor') {
          setIsAuthorized(true);
        } else {
          navigate('/home');
          alert('You are not authorized to view this page.');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };

    checkAuthorization();

    return () => {};
  }, [navigate]);

  const handleCreateCourse = async () => {
    if (isAuthorized) {
      try {
        const res = await api.post('/api/courses', { title, description, capacity });
        if (res.status === 201) {
          alert('Course created!');
          // You might want to navigate the user to another page here, e.g.:
          // navigate('/courses');
        } else {
          alert('Failed to create course.');
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
    }
  };

  return (
    <div className={`mainPage ${!isAuthorized ? 'blur-content' : ''}`}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Sidebar />
        </Grid>
        <Grid item xs={9}>
          <div className='form-container'>
            <h2>Create a Course</h2>
            <label htmlFor='create-title'>Title:</label>
            <br />
            <input
              type='text'
              id='create-title'
              name='title'
              required
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
            <br />
            <label htmlFor='create-description'>Description:</label>
            <br />
            <textarea
              id='create-description'
              name='description'
              required
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
            <br />
            <label htmlFor='create-capacity'>Capacity:</label>
            <br />
            <input
              type='number'
              id='create-capacity'
              name='capacity'
              min='1'
              required
              onChange={(e) => setCapacity(e.target.value)}
              value={capacity}
            />
            <br />
            <button onClick={handleCreateCourse}>Create Course</button>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default CreateCourse;
