import React from "react";
import SideBar from "../components/Sidebar";
import Calendar from "../components/Calendar";
import Grid from '@mui/material/Grid';
import Search from "./Search";
import "./css/MainPage.css";

function SearchPage() {
      
    return (
        <div className="mainPage">
        <Grid container spacing={2}>
            <Grid item xs={3}>
            {/* xs={3} indicates that the Sidebar should take 3 out of 12 grid units on extra-small screens */}
            <SideBar />
            </Grid>
            <Grid item xs={6}>
            {/* xs={9} indicates that the Feed should take 9 out of 12 grid units on extra-small screens */}
            <Search header={"Home"} />
            </Grid>
            <Grid item xs={3}>
            {/* xs={3} indicates that the Calendar should take 3 out of 12 grid units on extra-small screens */}
            <Calendar />
            </Grid>
        </Grid>
        </div>
    );
}

export default SearchPage;