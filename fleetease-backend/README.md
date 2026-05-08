Fleetease Backend - Final Package

Features:
- B2C & B2B bookings (approval workflow) with invoices
- JWT authentication and protected admin routes
- Demo data seeding (users, vehicles, routes)
- Payments & payment history, loyalty points
- GPS with real-time tracking (Socket.IO)
- Fleet health: maintenance + telemetry
- Smart rule-based chatbot with B2B/B2C context
- Admin dashboard endpoints (summary)
- Dockerfile + docker-compose for quick local deployment

Quick start:
1. Copy .env.example to .env and fill values.
2. Create database: createdb fleetease
3. npm install
4. npm run setup-db     //node setup_db.js
5. npm start
