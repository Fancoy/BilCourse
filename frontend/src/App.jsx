import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MainPage from "./pages/MainPage"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import CreateCourse from "./pages/CreateCourse"
import Room from "./pages/Room"

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
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />}></Route>
        <Route path="/createcourse" element={<CreateCourse />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
