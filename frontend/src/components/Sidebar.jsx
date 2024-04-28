import React from "react";
import SideBarOption from "./SidebarOption";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ForumIcon from "@mui/icons-material/Forum";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import { useState, useEffect } from "react";
import api from "../api";
import "./css/Sidebar.css";

function Sidebar() {

    const [userRole, setUserRole] = useState('');
    const [courses, setCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]); // Added for available courses
    


    useEffect(() => {
        getCourses();
        fetchUserRole();
        if (userRole === 'student') { // Fetch available courses if the user is a student
            getAvailableCourses();
        }
    }, [userRole]); // Added userRole as a dependency to re-fetch when it's updated

    const getAvailableCourses = () => {
        // Fetch available courses where enrolled students are less than capacity
        api.get("/api/courses/available/") // Assuming this is your endpoint for available courses
            .then((res) => {
                setAvailableCourses(res.data.available_courses); // Adjust based on your actual response structure
            })
            .catch((err) => console.error('Failed to fetch available courses:', err));
    };
    
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

  return (
    <div className="sidebar">
      <SideBarOption text="Home" Icon={HomeIcon} />
      <SideBarOption text="Profile" Icon={AccountCircleIcon} />
      <SideBarOption text="Bookmarks" Icon={BookmarkIcon} />
      <SideBarOption text="Messages" Icon={ForumIcon} />
      <SideBarOption text="Search" Icon={SearchIcon} />
      <SideBarOption text="Calender" Icon={EventIcon} />


      {/* Instructor Options */}
      {userRole === 'instructor' && (
        <SideBarOption text="Create Course" Icon={AddIcon} />
        )
    }
      {/*<div className="logo__component">
        <img
            src={Logo}
            width="100"
            height="100"
            float="left"
            alt="Logo"
            margin-top="100px"
            className="sidebar-logo"
        />
      </div>
      <SideBarOption text='Notifications' Icon={NotificationsIcon} />*/}
    </div>
  );
}
export default Sidebar;