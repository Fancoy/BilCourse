import React, { useState, useEffect } from 'react';
import api from '../api';

const EditAssignmentModal = ({ isOpen, onClose, assignmentId }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchCurrentFile();
        }
    }, [isOpen]);

    const fetchCurrentFile = async () => {
        try {
            const authToken = localStorage.getItem('authToken');  // Retrieve the token from localStorage
            const response = await api.get(`/api/student-assignments/${assignmentId}/`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`  // Include the token in the headers
                }
            });
            setCurrentFile(response.data.result_file);  // Adjust based on the actual response structure
        } catch (error) {
            console.error('Error fetching current file:', error.response ? error.response.data : error.message);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('result_file', file);

        setUploading(true);

        try {
            const authToken = localStorage.getItem('authToken');  // Retrieve the token from localStorage
            const response = await api.patch(`/api/student-assignments/${assignmentId}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`  // Include the token in the headers
                }
            });
            console.log('File updated successfully:', response.data);
            onClose();
        } catch (error) {
            console.error('Error updating file:', error.response ? error.response.data : error.message);
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <input type="file" onChange={handleFileChange} />
                    <button type="submit" disabled={uploading}>{uploading ? 'Updating...' : 'Submit'}</button>
                </form>
                {currentFile && <p>Current File: {currentFile}</p>}
            </div>
        </div>
    );
};

export default EditAssignmentModal;
