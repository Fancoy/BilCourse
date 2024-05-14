import { useState, useEffect } from "react";
import api from "../api";
import Course from "../components/Course"; // Make sure you have a Course component
import "../styles/Home.css";

function Home() {
    const [courses, setCourses] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]); // Added for available courses
    const [view, setView] = useState('myCourses'); // State to control which view to show

    const handleViewChange = (newView) => {
        setView(newView);
    };
    
    useEffect(() => {
        getCourses();
        fetchUserRole();
        if (userRole === 'student') { // Fetch available courses if the user is a student
            getAvailableCourses();
        }
    }, [userRole]); // Added userRole as a dependency to re-fetch when it's updated

    const fetchUserRole = () => {
        // Assuming '/api/user/account-type/' is your endpoint for fetching user role
        api.get('/api/user/account-type/')
           .then((response) => {
               setUserRole(response.data.account_type); // Adjust based on actual response structure
           })
           .catch((error) => console.error('Failed to fetch user role:', error));
    };

    const getCourses = () => {
        api
            .get("/api/courses")
            .then((res) => res.data)
            .then((data) => {
                setCourses(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };

    const getAvailableCourses = () => {
        // Fetch available courses where enrolled students are less than capacity
        api.get("/api/courses/available") // Assuming this is your endpoint for available courses
            .then((res) => {
                setAvailableCourses(res.data.available_courses); // Adjust based on your actual response structure
            })
            .catch((err) => console.error('Failed to fetch available courses:', err));
    };

    return (
        <div className="home">
            {userRole === 'student' && (
                <div className="view-buttons">
                    <button onClick={() => handleViewChange('myCourses')}>My Courses</button>
                    <button onClick={() => handleViewChange('availableCourses')}>Available Courses</button>
                </div>     
            )}
            
            {view === 'myCourses' && (
            <div>
                <h2>My Courses</h2>
                <div className="courses-container">
                    {courses.map((course) => (
                        <div key={course.id}>
                            <Course course={course} isHomePage={true} />                            
                        </div>
                    ))}
                </div>
            </div>
            )}
            {view === 'availableCourses' && (
                <div>
                    <h2>Available Courses</h2>
                    <div className="courses-container">
                        {availableCourses.map((course) => (
                            <div key={course.id}>
                                <Course course={course} isHomePage={true}/>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

}
    
    export default Home;
    
