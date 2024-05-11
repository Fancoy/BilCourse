import react from "react"
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

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
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
        {/*<Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />      */}          
        <Route path="*" element={<NotFound />}></Route>
        <Route path="/createcourse" element={<CreateCourse />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
