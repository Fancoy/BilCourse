import React, { useState } from "react";
import api from "../api";
import Grid from "@mui/material/Grid";
import Sidebar from "../components/Sidebar";
import "./css/MainPage.css";
import "../styles/Home.css";

function CreateCourse() {
  // Declare states inside the component body
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleCreateCourse = (e) => {
    e.preventDefault();
    console.log(title, description, capacity);
    api.post("/api/courses/", { title, description, capacity })
      .then((res) => {
        if (res.status === 201) {
          alert("Course created!");
        } else {
          alert("Failed to create course.");
        }
        // getCourses(); // Uncomment this if you need to refresh the courses list
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          alert(JSON.stringify(err.response.data));
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log('Error', err.message);
        }
      });
  };

  return (
    <div className="mainPage">
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Sidebar />
      </Grid>
      <Grid item xs={9}>
        <div className="form-container">
          <h2>Create a Course</h2>
          <form onSubmit={handleCreateCourse}>
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
            />
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
            <input type="submit" value="Submit" />
          </form>
        </div>
      </Grid>
    </Grid>
    </div>
  );
}

export default CreateCourse;
