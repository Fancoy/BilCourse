import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import EditSubmissionModal from './EditSubmissionModal';

function StudentAssignmentDetailsPage() {
    const { studentAssignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [studentAssignment, setStudentAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [grade, setGrade] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchStudentAssignment() {
            try {
                const response = await api.get(`/api/student-assignments/${studentAssignmentId}/details`);
                const userRes = await api.get(`/api/profile/`);
                setStudentAssignment(response.data);
                fetchAssignment(response.data.assignment);
                setUser(userRes.data.user);
            } catch (err) {
                console.error('Error fetching student assignment:', err);
                setError('Failed to load the student assignment details.');
            }
        }
        
        fetchStudentAssignment();
    }, [studentAssignmentId]);

    const fetchAssignment = async (assignmentId) => {
        try {
            const response = await api.get(`/api/assignments/${assignmentId}`);
            setAssignment(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching assignment:', err);
            setError('Failed to load the assignment details.');
            setLoading(false);
        }
    };

    const handleGradeChange = (event) => {
        setGrade(event.target.value);
    };

    const handleGradeSubmit = async () => {
        if (grade) {
            try {
                const response = await api.patch(`/api/student-assignments/${studentAssignmentId}/edit-grade`, { grade });
                alert(`Grade updated to ${response.data.grade}`);
                setStudentAssignment({...studentAssignment, grade: response.data.grade}); // Update the local state to reflect the new grade
            } catch (err) {
                console.error('Error updating grade:', err);
                setError('Failed to update grade.');
            }
        } else {
            alert('Please enter a grade before submitting.');
        }
    };

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleDeleteSubmission = async () => {
        try {
            await api.delete(`/api/student-assignments/${studentAssignmentId}/delete`);
            alert('Submission deleted successfully.');
            navigate('/home'); // Navigate to the assignments list or any other appropriate page
        } catch (err) {
            console.error('Error deleting submission:', err);
            setError('Failed to delete submission.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const grader = user && user.account_type !== 'student';

    const submitter = user && user.id === studentAssignment?.student;

    return (
        <div>
            <h1>Assignment Details</h1>
            {assignment && (
                <div>
                    <h2>Title: {assignment.title}</h2>
                    <p>Description: {assignment.description}</p>
                    <p>Due Date: {new Date(assignment.end_time).toLocaleString()}</p>
                    {studentAssignment.grade && <p>Grade: {studentAssignment.grade}</p>}
                </div>
            )}
            
            {studentAssignment ? (
                <div>
                    <h3>Submitted Assignment</h3>
                    <a href={studentAssignment.result_file} target="_blank" rel="noopener noreferrer">View Submitted File</a>
                    {submitter ? (
                        <>
                            <button onClick={handleOpenEditModal}>Edit Submission</button>
                            <button onClick={handleDeleteSubmission}>Delete Submission</button>
                            <EditSubmissionModal 
                                isOpen={isEditModalOpen} 
                                onClose={handleCloseEditModal} 
                                studentAssignmentId={studentAssignmentId} 
                            />
                        </>
                    ) : (<></>)}
                    {!submitter && (
                        <div>
                            <input type="text" value={grade} onChange={handleGradeChange} placeholder="Enter grade" />
                            <button onClick={handleGradeSubmit}>Submit Grade</button>
                        </div>
                    )}
                </div>
            ) : (
                <p>No submission found.</p>
            )}
        </div>
    );
}

export default StudentAssignmentDetailsPage;
