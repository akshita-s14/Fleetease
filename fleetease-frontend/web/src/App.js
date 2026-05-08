// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "../../src/Home";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import BookingCreate from "./pages/BookingCreate";
// import BookingDetails from "./pages/BookingDetails";

// function App() {
//   return (
//     <BrowserRouter>
//       <div>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/create-booking" element={<BookingCreate />} />
//           <Route path="/booking/:id" element={<BookingDetails />} />
//         </Routes>
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookingCreate from "./pages/BookingCreate";
import BookingDetails from "./pages/BookingDetails";
import BookingsList from "./pages/BookingsList";
import AdminSummary from "./pages/AdminSummary";
import VehiclesList from "./pages/VehiclesList";
import DriversList from "./pages/DriversList";
import LiveMap from "./pages/LiveMap";
import DriverDashboard from "./pages/DriverDashboard";
import InvoicesList from "./pages/InvoicesList";
import Profile from "./pages/Profile";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Chatbot />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/create"
          element={
            <ProtectedRoute>
              <BookingCreate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin', 'company_admin']}>
              <AdminSummary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute roles={['admin', 'company_admin']}>
              <VehiclesList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/drivers"
          element={
            <ProtectedRoute roles={['admin']}>
              <DriversList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute roles={['admin', 'company_admin']}>
              <LiveMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute roles={['admin', 'company_admin']}>
              <InvoicesList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;