import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';

import Header from './components/Header';
import Footer from './components/Footer';

import Home            from './pages/Home';
import Services        from './pages/Services';
import AboutUs         from './pages/AboutUs';
import Contact         from './pages/Contact';
import Login           from './pages/Login';
import Register        from './pages/Register';

// Role-based dashboards
import AdminDashboard    from './pages/AdminDashboard';
import StaffDashboard    from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// Routes that bypass the public Header/Footer chrome
const BARE_PREFIXES = ['/admin', '/staff', '/customer'];

function Layout() {
  const { pathname } = useLocation();
  const isBare = BARE_PREFIXES.some((r) => pathname.startsWith(r));

  if (isBare) {
    return (
      <Routes>
        <Route path="/admin/*"    element={<AdminDashboard />}    />
        <Route path="/staff/*"    element={<StaffDashboard />}    />
        <Route path="/customer/*" element={<CustomerDashboard />} />
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
          <Route path="/"          element={<Home />}     />
          <Route path="/services"  element={<Services />} />
          <Route path="/about"     element={<AboutUs />}  />
          <Route path="/contact"   element={<Contact />}  />
          <Route path="/login"     element={<Login />}    />
          <Route path="/register"  element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
