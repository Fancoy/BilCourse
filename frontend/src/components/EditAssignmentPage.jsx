import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; // Ensure this path is correct based on your project setup

function EditAssignmentPage() {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        assignment_file: null,
        solution_key_file: null,
        is_solution_key_available: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const response = await api.get(`/api/assignments/${assignmentId}`);
                setAssignment({
                    title: response.data.title,
                    description: response.data.description,
                    start_time: response.data.start_time.split('.')[0],
                    end_time: response.data.end_time.split('.')[0],
                    assignment_file: response.data.assignment_file,
                    solution_key_file: response.data.solution_key_file,
                    is_solution_key_available: response.data.is_solution_key_available
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch assignment data');
                setLoading(false);
            }
        };

        fetchAssignment();
    }, [assignmentId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAssignment(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setAssignment(prevState => ({
            ...prevState,
            [e.target.name]: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', assignment.title);
        formData.append('description', assignment.description);
        formData.append('start_time', assignment.start_time);
        formData.append('end_time', assignment.end_time);
        formData.append('assignment_file', assignment.assignment_file);
        formData.append('solution_key_file', assignment.solution_key_file);
        formData.append('is_solution_key_available', assignment.is_solution_key_available);

        try {
            const response = await api.patch(`/api/assignments/${assignmentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert('Assignment updated successfully!');
            navigate(-1); // Go back to the previous page
        } catch (error) {
            setError('Error updating assignment');
            console.error('Update error:', error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h1>Edit Assignment</h1>
            <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                    type="text"
                    name="title"
                    value={assignment.title}
                    onChange={handleInputChange}
                />
                <label>Description</label>
                <textarea
                    name="description"
                    value={assignment.description}
                    onChange={handleInputChange}
                />
                <label>Start Time</label>
                <input
                    type="datetime-local"
                    name="start_time"
                    value={assignment.start_time}
                    onChange={handleInputChange}
                />
                <label>End Time</label>
                <input
                    type="datetime-local"
                    name="end_time"
                    value={assignment.end_time}
                    onChange={handleInputChange}
                />
                <label>Assignment File</label>
                <input
                    type="file"
                    name="assignment_file"
                    onChange={handleFileChange}
                />
                <label>Solution Key File</label>
                <input
                    type="file"
                    name="solution_key_file"
                    onChange={handleFileChange}
                />
                <label>
                    <input
                        type="checkbox"
                        name="is_solution_key_available"
                        checked={assignment.is_solution_key_available}
                        onChange={e => setAssignment(prevState => ({
                            ...prevState,
                            is_solution_key_available: e.target.checked
                        }))}
                    /> Is Solution Key Available
                </label>
                <button type="submit">Update</button>
            </form>
        </div>
    );
}

export default EditAssignmentPage;
