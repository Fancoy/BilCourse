// File: src/pages/CoursePage.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import SideBar from '../components/Sidebar';
import Calendar from '../components/Calendar';
import api from '../api';
import '../styles/CoursePage.css';

function CoursePage() {
    const { courseId } = useParams(); // Extract courseId from the URL
    const [course, setCourse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (courseId) {
            api.get(`/api/courses/${courseId}`)
                .then((res) => {
                    setCourse(res.data);
                    setError(null); // Clear errors if data fetched successfully
                })
                .catch((err) => {
                    setError('Error fetching course data');
                    console.error(err);
                });
        }
    }, [courseId]);

    // Check for errors or loading state
    if (error) return <p className="course-error">{error}</p>;
    if (!course) return <p className="course-loading">Loading...</p>;

    // Grid Layout with Sidebar
    return (
        <div className="coursePage">
            <Grid container spacing={2}>
                {/* Sidebar */}
                <Grid item xs={3}>
                    <SideBar />
                </Grid>
                {/* Course Content */}
                <Grid item xs={6}>
                    <div className="course-content">
                        <h1 className="course-title">{course.title}</h1>
                        <p className="course-instructor">Instructor: {course.instructor?.email}</p>
                        <p className="course-description">{course.description}</p>
                        <p className="course-info">Capacity: {course.capacity}</p>
                    </div>
                </Grid>
                {/* Calendar */}
                <Grid item xs={3}>
                    <Calendar />
                </Grid>
            </Grid>
        </div>
    );
}

export default CoursePage;
