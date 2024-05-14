import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useNavigate } from 'react-router-dom';

function Calendar({ events }) {
    const navigate = useNavigate();

    const handleEventClick = (clickInfo) => {
        const assignmentId = clickInfo.event.id;
        const courseId = clickInfo.event.extendedProps.courseId;

        console.log('Assignment ID:', assignmentId);
        console.log('Course ID:', courseId);

        if (courseId && assignmentId) {
            navigate(`/assignments/${courseId}/${assignmentId}`);
        } else {
            console.error('Missing courseId or assignmentId');
        }
    };

    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            displayEventTime={false}
            eventClick={handleEventClick}
        />
    );
}

export default Calendar;