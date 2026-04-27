import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Header from './components/Header';
import Footer from './components/Footer';

import Home            from './pages/Home';
import Services        from './pages/Services';
import AboutUs         from './pages/AboutUs';
import Contact         from './pages/Contact';
import Login           from './pages/Login';
import Register        from './pages/Register';

import AdminDashboard    from './pages/AdminDashboard';
import StaffDashboard    from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

const BARE_PREFIXES = ['/admin', '/staff', '/customer'];

function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/customer" replace />;
  }
  return children;
}

function Layout() {
  const { pathname } = useLocation();
  const isBare = BARE_PREFIXES.some((r) => pathname.startsWith(r));

  if (isBare) {
    return (
      <Routes>
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/*" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/customer/*" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-[1280px] mx-auto w-full px-5 sm:px-8 lg:px-10">
        <Header />
      </div>
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-5 sm:px-8 lg:px-10 pt-8 pb-16 page-enter">
        <Routes>
          <Route path="/"         element={<Home />}     />
          <Route path="/services" element={<Services />} />
          <Route path="/about"    element={<AboutUs />}  />
          <Route path="/contact"  element={<Contact />}  />
          <Route path="/login"    element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
          <Route path="/register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
