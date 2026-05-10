import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import MeasureLand from './pages/MeasureLand';
import LandDetails from './pages/LandDetails';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';



const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const hideFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="/dashboard" element={

            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/measure" element={
            <PrivateRoute>
              <MeasureLand />
            </PrivateRoute>
          } />

          <Route path="/land/:id" element={
            <PrivateRoute>
              <LandDetails />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};


function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
          <Toaster position="top-right" reverseOrder={false} />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}


export default App;

