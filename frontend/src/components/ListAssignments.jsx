import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import EditAssignment from './EditAssignment';

function ListAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingAssignment, setEditingAssignment] = useState(null);  // To store the assignment being edited
    const { courseId } = useParams();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get(`/api/courses/${courseId}/assignment-list`);
                setAssignments(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [courseId]);


    const handleEditClick = (assignment) => {
        setEditingAssignment(assignment);
    };

    const handleClose = () => {
        setEditingAssignment(null);
    };

    const handleSave = (updatedAssignment) => {
        // Update the list of assignments with the updated data
        const updatedAssignments = assignments.map(assignment => 
            assignment.id === updatedAssignment.id ? updatedAssignment : assignment
        );
        setAssignments(updatedAssignments);
        handleClose();
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div>
            <h1>Assignments for Course ID: {courseId}</h1>
            {assignments.length > 0 ? (
                <ul>
                    {assignments.map(assignment => (
                        <li key={assignment.id}>
                            <h2>{assignment.title}</h2>
                            <p>{assignment.description}</p>

                            {assignment.assignment_file && (
                                <a href={assignment.assignment_file} target="_blank" rel="noopener noreferrer">Download Assignment File</a>
                            )}
                            {assignment.solution_key_file && (
                                <a href={assignment.solution_key_file} target="_blank" rel="noopener noreferrer">Download Solution Key</a>
                            )}
                            <button onClick={() => handleEditClick(assignment)}>Edit Assignment</button>
                            <Link to={`/assignments/${courseId}/${assignment.id}`}>
                                View Assignment Details
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No assignments found for this course.</p>
            )}
            {editingAssignment && (
                <EditAssignment 
                    assignment={editingAssignment} 
                    onClose={handleClose} 
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default ListAssignments;
