import "../styles/Course.css"; 

function Course({ course, onDelete }) {
    return (
      <div className="course">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <p>{course.capacity}</p>
        <p>{course.instructor}</p>
      </div>
    );
  }
  
  export default Course;