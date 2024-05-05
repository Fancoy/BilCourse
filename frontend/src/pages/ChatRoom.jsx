import React, { useState, useEffect } from 'react';

function ChatRoom() {
    const [message, setMessage] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [ws, setWs] = useState(null);
    const roomName = 1;  // This should be dynamic based on your application needs

    useEffect(() => {
        const newWebSocket = new WebSocket('ws://http://127.0.0.1:8000//ws/chat/${roomName}/');

        newWebSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setChatLog((prevLog) => [...prevLog, data.message]);
        };

        newWebSocket.onclose = () => {
            console.error('Chat socket closed unexpectedly');
        };

        setWs(newWebSocket);

        return () => {
            newWebSocket.close();
        };
    }, [roomName]);

    const sendMessage = () => {
        if (ws && message) {
            ws.send(JSON.stringify({ message }));
            setMessage('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div>
            <textarea 
                readOnly
                value={chatLog.join('\n')}
                cols="100"
                rows="20"
            />
            <br />
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                size="100"
            />
            <br />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default ChatRoom;
