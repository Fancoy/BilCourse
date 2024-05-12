import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from "../api"; // Ensure this is correctly imported based on your setup

function Messages() {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        fetchUserChats();
    }, []);

    const fetchUserChats = () => {
        api.get('/api/user_chats/')
            .then(response => {
                setChats(response.data); // Assuming response.data contains the array of chats
            })
            .catch(error => {
                console.error('Failed to fetch user chats:', error);
            });
    };

    return (
        <div>
            <h1>Private Messages</h1>
            <div className="chats-list">
                {chats.length > 0 ? chats.map((chat) => (
                    <div key={chat.id} className="chat-preview">
                        <h2>{chat.title}</h2>
                        <Link to={`/privatechat/${chat.title}`} className="chat-link">Go to Chat</Link> {/* Link to chat detail page */}
                    </div>
                )) : (
                    <p>No private messages found.</p>
                )}
            </div>
        </div>
    );
}

export default Messages;
