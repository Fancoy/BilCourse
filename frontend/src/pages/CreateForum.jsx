import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Grid from '@mui/material/Grid';
import Sidebar from '../components/Sidebar';
import './css/MainPage.css';
import '../styles/Home.css';

function CreateForum() {
    const { courseId } = useParams();
    const [title, setTitle] = useState('');
    const navigate = useNavigate();

    const handleCreateForum = async () => {
        try {
            const response = await api.post(`/api/courses/${courseId}/forum-create`, {
                title,
                course: courseId  // Ensuring the courseId is included in the request
            });
            if (response.status === 201) {
                alert('Forum created successfully!');
                navigate(`/courses/${courseId}`);
            } else {
                alert('Failed to create forum.');
            }
        } catch (error) {
            console.error('Error creating forum:', error);
            alert('Error creating forum. Please try again.');
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
                        <h2>Create a Forum for Course ID: {courseId}</h2>
                        <label htmlFor='forum-title'>Title:</label>
                        <br />
                        <input
                            type='text'
                            id='forum-title'
                            name='title'
                            required
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                        />
                        <br />
                        <button onClick={handleCreateForum}>Create Forum</button>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}

export default CreateForum;
