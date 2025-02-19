import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import SideBar from '../components/Sidebar';
import Calendar from '../components/Calendar';
import api from '../api';
import '../styles/CoursePage.css';

function CoursePage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [taEmail, setTaEmail] = useState('');
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editCourseId, setEditCourseId] = useState(null);
    const [capacity, setCapacity] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [events, setEvents] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (courseId) {
            api.get(`/api/courses/${courseId}`)
                .then((res) => {
                    setCourse(res.data);
                    setError(null);
                })
                .catch((err) => {
                    setError('Error fetching course data');
                    console.error(err);
                });

            // Fetch assignments for the course
            api.get(`/api/assignments?course=${courseId}`)
                .then((response) => {
                    const filteredAssignments = response.data.filter(assignment => assignment.course === parseInt(courseId));
                    const transformedAssignments = filteredAssignments.map(assignment => ({
                        id: assignment.id,
                        title: assignment.title,
                        start: new Date(assignment.end_time).toISOString().split('T')[0],
                        extendedProps: { courseId: courseId } // Correctly set courseId
                    }));
                    setEvents(transformedAssignments);
                })
                .catch((err) => {
                    setError('Error fetching assignments');
                    console.error(err);
                });
        }
    }, [courseId]);

    const goToChatRoom = () => {
        navigate(`/chatroom/${course.title}`);
    };

    const goToActivities = () => {
        navigate(`/courses/${courseId}/listactivities`);
    };

    const goToForums = () => {
        navigate(`/courses/${courseId}/listforums`);
    };

    const goToCreateActivity = () => {
        navigate(`/courses/${courseId}/createactivity`);
    };

    const goToCreateForum = () => {
        navigate(`/courses/${courseId}/createforum`);
    };

    const goToCreateAssignment = () => {
        navigate(`/assignments/${courseId}/createassignment`);
    };

    const fetchCurrentUserEmail = () => {
        api.get("/api/user/")
            .then((response) => {
                console.log('User data response:', response.data);
                setCurrentUserEmail(response.data.email);
                setUserRole(response.data.account_type);
            })
            .catch((error) => {
                console.error('Failed to fetch user info:', error);
            });
    };

    const fetchCurrentUser = () => {
        fetchCurrentUserEmail();
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const assignTA = (courseId) => {
        api.post(`/api/courses/${courseId}/assign-ta`, { email: taEmail })
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
        api.post(`/api/courses/${courseId}/leave`)
            .then((res) => {
                alert('Left the course successfully!');
                navigate("/home");
            })
            .catch((error) => alert(error));
    };

    const enrollInCourse = (courseId) => {
        api.post(`/api/courses/${courseId}/enroll`)
            .then((res) => {
                if (res.status === 200) {
                    navigate("/home");
                    alert('Enrolled in course successfully!');
                } else {
                    alert('Failed to enroll in course.');
                }
            })
            .catch((error) => alert(error));
    };

    const deleteCourse = (id) => {
        api
            .delete(`/api/courses/${id}`)
            .then((res) => {
                if (res.status === 204) {
                    alert("Course deleted!");
                    navigate("/home");
                }
                else alert("Failed to delete course.");
            })
            .catch((error) => alert(error));
    };

    const startEditing = (course) => {
        setIsEditing(true);
        setEditCourseId(course.id);
        setTitle(course.title);
        setDescription(course.description);
        setCapacity(course.capacity.toString());
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
            .patch(`/api/courses/${editCourseId}`, { title, description, capacity })
            .then((res) => {
                alert("Course updated!");
                stopEditing();
            })
            .catch((err) => alert(JSON.stringify(err.response.data)));
    };

    if (error) return <p className="course-error">{error}</p>;
    if (!course) return <p className="course-loading">Loading...</p>;
    const studentExists = course.students.some(student => student.email === currentUserEmail);

    const isTA = course.assistants && course.assistants.some(assistant => assistant.email === currentUserEmail);

    return (
        <div className="coursePage">
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <SideBar />
                </Grid>
                <Grid item xs={6}>
                    <div className="course-content">
                        <h1 className="course-title">{course.title}</h1>
                        <p className="course-instructor">Instructor: {course.instructor?.email}</p>
                        <p className="course-description">{course.description}</p>
                        <p className="course-info">Capacity: {course.capacity}</p>
                        {course.assistants && course.assistants.length > 0 && (
                            <>
                                <h4>Assistants</h4>
                                <ul>
                                    {course.assistants.map(assistant => (
                                        <li key={assistant.email}>{assistant.email}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {course.students && course.students.length > 0 && (
                            <>
                                <h4>Students</h4>
                                <ul>
                                    {course.students.map(student => (
                                        <li key={student.email}>{student.email}</li>
                                    ))}
                                </ul>
                            </>
                        )}
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
                                <button onClick={goToCreateActivity}>Create Activity</button>
                                <button onClick={goToCreateAssignment}>Create Assignment</button>
                                <button onClick={goToCreateForum}>Create Forum</button>
                            </>
                        )}                    
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
                        {(studentExists || userRole === 'instructor' || isTA) &&(
                            <div>
                                <button onClick={() => navigate(`/assignments/${courseId}/listassignments`)}>View Assignments</button>
                                <button onClick={goToChatRoom}>Chat</button>
                                <button onClick={goToActivities}>Activities</button>
                                <button onClick={goToForums}>Forums</button>
                            </div>
                        )}
                        {userRole === 'student' && (
                            <div className="enroll-leave-buttons">
                                {studentExists ? (
                                    <div>
                                        <button onClick={() => leaveCourse(course.id)}>Leave Course</button>
                                    </div>
                                ) : (
                                    <button onClick={() => enrollInCourse(course.id)}>Enroll</button>
                                )}
                            </div>
                        )}
                    </div>
                </Grid>
                <Grid item xs={3}>
                    <Calendar events={events} />
                </Grid>
            </Grid>
        </div>
    );
}

export default CoursePage;