import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';

function ListAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { courseId } = useParams();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get(`/api/assignments?course=${courseId}`);
                setAssignments(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div>
            <h1>Assignments</h1>
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
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No assignments found for this course.</p>
            )}
        </div>
    );
} export default ListAssignments;