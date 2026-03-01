# Anime App - Backend API

RESTful API backend for the Anime App, built with Node.js, Express, and MongoDB.

## 🚀 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs for password hashing
- **CORS:** Enabled for frontend integration

## 📋 Features

- ✅ User authentication (register, login, JWT-based sessions)
- ✅ Favorites management (add, remove, check favorite status)
- ✅ Comments system with CRUD operations
- ✅ Like/unlike functionality for comments
- ✅ Protected routes with authorization middleware
- ✅ Input validation and error handling
- ✅ MongoDB indexes for optimized queries

## 🏗️ Project Structure
```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── favoriteController.js
│   │   └── commentController.js
│   ├── models/             # MongoDB schemas
│   │   ├── User.js
│   │   ├── Favorite.js
│   │   └── Comment.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── favorites.js
│   │   └── comments.js
│   ├── middleware/         # Custom middleware
│   │   └── authMiddleware.js
│   ├── config/            # Configuration
│   │   └── database.js
│   └── server.js          # Entry point
├── .env                   # Environment variables (local)
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or MongoDB Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd anime-app-fullstack/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/anime-app
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
NODE_ENV=development
```

4. **Start the server**
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Favorites

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/favorites` | Get user's favorites | Yes |
| POST | `/api/favorites` | Add to favorites | Yes |
| DELETE | `/api/favorites/:id` | Remove favorite by ID | Yes |
| DELETE | `/api/favorites/anime/:animeId` | Remove by anime ID | Yes |
| GET | `/api/favorites/check/:animeId` | Check if favorited | Yes |

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/comments/anime/:animeId` | Get anime comments | No |
| GET | `/api/comments/user/:userId` | Get user comments | No |
| GET | `/api/comments/stats/:animeId` | Get comment stats | No |
| POST | `/api/comments` | Create comment | Yes |
| PUT | `/api/comments/:id` | Update comment | Yes |
| DELETE | `/api/comments/:id` | Delete comment | Yes |
| POST | `/api/comments/:id/like` | Toggle like | Yes |

## 📝 API Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Add Favorite
```bash
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "animeId": 16498,
  "title": "Attack on Titan",
  "coverImage": "https://...",
  "averageScore": 84,
  "genres": ["Action", "Drama"],
  "episodes": 25,
  "status": "FINISHED"
}
```

### Create Comment
```bash
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "animeId": 16498,
  "animeTitle": "Attack on Titan",
  "text": "Amazing anime! Highly recommend."
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How it works:

1. User registers or logs in → receives JWT token
2. Client stores token (localStorage/sessionStorage)
3. Client sends token in Authorization header for protected routes
4. Server verifies token and grants access

### Protected Routes Format:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  bio: String,
  favorites: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Favorite
```javascript
{
  user: ObjectId (ref: User),
  animeId: Number,
  title: String,
  coverImage: String,
  averageScore: Number,
  genres: [String],
  episodes: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment
```javascript
{
  user: ObjectId (ref: User),
  animeId: Number,
  animeTitle: String,
  text: String (max 500 chars),
  likes: [ObjectId] (refs: User),
  likesCount: Number,
  isEdited: Boolean,
  editedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Railway Deployment

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect Railway to GitHub repo**

- Go to [Railway](https://railway.app)
- New Project → Deploy from GitHub
- Select repository

3. **Configure settings**
```
Root Directory: /backend
```

4. **Add environment variables**
```
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
MONGODB_URI=${{MongoDB.MONGO_URL}}/anime-app
```

5. **Deploy**

Railway auto-deploys on every push to main branch.

### Production URL
```
https://your-backend.up.railway.app
```

## 🧪 Testing

### Manual Testing with Postman

1. Import the API collection (if available)
2. Set environment variable: `BASE_URL = http://localhost:5000/api`
3. Test each endpoint

### Health Check
```bash
GET /api/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-02-27T..."
}
```

## 🔧 Development

### Available Scripts
```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

### Code Style

- Use ES6+ features
- Async/await for asynchronous operations
- Try-catch for error handling
- Meaningful variable/function names
- Comments for complex logic

## 🐛 Common Issues

### MongoDB Connection Failed

**Problem:** `MongoDB connection error`

**Solution:** 
- Check `MONGODB_URI` in `.env`
- Verify MongoDB service is running
- Check network access (IP whitelist for MongoDB Atlas)

### JWT Token Invalid

**Problem:** `Not authorized, token failed`

**Solution:**
- Verify `JWT_SECRET` matches between registration and login
- Check token format: `Bearer <token>`
- Ensure token hasn't expired (30 days default)

### CORS Errors

**Problem:** `Access blocked by CORS policy`

**Solution:**
Update `server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.vercel.app'],
  credentials: true
}));
```

## 📦 Dependencies

### Production

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT generation/verification
- `dotenv` - Environment variables
- `cors` - Cross-Origin Resource Sharing

### Development

- `nodemon` - Auto-reload during development

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Commit Convention
```
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Adding tests
chore: Maintenance tasks
```

## 📄 License

This project is private and not licensed for public use.

## 👤 Author

Your Name

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Last Updated:** February 2025

**API Version:** 1.0.0