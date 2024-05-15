import React from 'react';
import Grid from '@mui/material/Grid';
import SideBar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';

function ChatbotPage() {
    return (
        <div className="chatbotPage">
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <SideBar />
                </Grid>
                <Grid item xs={9}>
                    <Chatbot />
                </Grid>
            </Grid>
        </div>
    );
}

export default ChatbotPage;