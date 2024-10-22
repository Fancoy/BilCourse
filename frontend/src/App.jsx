import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MainPage from "./pages/MainPage"
import ProfilePage from "./pages/ProfilePage"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import CreateCourse from "./pages/CreateCourse"
import CoursePage from "./pages/CoursePage"
import SearchPage from "./pages/SearchPage"
import CalendarPage from "./pages/CalendarPage"
import Room from "./pages/Room"
import PrivateRoom from "./pages/PrivateRoom"
import Messages from "./pages/Messages"
import CreateActivity from "./pages/CreateActivity"
import ListActivities from "./pages/ListActivities"
import CreateAssignment from "./components/CreateAssignment"
import ListAssignments from "./components/ListAssignments"
import VerifyEmail from "./pages/VerifyEmail"; // Import the VerifyEmail component
import UserProfile from "./pages/UserProfile"
import CreateForum from "./pages/CreateForum";
import ListForums from "./pages/ListForums";
import Forum from "./pages/Forum";
import AssignmentPage from "./components/AssignmentPage"
import EditAssignmentPage from "./components/EditAssignmentPage"
import SubmitAssignmentPage from "./components/SubmitAssignmentPage"
import StudentAssignmentDetailsPage from "./components/StudentAssignmentDetailsPage"
import ChatbotPage from "./pages/ChatbotPage";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route path="" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/chatroom/:roomName"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privatechat/:roomName"
          element={
            <ProtectedRoute>
              <PrivateRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
          <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        /> */}
        <Route path="*" element={<NotFound />}></Route>
        <Route path="/createcourse" element={<CreateCourse />} />
        <Route path="/createforum" element={<CreateCourse />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />
        <Route path="/forums/:forumId" element={<Forum />} />
        <Route path="/courses/:courseId/createforum" element={<CreateForum />} />
        <Route path="/users/:email" element={<UserProfile />} />
        <Route path="/courses/:courseId/listactivities" element={<ListActivities />} />
        <Route path="/courses/:courseId/listforums" element={<ListForums />} />
        <Route path="/courses/:courseId/createactivity" element={<ProtectedRoute><CreateActivity /></ProtectedRoute>} />
        <Route path="/assignments/:courseId/listassignments" element={<ListAssignments />} />
        <Route path="/assignments/:courseId/createassignment" element={<ProtectedRoute><CreateAssignment /></ProtectedRoute>} />
        <Route path="/assignments/:courseId/:assignmentId" element={<AssignmentPage />} />
        <Route path="/edit-assignment/:assignmentId" element={<EditAssignmentPage />} />
        <Route path="/assignments/:courseId/:assignmentId/submitassignment" element={<SubmitAssignmentPage />} />
        <Route path="/student-assignments/:studentAssignmentId/details" element={<StudentAssignmentDetailsPage />} />
        
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* Add the VerifyEmail route */}
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
