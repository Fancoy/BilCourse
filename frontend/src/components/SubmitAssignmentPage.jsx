import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function SubmitAssignmentPage() {
    const { courseId, assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [course, setCourse] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignmentAndCourse = async () => {
            try {
                const [assignmentResponse, courseResponse] = await Promise.all([
                    api.get(`/api/assignments/${assignmentId}`),
                    api.get(`/api/courses/${courseId}`)
                ]);
                setAssignment(assignmentResponse.data);
                setCourse(courseResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load assignment or course details.');
            }
        };

        const fetchUser = async () => {
            try {
                const response = await api.get('/api/user/');
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchAssignmentAndCourse();
        fetchUser();
    }, [courseId, assignmentId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file to submit.');
            return;
        }

        const formData = new FormData();
        formData.append('assignment', assignmentId);
        formData.append('student', user.id);
        formData.append('result_file', file);

        setUploading(true);

        try {
            const response = await api.post('/api/student-assignments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert('Assignment submitted successfully.');
            navigate(-1);  // Go back to the previous page
        } catch (error) {
            console.error('Error uploading file:', error.response ? error.response.data : error.message);
            alert('Failed to submit assignment.');
        } finally {
            setUploading(false);
        }
    };

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Submit Assignment for {course ? course.title : 'Loading course...'}</h1>
            {assignment ? (
                <div>
                    <h2>Assignment: {assignment.title}</h2>
                    <p>Description: {assignment.description}</p>
                    <p>Due: {new Date(assignment.end_time).toLocaleString()}</p>
                </div>
            ) : <p>Loading assignment details...</p>}
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} required />
                <button type="submit" disabled={uploading}>{uploading ? 'Submitting...' : 'Submit Assignment'}</button>
            </form>
        </div>
    );
}

export default SubmitAssignmentPage;
