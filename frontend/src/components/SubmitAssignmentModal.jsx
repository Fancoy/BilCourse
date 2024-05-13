import React, { useState } from 'react';
import api from '../api';

const SubmitAssignmentModal = ({ isOpen, onClose, assignmentId, studentId }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('assignment', assignmentId);
        formData.append('student', studentId);
        formData.append('result_file', file);

        setUploading(true);

        try {
            const response = await api.post('/api/student-assignments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log('File uploaded successfully:', response.data);
            onClose();
        } catch (error) {
            console.error('Error uploading file:', error.response ? error.response.data : error.message);
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
                    <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Submit'}</button>
                </form>
            </div>
        </div>
    );
};

export default SubmitAssignmentModal;
