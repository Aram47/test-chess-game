# Chess Education Platform

A comprehensive chess education platform that combines problem-solving, online gameplay, interactive learning, and teacher-student collaboration features.

## Overview

This platform is designed to provide a complete chess learning experience for students of all levels, from beginners to advanced players. It offers structured problem-solving exercises, real-time online gameplay, daily challenges, interactive lessons, and premium features powered by AI.

## Features

### 1. Chess Problem Solving with Progress Tracking

- **Category-Based Problems**: Problems organized by skill levels (first grade, second grade, third grade, fourth grade, master, national master, etc.)
- **Theme-Based Problems**: Problems categorized by chess concepts:
  - Endgame with rooks
  - Mate in 2, Mate in 3
  - Mate with knight
  - And many more themes
- **Progress Saving**: Track your progress on each problem with detailed state management
- **Problem Status Tracking**: Monitor problems as `not_started`, `in_progress`, or `finished`
- **Move History**: Save and review moves made during problem-solving sessions

### 2. Online Chess Gameplay

Play chess against other players or AI bots with various game modes:

- **Game Formats**:
  - Standard Chess
  - Chess 960 (Fischer Random)
  - Atomic Chess
  - And more variants
- **Time Controls**:
  - Blitz games
  - Timed games with customizable limits
  - Untimed games
- **Matchmaking**: Find opponents of similar skill levels
- **Real-time Gameplay**: Powered by WebSocket for seamless online play

### 3. Daily Problems & Statistics

- **Daily Challenges**: New problems every day to keep you engaged
- **Progress Statistics**: 
  - Track your solving streak
  - View completion rates
  - Monitor improvement over time
  - Category and theme performance analytics

### 4. Teacher-Student Online Meetings

A comprehensive learning management system for chess education:

- **Teacher Features**:
  - Create and manage student groups
  - Schedule online lessons
  - Track student progress
  - Earn money by teaching students
- **Student Features**:
  - Sign up for lessons with certified teachers
  - Attend live online sessions
  - Access lesson recordings
  - Pay for premium instruction
- **Payment Integration**: Secure payment system for lesson transactions
- **Video Conferencing**: Integrated online meeting support for interactive lessons

### 5. Premium Features

Extended functionality available through premium subscription:

- **Extended Problem Library**: Access to more and harder problems
- **AI Bot Analyzer**: 
  - Analyze your games with advanced AI
  - Get personalized improvement suggestions
  - Review position evaluations
- **AI Teacher Mode**: Learn from AI-powered chess instruction
- **Advanced Statistics**: Detailed analytics and insights
- **Priority Support**: Enhanced customer support

### 6. Language Translation for Online Lessons

- **Krisp Integration**: Real-time speech translation during online lessons
- **Multi-language Support**: Switch between languages seamlessly
- **Accessibility**: Make chess education accessible to international students and teachers

### 7. Interactive Quizzes

Engaging quiz system to keep users active and learning:

- **Various Quiz Types**: 
  - Position recognition
  - Tactical puzzles
  - Opening theory
  - Endgame knowledge
- **Gamification**: Points, badges, and leaderboards
- **Adaptive Learning**: Quizzes adapt to your skill level
- **Regular Updates**: New quizzes added frequently

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data persistence
- **Redis** for caching and session management
- **Socket.io** for real-time communication
- **JWT** for authentication

### Key Libraries
- `chess.js` - Chess game logic and move validation
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - Authentication tokens

## Project Structure

```
test-chess-game/
├── api/
│   ├── http/
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/      # Authentication & validation
│   │   ├── routes/           # API route definitions
│   │   └── services/         # Business logic
│   └── socket/               # WebSocket handlers
├── config/                   # Configuration files
├── models/                   # Database models
│   ├── user.js
│   ├── chessProblems.js
│   ├── inProgressProblems.js
│   └── chessSolvedProblemsSnapshot.js
├── redis/                    # Redis client setup
├── utility/                  # Helper functions
├── docs/                     # Documentation
│   └── db/                   # Database ERD diagrams
├── docker-compose.yml        # Docker orchestration
├── Dockerfile               # Container configuration
└── main.js                  # Application entry point
```

## Database Architecture

The platform uses a well-structured, extendable database design:

- **Users**: User accounts and authentication
- **ChessProblems**: Problem library with categories and themes
- **Categories**: Problem difficulty levels (extendable)
- **Themes**: Problem types and concepts (extendable)
- **UserChessProblemsState**: User progress tracking
- **ProblemThemes**: Many-to-many relationship between problems and themes

For detailed database schema, see [Database ERD Documentation](docs/db/chess-erd.md).

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Redis
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd test-chess-game
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```
MONGO_URI=your_mongodb_connection_string
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=3000
```

4. Start the development server:
```bash
npm run start:dev
```

### Docker Deployment

```bash
docker-compose up -d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Game Management
- `POST /api/game/create` - Create a new game session
- `POST /api/game/move` - Make a chess move
- `POST /api/game/end` - End a game session
- `GET /api/game/state` - Get current game state

## Development

### Running in Development Mode

```bash
npm run start:dev
```

The server will start with nodemon for automatic reloading on file changes.

### Production Build

```bash
npm start
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Upcoming Features
- [ ] Enhanced AI analysis engine
- [ ] Mobile application
- [ ] Tournament system
- [ ] Social features and friend system
- [ ] Advanced analytics dashboard
- [ ] Video lesson recording and playback
- [ ] Integration with chess engines (Stockfish, Leela Chess Zero)

## License

ISC

## Contact

For questions, support, or feature requests, please open an issue in the repository.

---

**Note**: This platform is under active development. Some features may be in beta or planned for future releases.
