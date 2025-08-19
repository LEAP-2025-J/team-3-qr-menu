# Haku Restaurant QR Menu System

A modern, full-stack QR menu system for Japanese restaurants with real-time order management.

## 🏗️ Project Structure

\`\`\`
├── backend/ # Express.js API server
│ ├── models/ # MongoDB schemas
│ ├── routes/ # API endpoints
│ ├── scripts/ # Database utilities
│ └── server.js # Main server file
├── frontend/ # Next.js React application
│ ├── app/ # Next.js app directory
│ ├── components/ # React components
│ ├── lib/ # Utilities and API client
│ └── public/ # Static assets
└── README.md
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Update `.env` with your MongoDB URI and other settings

5. Seed the database:
   \`\`\`bash
   npm run seed
   \`\`\`

6. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create environment file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

Frontend will run on http://localhost:3000

## 📱 Features

### Customer Features

- 📱 Mobile-optimized QR menu
- 🍜 Browse menu by categories
- 🛒 Place orders directly from table
- ⏰ View operating hours
- 📅 Make table reservations
- 🌐 Multi-language support (English/Mongolian/Japanese)

### Admin Features

- 📊 Real-time dashboard
- 📋 Order management system
- 🪑 Table status tracking
- 📅 Reservation management
- 🍽️ Menu item management
- 📈 Sales analytics
- ⚙️ Restaurant settings

## 🛠️ Technology Stack

### Backend

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Express Validator** - Input validation
- **Helmet** - Security middleware

### Frontend

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Axios** - HTTP client
- **React Hook Form** - Form handling

## 📡 API Endpoints

### Menu

- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order status

### Tables

- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table

### Reservations

- `GET /api/reservations` - Get reservations
- `POST /api/reservations` - Create reservation

## 🔧 Development

### Running Tests

\`\`\`bash

# Backend tests

cd backend && npm test

# Frontend tests

cd frontend && npm test
\`\`\`

### Building for Production

\`\`\`bash

# Backend

cd backend && npm start

# Frontend

cd frontend && npm run build && npm start
\`\`\`

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support, email support@haku-restaurant.com or create an issue on GitHub.
