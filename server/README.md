# Meducate Backend API

This is the backend server for the Meducate 3D medical simulation platform. It handles all the core functionality including patient simulations, AI responses, scoring, multiplayer, and admin functions.

## Features Implemented

### 1. Core Session Management
- Start new simulation sessions
- Handle patient interactions via AI
- Track vital signs and patient state
- Process MCQ answers and update patient condition

### 2. AI Patient Engine (Day 3)
- Dynamic responses using OpenAI GPT-3.5-turbo
- Context-aware patient simulation
- Safety guardrails to prevent hallucinations
- Fallback responses when API is unavailable
- Conversation trigger system for predefined responses

### 3. Scoring & Reports (Day 4)
- Comprehensive scoring algorithm
- Time-based bonuses
- Outcome-based bonuses
- Detailed session reports
- Performance feedback

### 4. Admin Panel & Case Management (Day 5)
- Session review and filtering
- Case creation and editing
- Session flagging for review
- Case validation system

### 5. Multiplayer Functionality (Day 6)
- Room creation and management
- Real-time collaboration
- Shared patient state
- Player roles and permissions
- Socket.io integration for live updates

### 6. Contest Mode & Leaderboards (Day 4, 6)
- Fixed seed for consistent contest experiences
- Performance leaderboards
- Time-based comparisons
- Difficulty-specific rankings

## API Endpoints

### Session Management
- `POST /api/session/start` - Start a new simulation session
- `POST /api/session/:id/action` - Ask the patient a question
- `POST /api/session/:id/answer` - Answer an MCQ
- `GET /api/session/:id` - Get current session state
- `POST /api/session/:id/end` - End session and get report

### Contest Mode
- `POST /api/contest/start` - Start a contest mode session

### Multiplayer
- `POST /api/multiplayer/create` - Create a multiplayer room
- `POST /api/multiplayer/join/:roomId` - Join a multiplayer room
- `POST /api/multiplayer/:roomId/action` - Multiplayer patient interaction
- `POST /api/multiplayer/:roomId/answer` - Multiplayer MCQ answer
- `GET /api/multiplayer/:roomId/state` - Get multiplayer room state

### Leaderboards
- `GET /api/leaderboard` - Get leaderboard with filters
- `GET /api/leaderboard/personal/:playerId` - Get player's history
- `GET /api/leaderboard/case/:caseId` - Get case-specific leaderboard

### Admin Panel
- `GET /api/admin/sessions` - Get all sessions with filters
- `GET /api/admin/session/:id` - Get detailed session info
- `POST /api/admin/session/:id/flag` - Flag session for review
- `GET /api/admin/cases` - Get all cases
- `POST /api/admin/case` - Create new case
- `PUT /api/admin/case/:caseId` - Update existing case
- `DELETE /api/admin/case/:caseId` - Delete case
- `GET /api/admin/flagged-sessions` - Get flagged sessions

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# OpenAI API (for AI patient responses)
OPENAI_API_KEY=your_openai_api_key_here

# Database (optional - using in-memory for demo)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meducate_db
DB_USER=meducate_user
DB_PASS=meducate_password

# Redis (for multiplayer sessions)
REDIS_URL=redis://localhost:6379

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

## Data Structure

### Case Schema
Each medical case follows this structure:
```json
{
  "case_id": "unique_identifier",
  "difficulty": "critical|severe|easy",
  "patient": {
    "name": "Patient Name",
    "age": 58,
    "gender": "Male|Female"
  },
  "chief_complaint": "Primary symptom",
  "vitals": {
    "hr": 102,
    "sbp": 145,
    "dbp": 95,
    "spo2": 94,
    "temp_c": 37.2,
    "rr": 22
  },
  "medical_history": ["conditions"],
  "allergies": ["allergies"],
  "medications": ["medications"],
  "conversation_triggers": {
    "specific question": "expected response"
  },
  "correct_diagnosis": "Correct diagnosis",
  "mcq_options": [
    {
      "id": 1,
      "question": "MCQ question",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "Explanation of answer"
    }
  ],
  "progression": {
    "max_consecutive_wrong": 3,
    "on_wrong_mcq": { "hr": "+8", "spo2": "-2" },
    "on_correct_diagnosis": { "hr": "-10", "spo2": "+3" }
  }
}
```

## Socket.io Events (for multiplayer)

- `joinRoom`: Join a multiplayer room
- `playerAction`: Send player action to the room
- `chatMessage`: Send chat message to room
- `updateState`: Update shared room state
- `gameEvent`: Send game event to room
- `roomState`: Receive current room state
- `gameStarted`: Game session started
- `gameEvent`: General game events

## Running Tests

```bash
npm test
```

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **OpenAI API** - AI-powered patient responses
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

## Architecture Notes

- In-memory storage (sessions, multiplayer rooms) - Use Redis/Database for production
- All AI responses use OpenAI's GPT model with safety guardrails
- Multiplayer state is shared across all players in real-time
- Contest mode uses fixed seeds for consistent experiences
- Vitals engine applies deterministic changes based on user actions
- Comprehensive scoring system with multiple factors