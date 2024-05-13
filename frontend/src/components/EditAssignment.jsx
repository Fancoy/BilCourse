import React, { useState, useEffect } from 'react';
import api from '../api';  // Make sure this path matches your actual API module

function EditAssignment({ assignment, onClose, onSave }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState(assignment.title);
    const [description, setDescription] = useState(assignment.description);
    const [solutionKeyStatus, setSolutionKeyStatus] = useState(assignment.is_solution_key_available);
    const [editAssignmentFile, setEditAssignmentFile] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (assignment) {
            setLoading(false);  // Assuming assignment is passed as a prop and is loaded
        }
    }, [assignment]);

    console.log(assignment.id);

    const handleFileChange = (event) => {
        setEditAssignmentFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!title || !description) {
            alert("Please fill in all fields");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('is_solution_key_available', solutionKeyStatus);
        if (editAssignmentFile) {
            formData.append('assignment_file', editAssignmentFile);
        }

        try {
            const response = await api.patch(`/api/assignments/${assignment.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Assignment updated successfully!');
            console.log(response.data);  // Logging the response to see the updated assignment
        } catch (error) {
            console.error('Failed to update assignment:', error);
            setError(error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div>
            <h1>Edit Assignment</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title:</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label htmlFor="assignment_file">Assignment File:</label>
                <input
                    id="assignment_file"
                    type="file"
                    onChange={handleFileChange}
                />

                <label htmlFor="solution_key_status">Solution Key Available:</label>
                <select
                    id="solution_key_status"
                    value={solutionKeyStatus}
                    onChange={(e) => setSolutionKeyStatus(e.target.value === 'true')}
                >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>

                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
}

export default EditAssignment;
