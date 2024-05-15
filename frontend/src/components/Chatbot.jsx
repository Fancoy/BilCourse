import React, { useState, useEffect } from 'react';
import api from '../api';
import './css/Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [generalData, setGeneralData] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get('/api/profile/');
                const generalDataRes = await api.get('/user/details/');
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
                setGeneralData(generalDataRes.data);
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

        // Function to format the assignments
    const formatAssignments = (assignments) => assignments.map(assignment => 
        `Assignment ${assignment.id}: ${assignment.title} - ${assignment.description} (Start: ${new Date(assignment.start_time).toLocaleString()}, End: ${new Date(assignment.end_time).toLocaleString()})`
    ).join("\n");

    // Function to format the courses
    const formatCourses = (courses) => courses.map(course => 
        `Course ${course.id}: ${course.title} - ${course.description} (Capacity: ${course.capacity}, Instructor: ${course.instructor.email})`
    ).join("\n");

    // Function to format the forum messages
    const formatForumMessages = (forumMessages) => forumMessages.map(message => 
        `Message ${message.id} in Forum ${message.forum}: ${message.header} - ${message.content} (Sent: ${new Date(message.created_time).toLocaleString()})`
    ).join("\n");

    // Preparing the prompt
    const assignmentInfo = formatAssignments(generalData.assignments);
    const courseInfo = formatCourses(generalData.courses);
    const forumMessageInfo = formatForumMessages(generalData.forumMessages);

    const prompt = `You are a helpful assistant. Here is the information you need:

    Assignments:
    ${assignmentInfo}

    Courses:
    ${courseInfo}

    Forum Messages:
    ${forumMessageInfo}

    User: ${userMessage}
    Assistant:`;


        // Send the user message and the assignment data to the Django backend for processing
        try {
            const response = await api.post('/api/chat', { message: prompt });
            const botMessage = response.data.message;
            const graphInfo = response.data.graph;

            setMessages([...messages, { sender: 'user', text: userMessage }, { sender: 'bot', text: botMessage }]);
            if (graphInfo) {
                setGraphData(`data:image/png;base64,${graphInfo}`);
            } else {
                setGraphData(null);
            }
        } catch (error) {
            console.error('Error communicating with the backend:', error);
            setMessages([...messages, { sender: 'user', text: userMessage }, { sender: 'bot', text: 'Sorry, I couldn\'t process your request. Please try again later.' }]);
            setGraphData(null);
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
            {console.log(generalData)}
            <div className="chatbot-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        <strong>{message.sender === 'user' ? 'User' : 'Chatbot'}:</strong> {message.text}
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
                    <li>Show me a bar graph of assignment scores.</li>
                </ul>
            </div>
            {graphData && (
                <div className="chatbot-graph">
                    <img src={graphData} alt="Generated Graph" />
                </div>
            )}
        </div>
    );
};

export default Chatbot;
