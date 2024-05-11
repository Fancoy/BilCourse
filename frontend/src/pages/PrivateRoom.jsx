import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ACCESS_TOKEN } from '../../src/constants';

function PrivateRoom() {
  const { roomName } = useParams();
  const [messages, setMessages] = useState([]);
  const messageInputRef = useRef(null);
  const socketRef = useRef(null);
  const connectionEstablished = useRef(false);  // Ref to track if connection is already established
  const token = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    const createOrJoinChat = async () => {
      if (!token) {
        console.error('JWT token not found');
        return;
      }

      const emails = roomName.split('and');
      if (emails.length !== 2) {
        console.error('Invalid room name format');
        return;
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/create_private_chat/', {
          user1_email: emails[0].trim(), 
          user2_email: emails[1].trim()
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if ((response.status === 201 || response.status === 200) && !connectionEstablished.current) {
          connectionEstablished.current = true; // Set flag to true to prevent multiple connections
          socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/private/${encodeURIComponent(response.data.title)}/?token=${token}`);
          
          socketRef.current.onopen = () => console.log("WebSocket is open now.");
          
          socketRef.current.onmessage = (e) => {
              const data = JSON.parse(e.data);
              setMessages(prevMessages => [...prevMessages, data]);
          };
          
          socketRef.current.onclose = () => {
              console.error("WebSocket closed unexpectedly.");
              connectionEstablished.current = false; // Reset connection flag on close
          };

          socketRef.current.onerror = (error) => {
              console.error("WebSocket error:", error);
          };
        }
      } catch (error) {
        console.error('Error creating or joining private chat:', error);
      }
    };

    if (!connectionEstablished.current) {
      createOrJoinChat();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        connectionEstablished.current = false; // Reset connection flag on component unmount
      }
    };
  }, [roomName, token]); // Dependency array ensures effect runs only when roomName or token changes

  const sendMessage = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = messageInputRef.current.value;
      socketRef.current.send(JSON.stringify({ 'message': message }));
      messageInputRef.current.value = '';
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div>
      <h1>Private Chat Room: {roomName}</h1>
      <div id="chat-log" style={{ height: '300px', overflowY: 'auto', backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <strong>{msg.sender}</strong> [{new Date(msg.timestamp).toLocaleString()}]: {msg.message}
          </div>
        ))}
      </div>
      <input 
        ref={messageInputRef} 
        id="chat-message-input" 
        type="text" 
        size="100" 
        onKeyUp={handleKeyUp} 
        placeholder="Type a message..."
        style={{ width: 'calc(100% - 22px)', padding: '10px' }}
      /><br />
      <button 
        id="chat-message-submit" 
        type="button" 
        onClick={sendMessage}
        style={{ marginTop: '10px' }}
      >
        Send
      </button>
    </div>
  );
}

export default PrivateRoom;
