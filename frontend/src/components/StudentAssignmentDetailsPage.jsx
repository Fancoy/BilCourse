import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function StudentAssignmentDetailsPage() {
    const { studentAssignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [studentAssignment, setStudentAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState(null);


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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const grader = user && user.account_type !== 'student';

    const submitter = user && user.id === studentAssignment?.student;

    return (
        <div>
            <h1>Assignment Details</h1>
            {console.log(grader)}
            {assignment && (
                <div>
                    <h2>Title: {assignment.title}</h2>
                    <p>Description: {assignment.description}</p>
                    <p>Due Date: {new Date(assignment.end_time).toLocaleString()}</p>
                </div>
            )}
            {studentAssignment ? (
                <div>
                    <h3>Submitted Assignment</h3>
                    <a href={studentAssignment.result_file} target="_blank" rel="noopener noreferrer">View Submitted File</a>
                    {submitter ? (<button onClick={() => navigate(`/assignments/edit/${studentAssignmentId}`)}>Edit Submission</button>) : (<></>)}
                </div>
            ) : (
                <p>No submission found.</p>
            )}
        </div>
    );
}

export default StudentAssignmentDetailsPage;
