import React, { useState, useEffect } from "react";
import SideBar from "../components/Sidebar";
import Calendar from "../components/Calendar";
import Grid from '@mui/material/Grid';
import Home from "./Home";
import "./css/MainPage.css";
import api from '../api';

function MainPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/api/profile/');
                const profile = response.data;

                const courseIds = [
                    ...profile.courses.map(course => course.id),
                    ...profile.assisting.map(course => course.id),
                    ...profile.teaching.map(course => course.id)
                ];

                const fetchAssignments = async () => {
                    try {
                        const response = await api.get('/api/assignments');
                        return response.data.filter(assignment => courseIds.includes(assignment.course));
                    } catch (error) {
                        console.error('Error fetching assignments:', error);
                        return [];
                    }
                };

                const assignments = await fetchAssignments();
                const transformedAssignments = assignments.map(assignment => ({
                    id: assignment.id,
                    title: assignment.title,
                    start: new Date(assignment.end_time).toISOString().split('T')[0],
                    extendedProps: { courseId: assignment.course }
                }));

                setEvents(transformedAssignments);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="mainPage">
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <SideBar />
                </Grid>
                <Grid item xs={6}>
                    <Home header={"Home"} />
                </Grid>
                <Grid item xs={3}>
                    <Calendar events={events} />
                </Grid>
            </Grid>
        </div>
    );
}

export default MainPage;
