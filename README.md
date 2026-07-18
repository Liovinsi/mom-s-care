# PG Booking Platform

Production-ready MERN stack scaffold for a paying guest booking platform with separate frontend and backend apps.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Socket.IO client
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO
- Architecture: MVC backend with controllers, models, routes, middleware, services and validators

## Roles

- `SUPER_ADMIN`: email/password login, full platform management, manual booking approval
- `WARDEN`: email/password login, branch-scoped residents, payments and occupancy
- `GUEST`: Google/Facebook social login endpoints, booking and payment flow

## Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

Default Super Admin values are configured in `backend/.env.example` and can be changed before seeding.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## API Overview

- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/facebook`
- `GET /api/branches`
- `GET /api/rooms?branch=:branchId`
- `GET /api/beds?room=:roomId`
- `POST /api/bookings`
- `PATCH /api/bookings/:id/approve`
- `PATCH /api/bookings/:id/reject`
- `GET /api/payments`
- `PATCH /api/payments/:id/paid`
- `GET /api/dashboard`
- `GET /api/reports/occupancy`
- `GET /api/reports/bookings`
- `GET /api/reports/payments`

## Real-Time Availability

The backend emits `bed:updated` events through Socket.IO. The frontend joins `room:{roomId}` while a guest is selecting beds and updates the bed grid live.

## Booking Flow

1. Guest logs in through Google or Facebook social endpoint.
2. Guest selects a branch, room and exact bed.
3. Backend holds the selected bed for 15 minutes.
4. Guest pays token amount.
5. Booking moves to `PENDING_APPROVAL`.
6. Super Admin approves or rejects.
7. Approval converts the booking into an active resident and marks the bed booked.

## Notes

- Social login endpoints accept normalized provider profile payloads. In production, validate Google/Facebook provider tokens on the server before creating the guest user.
- Payment integration is represented by a trackable `Payment` model and mock mark-paid endpoint. Replace this with your gateway webhook in production.
- Warden-facing APIs are branch-scoped when the warden has a branch assigned.
