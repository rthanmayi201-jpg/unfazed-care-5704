import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Sidebar from '../components/common/Sidebar.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';

// Pages
import Landing from '../pages/public/Landing.jsx';
import PublicProfile from '../pages/public/PublicProfile.jsx';
import NotFound from '../pages/public/NotFound.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

import Dashboard from '../pages/therapist/Dashboard.jsx';
import Clients from '../pages/therapist/Clients.jsx';
import ClientDetail from '../pages/therapist/ClientDetail.jsx';
import Schedule from '../pages/therapist/Schedule.jsx';
import Notes from '../pages/therapist/Notes.jsx';
import Analytics from '../pages/therapist/Analytics.jsx';
import Packages from '../pages/therapist/Packages.jsx';
import Settings from '../pages/therapist/Settings.jsx';
import Billing from '../pages/therapist/Billing.jsx';
import Plans from '../pages/therapist/Plans.jsx';
import Messages from '../pages/therapist/Messages.jsx';
import Notifications from '../pages/therapist/Notifications.jsx';

import BookingPage from '../pages/client/BookingPage.jsx';
import ClientPortal from '../pages/client/ClientPortal.jsx';
import Payment from '../pages/client/Payment.jsx';
import Intake from '../pages/client/Intake.jsx';

import AdminBookingsDashboard from '../pages/admin/AdminBookingsDashboard.jsx';


// Therapist Layout with Workspace Sidebar
function TherapistLayout() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar isTherapistWorkspace={true} />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Client Portal Layout
function ClientLayout() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar isTherapistWorkspace={false} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

// Public Layout
function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar isTherapistWorkspace={false} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Static Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<NotFound />} />
      </Route>

      {/* 2. Client Portal Routes (role=client) */}
      <Route
        element={
          <ProtectedRoute allowedRole="client">
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/portal/chat" element={<ClientPortal />} />
        <Route path="/portal/payments" element={<ClientPortal />} />
      </Route>

      {/* 3. Therapist Workspace Routes (role=therapist, sidebar layout) */}
      <Route
        element={
          <ProtectedRoute allowedRole="therapist">
            <TherapistLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminBookingsDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookingsDashboard />} />
      </Route>

      {/* 3b. Direct Admin Panel Access */}
      <Route element={<TherapistLayout />}>
        <Route path="/admin" element={<AdminBookingsDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookingsDashboard />} />
      </Route>


      {/* 4. Branded Public Therapist Link Sub-routes */}
      <Route element={<PublicLayout />}>
        <Route path="/:slug/book" element={<BookingPage />} />
        <Route path="/:slug/intake" element={<Intake />} />
        <Route path="/:slug/pay/:sessionId" element={<Payment />} />
        
        {/* The /:slug route is placed LAST dynamically to avoid matching dashboard/login/etc */}
        <Route path="/:slug" element={<PublicProfile />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
