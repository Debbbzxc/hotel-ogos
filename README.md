<div align="center">
  <img src="frontend/public/logo.png" width="160" alt="Hotel Ogos Logo" style="border-radius: 50%; border: 4px solid #FFD700; background-color: #FFFFFF; box-shadow: 0 4px 12px rgba(153, 0, 0, 0.2);" />

  # HOTEL OGOS
  ### "So Cozy... So Comfy!"
  A premium hotel reservation system inspired by Japanese hospitality aesthetics, combining modern room booking services with analytical management dashboards.

  ---

  <p align="center">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Material--UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="MUI" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  </p>
</div>

---

## Overview

Hotel Ogos is a full-stack reservation platform that provides guests with a seamless way to check room availability, select standard durations (12-hour or 24-hour configurations), book stays, and generate transaction invoices. The application is styled according to the Hotel Ogos brand guidelines, using a custom red, white, and gold visual identity to create a warm, premium experience.

It contains:
- **A Frontend Web Application** built with React, Vite, and Material UI, featuring a dual customer/admin workspace, responsive layout architectures, and dynamically compiled PDF invoice generation.
- **A Backend API Service** powered by Node.js, Express, and MongoDB (via Mongoose), handling session authentication, booking validations, role authorizations, and analytical computations.
- **An External API Integration Layer** allowing secure third-party connections to sync reservations, settle balances, and fetch system performance summaries.

---

## Core Features

### Guest & Customer Experience
- **Authentication**: Registration and login with password validation.
- **Dynamic Bookings**: Selection of room types with real-time price calculations based on duration (12 hours vs. 24 hours).
- **Checkout & Payment**: Interactive payment forms validating credit details and providing receipt downloads.
- **Invoice Generation**: Automated generation of PDF receipts using jsPDF, detailing guest, stay duration, check-in time, and base fees.

### Administration & Analytics Dashboard
- **Key Metrics Tracking**: Real-time display of total system revenue, aggregate guest profiles, active occupancy percentages, and booking distributions.
- **Analytics Visualizations**: Custom graphical breakdown of top-performing room types and occupancy trends.
- **Room Management**: Access to add, update, or remove room configurations, amenities, descriptions, and baseline fees.
- **Reservation & User Controls**: Interfaces to view transaction logs, update payment states (paid, pending, cancelled), adjust user permissions, or delete profiles.

### Integration Layer (External API)
- **Protected Integrations**: Separate endpoints isolated by API key security.
- **Sync Endpoints**: Methods to query reservation listings, record external bookings, cancel holds, and check analytical status.

---

## Repository Structure

```text
├── backend/
│   ├── config/             # Database connection setups
│   ├── controllers/        # Express handlers (auth, room, reservation, external)
│   ├── middleware/         # Authentication and API key validations
│   ├── models/             # Mongoose Schemas (User, Room, Reservation)
│   ├── routes/             # Express routing mapping
│   ├── scripts/            # Database initialization and seeding scripts
│   ├── utils/              # Helper utilities
│   ├── .env.example        # Reference environment variables
│   ├── package.json        # Backend configurations & dependencies
│   └── server.js           # API bootstrap and error middleware
│
├── frontend/
│   ├── public/             # Static public assets (Favicon, Logo)
│   ├── src/
│   │   ├── assets/         # UI images (Room assets, brand badges)
│   │   ├── components/     # Reusable React components (Logo, etc.)
│   │   ├── pages/          # Full-page components (Login, Register, Dashboards)
│   │   ├── App.jsx         # App router and session check wrapper
│   │   ├── config.js       # Global configurations (API endpoint targets)
│   │   └── main.jsx        # React entrypoint
│   ├── package.json        # Frontend configuration & dependencies
│   └── vite.config.js      # Vite build properties
│
└── style_guide.md          # Official Brand UI/UX Style Guidelines
```

---

## Technical Specifications

### Frontend
- **Framework**: React 19 (JavaScript modules)
- **Build Tool**: Vite
- **UI Engine**: Material UI (MUI) for styled grid frameworks, inputs, icons, and analytics panels
- **Document Rendering**: jsPDF & jsPDF AutoTable

### Backend
- **Platform**: Node.js & Express
- **Database**: MongoDB (managed via Mongoose ODM)
- **Security & Session**: JWT (jsonwebtoken) & bcryptjs for encrypted password structures
- **Middlewares**: CORS headers and Express JSON parser limits

---

## Local Setup and Installation

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- MongoDB Database (local instance or MongoDB Atlas cluster connection)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd hotel-ogos
```

### Step 2: Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Update the variables in `.env` to match your local/production settings:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hotel_ogos
   JWT_SECRET=your_jwt_signing_key_here
   INTERNAL_API_KEY=your_secure_api_key_here
   ADMIN_URL=http://localhost:5173
   ```
5. Seed the database with initial rooms and default users:
   ```bash
   npm run seed
   ```
   *Note: This script will clean the database and create default rooms (Premium, Deluxe, Regency, Regency II, Mega Suite) and default test user credentials:*
   - **Admin User**: Username `admin` | Password `password123`
   - **Guest User**: Username `guest` | Password `guestpassword123`

6. Start the backend development server:
   ```bash
   npm run dev
   ```

### Step 3: Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. If connecting to a remote backend server, create a `.env` file in the frontend root and specify:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## Database Schemas

### User Schema (`User.js`)
Handles credential storage, validation, and role authorizations.
```javascript
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'admin'], default: 'guest' },
  createdAt: { type: Date, default: Date.now }
}
```

### Room Schema (`Room.js`)
Configures room metadata, pricing rates, and spatial capacity.
```javascript
{
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  baseRate12: { type: Number, required: true },
  baseRate24: { type: Number, required: true },
  totalRooms: { type: Number, required: true, default: 1 },
  roomNumbers: { type: [String], default: [] },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
}
```

### Reservation Schema (`Reservation.js`)
Documents checkout details, durations, payment logs, and check-in constraints.
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomType: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  hours: { type: Number, required: true },
  notes: { type: String, default: '', maxLength: 500 },
  totalAmount: { type: Number, required: true },
  roomNumber: { type: String },
  paymentDetails: {
    status: { type: String, enum: ['paid', 'pending', 'cancelled'], default: 'paid' },
    paidAt: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now }
}
```

---

## Integration API Documentation

All integration endpoints are accessed via the prefix `/api/external` and require an API key passed in the request header.

### Authentication
Include the following header with your requests:
```http
x-api-key: <your_configured_internal_api_key>
```

### Endpoints

#### 1. Fetch Reservation Summary
Retrieves dashboard-level system metrics including total revenue, total booking counts, and guest numbers.
- **URL**: `/api/external/summary`
- **Method**: `GET`
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "totalReservations": 12,
      "totalRooms": 15,
      "totalGuests": 5,
      "totalRevenue": 14200,
      "reservationsByStatus": {
        "paid": 10,
        "pending": 1,
        "cancelled": 1
      },
      "topRoomTypes": [
        { "name": "premium", "totalReservations": 6 }
      ]
    }
  }
  ```

#### 2. Fetch Recent Transactions
Lists recent transactions sorted chronologically by creation timestamp.
- **URL**: `/api/external/transactions`
- **Method**: `GET`
- **Response Format**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "60d0fe4f53112b2e88a002bc",
        "status": "paid",
        "timestamp": "2026-07-12T17:28:36Z",
        "createdAt": "2026-07-12T17:28:36Z",
        "type": "reservation",
        "amount": 1365,
        "guestName": "John Doe",
        "guestEmail": "guest@hotelogos.com",
        "roomType": "premium",
        "checkInDate": "2026-07-13T00:00:00.000Z",
        "checkOutDate": "2026-07-14T00:00:00.000Z",
        "hours": 24
      }
    ]
  }
  ```

#### 3. Create External Booking
Forces an external booking directly onto the system with custom validations for room availability and date conflicts.
- **URL**: `/api/external/reservations`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "userId": "60d0fe4f53112b2e88a002bb",
    "checkInDate": "2026-07-15",
    "checkOutDate": "2026-07-16",
    "checkInTime": "14:00",
    "selectedRoom": "deluxe",
    "hours": 24,
    "totalAmount": 1405,
    "notes": "External booking integration",
    "paymentDetails": {
      "status": "paid"
    }
  }
  ```

#### 4. Settle Transaction
Updates payment status of an existing booking.
- **URL**: `/api/external/transactions/:reservationId`
- **Method**: `PUT`
- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Payment updated successfully"
  }
  ```

#### 5. Cancel Booking
Cancels a reservation and frees up the occupied room numbers.
- **URL**: `/api/external/reservations/:reservationId/cancel`
- **Method**: `PUT`
- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Reservation cancelled successfully"
  }
  ```

---

## Brand Design Tokens

To ensure consistency in user interface extensions, always align elements with the specifications defined in [style_guide.md](file:///c:/Users/Deb/Desktop/PROJECTS/Hotel%20Ogos/style_guide.md):

- **Typography**: Poppins from Google Fonts (`'Poppins', sans-serif`).
- **Brand Colors**:
  - **Brand Red**: `#D31027` (Highlights & hovers)
  - **Dark Red**: `#990000` (Buttons & static borders)
  - **Brand Gold**: `#FFD700` (Logo frame borders & headings)
  - **Charcoal Black**: `#1A1A1A` (Default dark panels & text)
- **Component Rules**:
  - Inputs must feature square icon prefixes back-colored in `#990000`.
  - Buttons must implement transform micro-animations on hover (`translateY(-1px)`) and active presses (`translateY(1px)`).
