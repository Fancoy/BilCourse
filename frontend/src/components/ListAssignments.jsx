import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import EditAssignmentModal from './EditAssignment';

function ListAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState({});
    const { courseId } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openEditModal = () => setIsEditModalOpen(true);
    const closeEditModal = () => setIsEditModalOpen(false);

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
        fetchUser();
    }, []);

    const fetchUser = async () => { 
        try {
            const response = await api.get('/api/user/');
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const userRole = user.account_type;

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
                            {userRole === 'student' && (
                                <>                                
                                    <button onClick={openModal}>Submit Assignment</button>
                                    <SubmitAssignmentModal 
                                    isOpen={isModalOpen} 
                                    onClose={closeModal} 
                                    assignmentId={assignment.id}
                                    studentId={user.id} 
                                    />
                                </>
                            )}

                            {userRole === 'student' && (
                                <>
                                    <button onClick={openEditModal}>Edit Assignment</button>
                                    <EditAssignmentModal 
                                        isOpen={isEditModalOpen} 
                                        onClose={closeEditModal} 
                                        assignmentId={assignment.Id}
                                    />
                                </>
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