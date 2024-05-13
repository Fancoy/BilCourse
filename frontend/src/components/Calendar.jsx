import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

function Calendar({ events }) {
    const renderEventContent = (eventInfo) => {
        return (
            <>
                <b>{eventInfo.timeText}</b>
                <i>{eventInfo.event.title}</i>
            </>
        );
    };

    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventContent={renderEventContent}
            displayEventTime={false}
        />
    );
}

export default Calendar;
