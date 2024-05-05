/* import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

function Room() {
  const { roomName } = useParams();
  const [chatLog, setChatLog] = useState('');
  const messageInputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    // socketRef.current = new WebSocket(`ws://${window.location.host}/ws/chat/${roomName}/`);
    socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);

    socketRef.current.onopen = function() {
      console.log("WebSocket is open now.");
    };

    socketRef.current.onmessage = function(e) {
      const data = JSON.parse(e.data);
      setChatLog(prev => prev + data.message + '\n');
    };

    socketRef.current.onclose = function(e) {
      console.error('Chat socket closed unexpectedly');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [roomName]);

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
      <textarea id="chat-log" cols="100" rows="20" value={chatLog} readOnly></textarea><br />
      <input ref={messageInputRef} id="chat-message-input" type="text" size="100" onKeyUp={handleKeyUp} /><br />
      <input id="chat-message-submit" type="button" value="Send" onClick={sendMessage} />
    </div>
  );
}

export default Room;
 */
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

function Room() {
  const { roomName } = useParams();
  const [messages, setMessages] = useState([]);
  const messageInputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create WebSocket connection
    socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);

    socketRef.current.onopen = () => {
      console.log("WebSocket is open now.");
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages(prevMessages => [...prevMessages, data]);
    };

    socketRef.current.onclose = () => {
      console.error('Chat socket closed unexpectedly');
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [roomName]);

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
      <h1>Chat Room: {roomName}</h1>
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

export default Room;
