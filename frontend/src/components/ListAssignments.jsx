import React, { useState } from 'react';
import api from '../api';

function ListAssignments() {
    // IMPORTANT: THIS IS NOT THE ACTUALLY IMPLEMENTATION OF THE COMPONENT
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get('/api/assignments');
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
            <ul>
                {assignments.map((assignment) => (
                    <li key={assignment.id}>
                        <h2>{assignment.title}</h2>
                        <p>{assignment.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
} export default ListAssignments;