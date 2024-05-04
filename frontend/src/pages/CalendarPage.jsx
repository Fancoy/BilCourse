import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from './Calendar';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        axios.get('/api/events') // replace with the URL of your backend API
            .then(response => {
                setEvents(response.data);
            });
    }, []);

    const handleSubmit = event => {
        event.preventDefault();

        const newEvent = {
            title,
            description,
            start_date: startDate,
            end_date: endDate
        };

        axios.post('/api/events', newEvent) //We should replace with the URL of our backend API
            .then(response => {
                // Adding new event to the events array
                setEvents([...events, response.data]);
            });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required />
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                <button type="submit">Create Event</button>
            </form>

            <Calendar events={events} />
        </div>
    );
}

export default CalendarPage;