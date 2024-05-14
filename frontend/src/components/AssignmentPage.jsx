import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; // Make sure the API path is correct

function AssignmentPage() {
    const { courseId, assignmentId } = useParams();
    const [course, setCourse] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [studentAssignments, setStudentAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [courseRes, assignmentRes, studentAssignmentsRes, userRes] = await Promise.all([
                    api.get(`/api/courses/${courseId}`),
                    api.get(`/api/assignments/${assignmentId}`),
                    api.get(`/api/student-assignments?assignment=${assignmentId}`),
                    api.get(`/api/profile/`)
                ]);
                setCourse(courseRes.data);
                setAssignment(assignmentRes.data);
                setStudentAssignments(studentAssignmentsRes.data);
                setUser(userRes.data);
            } catch (err) {
                setError('Failed to load data. Please refresh or try again later.');
                console.error('Fetch error:', err);
            }
            setLoading(false);
        }
        
        fetchData();
    }, [courseId, assignmentId]);

    const handleEdit = () => {
        navigate(`/edit-assignment/${assignmentId}`);
    };


    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            try {
                await api.delete(`/api/assignments/${assignmentId}`);
                alert('Assignment deleted successfully.');
                navigate(`/assignments/${courseId}/listassignments`);
            } catch (error) {
                setError('Failed to delete assignment.');
                console.error('Delete error:', error);
            }
        }
    };

    const handleNavigateToDetails = (studentAssignmentId) => {
        navigate(`/student-assignments/${studentAssignmentId}/details`);
    };

    const handleSubmit = (courseId, assignmentId) => {
        navigate(`/assignments/${courseId}/${assignmentId}/submitassignment`);
    };

    const isStudent = user && user.user.account_type === 'student';

    const displayedAssignments = isStudent ? studentAssignments.filter(sa => sa.student_email === user.user.email) : studentAssignments;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Assignment Details</h1>
            {assignment ? (
                <div>
                    <h2>{assignment.title}</h2>
                    <p>{assignment.description}</p>
                    {course && <p>Course: {course.title}</p>}
                    <p>Start Time: {new Date(assignment.start_time).toLocaleString()}</p>
                    <p>End Time: {new Date(assignment.end_time).toLocaleString()}</p>
                    {assignment.assignment_file && (
                        <a href={assignment.assignment_file} target="_blank" rel="noopener noreferrer">Download Assignment File</a>
                    )}
                    {assignment.solution_key_file && (!isStudent || assignment.is_solution_key_available) && (
                        <a href={assignment.solution_key_file} target="_blank" rel="noopener noreferrer">Download Solution Key</a>
                    )}
                    
                    {!isStudent ? (
                        <div> 
                            <button onClick={handleEdit}>Edit Assignment</button>
                            <button onClick={handleDelete}>Delete Assignment</button>
                        </div>
                    ) : (<div> </div>)}
                    
                    <div>
                        {!isStudent ? <h3>Student Submissions</h3> : <h3>My Submission</h3>}
                        <ul>
                            {displayedAssignments.map(sa => (
                                <li key={sa.id}>
                                    <div>Email: {sa.student_email}</div>
                                    <div>Submitted: {new Date(sa.upload_time).toLocaleString()}</div>
                                    <div><a href={sa.result_file} target="_blank" rel="noopener noreferrer">View Submission</a></div>
                                    <button onClick={() => handleNavigateToDetails(sa.id)}>View Details</button>
                                </li>
                            ))}
                        </ul>
                        {isStudent && displayedAssignments.length < 1 ? 
                            (<div>
                            <button onClick={() =>handleSubmit(courseId, assignmentId)}>Submit Assignment</button>
                            </div>)
                            : null
                        }
                    </div>
                </div>
            ) : (
                <div>No assignment details found.</div>
            )}
        </div>

    );
}

export default AssignmentPage;
