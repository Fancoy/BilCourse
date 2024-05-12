import React from 'react';
import api from '../api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';


function CreateAssignment () {

    const { courseId } = useParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start_time, setStartTime] = useState('');
    const [end_time, setEndTime] = useState('');
    const [assignment_file, setAssignmentFile] = useState('');
    const [solution_key_file, setSolutionKeyFile] = useState('');
    const [is_solution_key_available, setIsSolutionKeyAvailable] = useState(false);
    const [course, setCourse] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const year = new Date().getFullYear();
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

    useEffect(() => {
        if (courseId) {
            api.get(`/api/courses/${courseId}`)
                .then((res) => {
                    setCourse(res.data);
                    setError(null); // Clear errors if data fetched successfully
                })
                .catch((err) => {
                    setError('Error fetching course data');
                    console.error(err);
                });
        }
    }, [courseId]);
    
    const handleCreateAssignment = async () => {
        if (isAuthorized) {
            const formData = new FormData();  // Create a new FormData instance
            formData.append('course', course.slug);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('year', year);
            formData.append('start_time', start_time);
            formData.append('end_time', end_time);
            formData.append('assignment_file', assignment_file);  // Ensure this is the file, not a string
            formData.append('solution_key_file', solution_key_file);  // Ensure this is the file, not a string
            formData.append('is_solution_key_available', is_solution_key_available);
    
            try {
                const res = await api.post('/api/assignments', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'  // This might be optional as axios sets it automatically
                    }
                });
                if (res.status === 201) {
                    alert('Assignment created!');
                } else {
                    alert('Failed to create assignment.');
                }
            } catch (err) {
                if (err.response) {
                    console.error('Error response:', err.response.data);
                    alert(JSON.stringify(err.response.data));
                } else if (err.request) {
                    console.error('Error request:', err.request);
                } else {
                    console.error('Error', err.message);
                }
            }
        }
    };
    

    return (
        <div>
            <h1>Create Assignment</h1>
            <form>

                <label>Title</label>
                <input type="text" onChange={(e) => setTitle(e.target.value)} />
                <label>Description</label>
                <input type="text" onChange={(e) => setDescription(e.target.value)} />
                <label>Start Time</label>
                <input
                    type='datetime-local'
                    id='assignment-start-date'
                    name='start_time'
                    required
                    onChange={(e) => setStartTime(e.target.value)}
                    value={start_time}
                />                
                <label>End Time</label>
                <input
                    type='datetime-local'
                    id='assignment-end-date'
                    name='end_time'
                    required
                    onChange={(e) => setEndTime(e.target.value)}
                    value={end_time}
                />                
                <label>Assignment File</label>
                <input type="file" id="assignment_file" name='assignment_file' onChange={(e) => setAssignmentFile(e.target.files[0])} />

                <label>Solution Key File</label>
                <input type="file" id='solution_key_file' name='solution_key_file' onChange={(e) => setSolutionKeyFile(e.target.files[0])} />

                <button type="button" onClick={handleCreateAssignment}>Create</button>
            </form>
        </div>
    );



} export default CreateAssignment;