import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function Forum() {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const [forum, setForum] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newHeader, setNewHeader] = useState("");

  useEffect(() => {
    fetchForumDetails();
    fetchMessages();
  }, []);

  const fetchForumDetails = async () => {
    try {
      const response = await api.get(`/api/forums/${forumId}`);
      if (response.status === 200) {
        setForum(response.data);
      } else {
        alert('Failed to fetch forum details.');
      }
    } catch (error) {
      console.error('Error fetching forum details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/forums/${forumId}/list-messages`);
      if (response.status === 200) {
        setMessages(response.data);
      } else {
        alert('Failed to fetch messages.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() && newHeader.trim()) {
      try {
        const response = await api.post(`/api/forums/${forumId}/send-message`, {
          content: newMessage,
          header: newHeader
        });
        if (response.status === 201) {
          setNewMessage("");
          setNewHeader("");
          fetchMessages(); // refresh messages after sending
        } else {
          alert('Failed to send message.');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  if (!forum) return <div>Loading forum details...</div>;

  return (
    <div>
        <button onClick={() => navigate(`/courses/${forum.course}/listforums`)}>Go Back</button>
      <h1>Forum: {forum.title}</h1>
      <h2>Course ID: {forum.course}</h2>
      <div>
        <h3>Messages:</h3>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>{msg.header}: {msg.content} (by {msg.sender})</p>
          </div>
        ))}
        <div>
          <label>Header:</label>
          <input
            type="text"
            value={newHeader}
            onChange={(e) => setNewHeader(e.target.value)}
            placeholder="Header of the message..."
          />
        </div>
        <div>
          <label>Message:</label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
          />
        </div>
        <button onClick={sendMessage}>Send Message</button>
      </div>
    </div>
  );
}

export default Forum;
