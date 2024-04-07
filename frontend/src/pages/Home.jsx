import { useState, useEffect } from "react";
import api from "../api";
import Course from "../components/Course"; // Make sure you have a Course component
import "../styles/Home.css";

function Home() {
    const [courses, setCourses] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [capacity, setCapacity] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [editCourseId, setEditCourseId] = useState(null);

    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        getCourses();
        fetchUserRole();
    }, []);

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

    const createCourse = (e) => {
        e.preventDefault();
        console.log(title, description, capacity);
        api
            .post("/api/courses/", { title, description, capacity })
            .then((res) => {
                if (res.status === 201) alert("Course created!");
                else alert("Failed to create course.");
                getCourses();
            })
            .catch((err) => {
                if (err.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(err.response.data);
                    alert(JSON.stringify(err.response.data));
                } else if (err.request) {
                    // The request was made but no response was received
                    console.log(err.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', err.message);
                }
            });
            //.catch((err) => alert(err));
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
            <h2>Courses</h2>
            <div className="courses-container">
                {courses.map((course) => (
                    <div key={course.id}>
                        <Course course={course} />
                        <button onClick={() => startEditing(course)}>Edit</button> {/* Edit Button */}
                        <button onClick={() => deleteCourse(course.id)}>Delete</button> {/* Delete Button */}
                    </div>
                ))}
            </div>
            {userRole === 'instructor' ? (
                isEditing ? (
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
                ) : (
                    <div className="form-container">
                        <h2>Create a Course</h2>
                        <form onSubmit={createCourse}>
                            <label htmlFor="create-title">Title:</label>
                            <br />
                            <input
                                type="text"
                                id="create-title"
                                name="title"
                                required
                                onChange={(e) => setTitle(e.target.value)}
                                value={title}
                            />
                            <br />
                            <label htmlFor="create-description">Description:</label>
                            <br />
                            <textarea
                                id="create-description"
                                name="description"
                                required
                                onChange={(e) => setDescription(e.target.value)}
                                value={description}
                            ></textarea>
                            <br />
                            <label htmlFor="create-capacity">Capacity:</label>
                            <br />
                            <input
                                type="number"
                                id="create-capacity"
                                name="capacity"
                                min="1"
                                required
                                onChange={(e) => setCapacity(e.target.value)}
                                value={capacity}
                            />
                            <br />
                            <input type="submit" value="Submit"></input>
                        </form>
                    </div>
                ) 
            ) : null}
        </div>
    );    
}

export default Home;