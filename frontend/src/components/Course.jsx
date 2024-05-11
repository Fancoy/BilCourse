import "../styles/Course.css";
import { useNavigate } from 'react-router-dom';

function Course({ course, onDelete }) {
    const navigate = useNavigate();

    const goToCoursePage = () => {
        navigate(`/courses/${course.id}`);
    };

    return (
        <div className="course"  onClick={goToCoursePage}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p>Capacity: {course.capacity}</p>
            {course.instructor && <p>Instructor: {course.instructor.email}</p>}
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
        </div>
    );
}

export default Course;