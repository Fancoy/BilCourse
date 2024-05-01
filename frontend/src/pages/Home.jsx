import { useState, useEffect } from "react";
import api from "../api";
import Course from "../components/Course"; // Make sure you have a Course component
import "../styles/Home.css";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Home() {
    const [courses, setCourses] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [capacity, setCapacity] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [editCourseId, setEditCourseId] = useState(null);

    const [userRole, setUserRole] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]); // Added for available courses
    const [taEmail, setTaEmail] = useState('');
    
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    const assignTA = (courseId) => {
        api.post(`/api/courses/${courseId}/assign-ta/`, { email: taEmail })
            .then(res => {
                alert('TA assigned successfully!');
                setTaEmail(''); // Clear the input field after successful assignment
            })
            .catch(err => {
                alert('Failed to assign TA.');
                console.error(err);
            });
    };

    const leaveCourse = (courseId) => {
        api.post(`/api/courses/leave/${courseId}/`)
            .then((res) => {
                alert('Left the course successfully!');
                getCourses();
                getAvailableCourses();
            })
            .catch((error) => alert(error));
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
            .get("/api/courses/")
            .then((res) => res.data)
            .then((data) => {
                setCourses(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };

    const getAvailableCourses = () => {
        // Fetch available courses where enrolled students are less than capacity
        api.get("/api/courses/available/") // Assuming this is your endpoint for available courses
            .then((res) => {
                setAvailableCourses(res.data.available_courses); // Adjust based on your actual response structure
            })
            .catch((err) => console.error('Failed to fetch available courses:', err));
    };

    const enrollInCourse = (courseId) => {
        // Function to enroll the current user in a course
        api.post(`/api/courses/enroll/${courseId}/`)
            .then((res) => {
                if (res.status === 200) {
                    alert('Enrolled in course successfully!');
                    getAvailableCourses(); // Refresh the available courses list
                    getCourses(); // Refresh the main courses list to include the newly enrolled course 
                } else {
                    alert('Failed to enroll in course.');
                }
            })
            .catch((error) => alert(error));
    };

    const deleteCourse = (id) => {
        api
            .delete(`/api/courses/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Course deleted!");
                else alert("Failed to delete course.");
                getCourses();
            })
            .catch((error) => alert(error));
    };

    const startEditing = (course) => {
        setIsEditing(true);
        setEditCourseId(course.id);
        setTitle(course.title);
        setDescription(course.description);
        setCapacity(course.capacity.toString());  // Ensure capacity is a string for the input field
    };

    const stopEditing = () => {
        setIsEditing(false);
        setEditCourseId(null);
        setTitle('');
        setDescription('');
        setCapacity('');
    };

    const updateCourse = (e) => {
        e.preventDefault();
        api
            .patch(`/api/courses/edit/${editCourseId}/`, { title, description, capacity })
            .then((res) => {
                alert("Course updated!");
                stopEditing();
                getCourses();
            })
            .catch((err) => alert(JSON.stringify(err.response.data)));
    };


    return (
        <div className="home">
            <h2>My Courses</h2>
            <button onClick={() => navigate('/profile')} className="back-button">Profile</button>
            <button onClick={() => navigate('/logout')} className="back-button">Logout</button>
            <div className="courses-container">
                {courses.map((course) => (
                    <div key={course.id}>
                        <Course course={course} />
                        {userRole === 'instructor' && (
                            <>
                                <button onClick={() => startEditing(course)}>Edit</button>
                                <button onClick={() => deleteCourse(course.id)}>Delete</button>
                                <input 
                                    type="email" 
                                    placeholder="Assign TA by email" 
                                    value={taEmail}
                                    onChange={(e) => setTaEmail(e.target.value)} 
                                />
                                <button onClick={() => assignTA(course.id)}>Assign TA</button>
                            </>
                        )}
                        {userRole === 'student' && (
                            <button onClick={() => leaveCourse(course.id)}>Leave Course</button>
                        )}
                    </div>
                ))}
            </div>
            {userRole === 'instructor' && isEditing && (
                <div className="form-container">
                    <h2>Edit Course</h2>
                    <form onSubmit={updateCourse}>
                        <label htmlFor="edit-title">Title:</label>
                        <br />
                        <input
                            type="text"
                            id="edit-title"
                            name="title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <br />
                        <label htmlFor="edit-description">Description:</label>
                        <br />
                        <textarea
                            id="edit-description"
                            name="description"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                        <br />
                        <label htmlFor="edit-capacity">Capacity:</label>
                        <br />
                        <input
                            type="number"
                            id="edit-capacity"
                            name="capacity"
                            min="1"
                            required
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                        />
                        <br />
                        <input type="submit" value="Update Course"></input>
                        <button type="button" onClick={stopEditing}>Cancel</button>
                    </form>
                </div>
            )}
            {/* Your existing JSX for courses */}
            {userRole === 'student' && ( // Conditional rendering for students
                <div>
                    <h2>Available Courses</h2>
                    <div className="courses-container">
                        {availableCourses.map((course) => (
                            <div key={course.id}>
                                <Course course={course} /> {/* Assuming you have a Course component */}
                                <button onClick={() => enrollInCourse(course.id)}>Enroll</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
    }
    
    export default Home;
    