import React, { useState, useEffect } from 'react';
import api from "../api";
import "../styles/Profile.css";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const fetchUserProfile = () => {
  return api.get('/api/profile/');
};

const Profile = () => {
  const [profile, setProfile] = useState({
    user: {},
    courses: [],
    assisting: [],
    teaching: [],
    badges: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    fetchUserProfile()
      .then(response => {
        setProfile(response.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch user profile:', err);
        setError(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile.</div>;
 
  return (
    <div className="profile-container">
        <h1>Profile Page</h1>
        <button onClick={() => navigate('/')} className="back-button">Back to Home</button>
        <div className="profile-details">
            <h2>User Details</h2>
            <p>First Name: {profile.user.first_name}</p>
            <p>Email: {profile.user.email}</p>
            <p>Last Name: {profile.user.last_name}</p>
            <p>Mobile Number: {profile.user.mobile_number}</p>
            <p>Account Type: {profile.user.account_type}</p>
        </div>
        {profile.user.account_type === 'student' && (
            <div className="profile-courses">
                <h2>Courses Taken</h2>
                {profile.courses.map(course => (
                <div className="course-item" key={course.id}>
                    <p>Course Name: {course.title}</p>
                    <p>Role: Student</p>
                </div>
                ))}
            </div>
        )}
        {profile.user.account_type === 'student' && (
            <div className="profile-courses">
                <h2>Courses Assisted</h2>
                {profile.assisting.map(course => (
                <div className="course-item" key={course.id}>
                    <p>Course Name: {course.title}</p>
                    <p>Role: Assistant</p>
                </div>
                ))}
            </div>
        )}
        {profile.user.account_type === 'instructor' && (
            <div className="profile-teaching">
                <h2>Teaching</h2>
                {profile.teaching.map(course => (
                <div className="teaching-item" key={course.id}>
                    <p>Course Name: {course.title}</p>
                    <p>Role: Instructor</p>
                </div>
                ))}
            </div>
        )}
        <div className="profile-badges">
            <h2>Badges</h2>
            {profile.badges.map(badge => (
            <div className="badge-item" key={badge.id}>
                <p>Badge Name: {badge.name}</p>
                <p>Description: {badge.description}</p>
                <p>{badge.user_count} have this badge.</p>
            </div>
            ))}
        </div>
    </div>
  );
};

export default Profile;
