
# AgriFlow

🚀 **Live Demo:** [https://agri-flow-ten.vercel.app/](https://agri-flow-ten.vercel.app/)

AgriFlow is a full-stack web application designed to connect farmers, sellers, and buyers in a digital marketplace for agricultural products. The platform also features an emergency request system for urgent needs and a map-based interface for listing and discovering products.

## Features

### Client (Frontend)

- Built with React and Vite
- Modern UI with Tailwind CSS
- Authentication (login, signup, protected routes)
- Product marketplace with detailed listings
- Emergency request board for urgent needs
- Interactive map for product locations
- User profile and seller dashboard
- Theming (light/dark mode)
- Responsive design

### Server (Backend)

- Node.js with Express
- MongoDB for data storage
- RESTful API endpoints for products, users, notifications, and emergency requests
- JWT-based authentication
- File uploads (Cloudinary integration)
- Error handling and middleware

## Folder Structure

```
client/           # Frontend React app
  src/
    app/          # Routing and route guards
    components/   # UI components
    context/      # React context providers
    data/         # Static data
    lib/          # Utility libraries
    pages/        # Page components
    assets/       # Images and static assets
  public/         # Static files
  ...             # Config and build files

server/           # Backend Node.js app
  src/
    config/       # Database configuration
    controllers/  # Route controllers
    middleware/   # Express middleware
    models/       # Mongoose models
    routes/       # API routes
    utils/        # Utility functions
  uploads/        # Uploaded files
  ...             # Config and build files
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)

### Setup

1. **Clone the repository:**

   ```sh
   git clone <repo-url>
   cd AgriFlow
   ```

2. **Install dependencies:**

   ```sh
   cd client && pnpm install
   cd ../server && pnpm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in both `client` and `server` folders (if provided), and fill in the required values (API URLs, database URIs, Cloudinary keys, etc).

4. **Run the development servers:**
   - **Client:**
     ```sh
     pnpm run dev
     ```
   - **Server:**
     ```sh
     pnpm run dev
     ```

5. **Access the app:**
   - Frontend: [http://localhost:5173](http://localhost:5173) (default Vite port)
   - Backend: [http://localhost:5000](http://localhost:5000) (default Express port)

## Scripts

### Client

- `pnpm run dev` — Start Vite dev server
- `pnpm run build` — Build for production
- `pnpm run preview` — Preview production build

### Server

- `pnpm run dev` — Start server with nodemon
- `pnpm start` — Start server

## Environment Variables

### Server

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT authentication
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
- ...other variables as needed

### Client

- `VITE_API_BASE_URL` — Base URL for backend API
- ...other variables as needed

## License

This project is licensed under the MIT License.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Acknowledgements

- React, Vite, Tailwind CSS
- Node.js, Express, MongoDB, Mongoose
- Cloudinary
- Open Source Community
