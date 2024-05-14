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
        const fetchAssignments = async () => {
            try {
                const response = await api.get('/api/assignments'); // Replace with the URL of your backend API
                console.log(response.data); // Log the response data
                const transformedAssignments = response.data.map(assignment => ({
                    title: assignment.title,
                    start: new Date(assignment.end_time).toISOString().split('T')[0], // Use end_time and format date
                }));
                setEvents(transformedAssignments);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchAssignments();
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
