import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import Matches from "./pages/Matches";
import People from "./pages/People";

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="px-4 pb-10">
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/projects" element={guard(<Projects />)} />
          <Route path="/projects/new" element={guard(<NewProject />)} />
          <Route path="/projects/:id" element={guard(<ProjectDetail />)} />
          <Route path="/matches" element={guard(<Matches />)} />
          <Route path="/people" element={guard(<People />)} />
          <Route path="/profile" element={guard(<Profile />)} />
        </Routes>
      </main>
    </div>
  );
}