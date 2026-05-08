import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export const RevenueChart = ({ summary }) => {
  return (
    <div className="text-center p-5 bg-light rounded">
      <h4>B2C Revenue: ₹{summary.bookings.b2c * 100}</h4>
      <h4>B2B Revenue: ₹{summary.bookings.b2b * 500}</h4>
      <p className="text-muted mt-3">Chart rendering temporarily disabled for compatibility.</p>
    </div>
  );
};

export const FleetHealthChart = ({ summary }) => {
  return (
    <div className="text-center p-5 bg-light rounded">
      <h4>Available Vehicles: {summary.vehicles.available}</h4>
      <h4>In Maintenance: {summary.vehicles.maintenance}</h4>
      <p className="text-muted mt-3">Chart rendering temporarily disabled for compatibility.</p>
    </div>
  );
};