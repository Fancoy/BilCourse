import React from "react";
import "./css/SidebarOption.css";
import { useNavigate } from 'react-router-dom';

function SidebarOption({ active, text, Icon }) {
    const navigate = useNavigate();

    // Function to handle navigation with modified path
    const handleNavigation = () => {
        // Remove whitespace and convert text to lowercase
        const path = text.replace(/\s+/g, '').toLowerCase();
        navigate('/' + path);
    };

    return (
        <div onClick={handleNavigation} className={`sidebarOption ${active && "sidebarOption--active"}`}>
            <Icon />
            <h2>{text}</h2>
        </div>
    );
}

export default SidebarOption;
