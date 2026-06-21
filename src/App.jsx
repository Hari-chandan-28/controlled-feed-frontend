import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import F1Dashboard from './pages/F1Dashboard';
import Cricket from './pages/Cricket';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import F1Live from './pages/F1Live';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
};

// AppLayout sits INSIDE BrowserRouter so useLocation works correctly
const AppLayout = () => {
  const location = useLocation();
  const hideNavbar = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/f1" element={<ProtectedRoute><F1Dashboard /></ProtectedRoute>} />
        <Route path="/cricket" element={<ProtectedRoute><Cricket /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/live" element={<ProtectedRoute><F1Live /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}