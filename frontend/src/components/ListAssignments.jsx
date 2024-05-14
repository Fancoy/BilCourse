import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

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
    }, [courseId]);

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
                            <Link to={`/assignments/${courseId}/${assignment.id}`}>
                                View Assignment Details
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No assignments found for this course.</p>
            )}
        </div>
    );
}

export default ListAssignments;
