import React, { useState, useEffect } from 'react';
import api from '../api';
import './css/Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get('/api/profile/');
                const profile = response.data;

                const courseIds = [
                    ...profile.courses.map(course => course.id),
                    ...profile.assisting.map(course => course.id),
                    ...profile.teaching.map(course => course.id)
                ];

                const allAssignments = await api.get('/api/assignments');
                const filteredAssignments = allAssignments.data.filter(assignment => courseIds.includes(assignment.course));
                setAssignments(filteredAssignments);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    const handleSend = async () => {
        const userMessage = input;
        setMessages([...messages, { sender: 'user', text: userMessage }]);
        setInput('');

        // Prepare the prompt for the AI
        const assignmentInfo = assignments.map(assignment => 
            `Assignment ${assignment.id}: ${assignment.title} - ${assignment.description} (Start: ${new Date(assignment.start_time).toLocaleString()}, End: ${new Date(assignment.end_time).toLocaleString()})`
        ).join("\n");

        const prompt = `You are a helpful assistant. Here is the list of assignments:\n${assignmentInfo}\n\nUser: ${userMessage}\nAssistant:`;

        // Send the user message and the assignment data to the Django backend for processing
        try {
            const response = await api.post('/api/chat', { message: prompt });
            const botMessage = response.data.message;
            setMessages([...messages, { sender: 'user', text: userMessage }, { sender: 'bot', text: botMessage }]);
        } catch (error) {
            console.error('Error communicating with the backend:', error);
            setMessages([...messages, { sender: 'user', text: userMessage }, { sender: 'bot', text: 'Sorry, I couldn\'t process your request. Please try again later.' }]);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="chatbot-container">
            <div className="chatbot-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="chatbot-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about an assignment..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
            <div className="chatbot-prompts">
                <h4>Try asking:</h4>
                <ul>
                    <li>Tell me about assignment 6.</li>
                    <li>When is assignment 3 due?</li>
                    <li>What is assignment 4 about?</li>
                    <li>How can I download the assignment file for assignment 2?</li>
                    <li>Is there a solution key available for assignment 7?</li>
                </ul>
            </div>
        </div>
    );
};

export default Chatbot;
