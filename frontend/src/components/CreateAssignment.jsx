import React from 'react';
import api from '../api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateAssignment ({course}) {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start_time, setStartTime] = useState('');
    const [end_time, setEndTime] = useState('');
    const [assignment_file, setAssignmentFile] = useState('');
    const [solution_key_file, setSolutionKeyFile] = useState('');
    const [is_solution_key_available, setIsSolutionKeyAvailable] = useState(false);
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


    const handleCreateAssignment = async () => {
    if (isAuthorized) {
        try {
        const res = await api.post('/api/assignments', { course, title, description, start_time, end_time, assignment_file, solution_key_file, is_solution_key_available});
        if (res.status === 201) {
            alert('Assignment created!');
            // You might want to navigate the user to another page here, e.g.:
            // navigate('/courses');
        } else {
            alert('Failed to create assignmnet.');
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
        <div>
            <h1>Create Assignment</h1>
            <form>

                <label>Title</label>
                <input type="text" onChange={(e) => setTitle(e.target.value)} />
                <label>Description</label>
                <input type="text" onChange={(e) => setDescription(e.target.value)} />
                <label>Semester</label>
                <input type="text" onChange={(e) => setSemester(e.target.value)} />
                <label>Year</label>
                <input type="text" onChange={(e) => setYear(e.target.value)} />
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
                <input type="text" onChange={(e) => setEndTime(e.target.value)} />
                <label>Assignment File</label>
                <input type="file" id="assignment_file" name='assignment_file' onChange={(e) => setAssignmentFile(e.target.files[0])} />

                <label>Solution Key File</label>
                <input type="file" id='solution_key_file' name='solution_key_file' onChange={(e) => setSolutionKeyFile(e.target.files[0])} />

                <label>Is Solution Key Available</label>
                <input type="text" onChange={(e) => setIsSolutionKeyAvailable(e.target.value)} />

                <button type="button" onClick={handleCreateAssignment}>Create</button>
            </form>
        </div>
    );



} export default CreateAssignment;