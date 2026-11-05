import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ResearchDetails from './pages/ResearchDetails.jsx';
import FacultyDashboard from './pages/FacultyDashboard.jsx';
import AddResearch from './pages/AddResearch.jsx';
import EditResearch from './pages/EditResearch.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/research/:id" element={<ResearchDetails />} />

          <Route element={<ProtectedRoute roles={['faculty', 'admin']} />}>
            <Route path="/dashboard" element={<FacultyDashboard />} />
            <Route path="/research/new" element={<AddResearch />} />
            <Route path="/research/:id/edit" element={<EditResearch />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
