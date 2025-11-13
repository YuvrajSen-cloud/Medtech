const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import global state and routes
const globalState = require('./state');
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const server = createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Get the state managers
const sessions = globalState.getSessions();
const multiplayerRooms = globalState.getMultiplayerRooms();
const cases = globalState.getCases();

// Initialize routes with access to global state
adminRoutes.init(globalState);
leaderboardRoutes.init(globalState);

// Set up routes (these need access to the shared data structures)
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Helper functions
const applyDelta = (currentVitals, delta) => {
  const newVitals = { ...currentVitals };
  for (const [key, value] of Object.entries(delta)) {
    if (typeof value === 'string') {
      // Handle value changes like "+8", "-2"
      if (value.startsWith('+')) {
        newVitals[key] = currentVitals[key] + parseFloat(value.slice(1));
      } else if (value.startsWith('-')) {
        newVitals[key] = currentVitals[key] - parseFloat(value.slice(1));
      } else {
        newVitals[key] = parseFloat(value);
      }
    } else {
      newVitals[key] = currentVitals[key] + value;
    }
  }
  return newVitals;
};

// API Routes
app.post('/api/session/start', (req, res) => {
  const { caseId, mode = 'solo' } = req.body;
  const selectedCase = Object.values(cases).find(c => c.case_id === caseId);

  if (!selectedCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session = {
    id: sessionId,
    caseId,
    case: selectedCase,
    mode,
    vitals: { ...selectedCase.vitals },
    chatLog: [],
    score: 0,
    timeElapsed: 0,
    isDead: false,
    isCompleted: false, // Add this to track completion for leaderboards
    events: [],
    startTime: new Date(),
    endTime: null,
    wrongAnswers: 0,
    consecutiveWrong: 0,
    maxConsecutiveWrong: selectedCase.progression?.max_consecutive_wrong || 3,
    patientState: 'stable' // 'stable', 'critical', 'dying', 'dead'
  };

  sessions.set(sessionId, session);
  
  res.json({
    sessionId,
    case: selectedCase,
    vitals: session.vitals,
    patientState: session.patientState
  });
});

// Import the PatientEngine
const PatientEngine = require('./ai/patientEngine');
const patientEngine = new PatientEngine();

app.post('/api/session/:id/action', async (req, res) => {
  const { id } = req.params;
  const { action, question } = req.body;
  
  const session = sessions.get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Check if patient is already dead
  if (session.isDead) {
    return res.json({
      message: "The patient has unfortunately passed away. The simulation has ended.",
      vitals: session.vitals,
      patientState: 'dead',
      isDead: true
    });
  }

  // Add the doctor's question to chat log
  session.chatLog.push({
    role: 'user',
    content: question,
    timestamp: new Date()
  });

  // Check if there's a predefined answer in conversation_triggers
  if (session.case.conversation_triggers && session.case.conversation_triggers[question]) {
    const message = session.case.conversation_triggers[question];
    
    // Add to chat log
    session.chatLog.push({
      role: 'ai',
      content: message,
      timestamp: new Date()
    });
    
    res.json({
      message,
      vitals: session.vitals,
      patientState: session.patientState
    });
  } else {
    // Use AI to generate response
    try {
      const aiResponse = await patientEngine.generateResponse(session, question);
      
      // Add to chat log
      session.chatLog.push({
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      });
      
      res.json({
        message: aiResponse,
        vitals: session.vitals,
        patientState: session.patientState
      });
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Fallback to generic response
      const fallbackMessage = `The patient responds: "I'm not sure about that. I'm just experiencing ${session.case.chief_complaint}."`;
      
      // Add to chat log
      session.chatLog.push({
        role: 'ai',
        content: fallbackMessage,
        timestamp: new Date()
      });
      
      res.json({
        message: fallbackMessage,
        vitals: session.vitals,
        patientState: session.patientState
      });
    }
  }
});

// Import the ScoringSystem
const ScoringSystem = require('./utils/scoring');
const scoringSystem = new ScoringSystem();

// Initialize the routes with the existing data stores
adminRoutes.init(sessions, multiplayerRooms, cases);
leaderboardRoutes.init(sessions, multiplayerRooms, cases);

app.post('/api/session/:id/answer', (req, res) => {
  const { id } = req.params;
  const { questionId, answerIndex } = req.body;
  
  const session = sessions.get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Check if patient is already dead
  if (session.isDead) {
    return res.json({
      message: "The patient has unfortunately passed away. The simulation has ended.",
      isDead: true,
      vitals: session.vitals,
      patientState: 'dead'
    });
  }

  // Find the question
  const question = session.case.mcq_options.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const isCorrect = answerIndex === question.correctAnswer;

  // Update score
  if (isCorrect) {
    session.consecutiveWrong = 0;
    
    // Apply correct answer vitals update
    if (session.case.progression && session.case.progression.on_correct_diagnosis) {
      session.vitals = applyDelta(session.vitals, session.case.progression.on_correct_diagnosis);
    }
  } else {
    session.wrongAnswers++;
    session.consecutiveWrong++;
    
    // Apply wrong answer vitals update
    if (session.case.progression && session.case.progression.on_wrong_mcq) {
      session.vitals = applyDelta(session.vitals, session.case.progression.on_wrong_mcq);
    }
    
    // Check if patient dies after consecutive wrong answers
    if (session.consecutiveWrong >= session.maxConsecutiveWrong) {
      session.isDead = true;
      session.patientState = 'dead';
    }
  }

  // Add to events log
  session.events.push({
    type: 'mcq_answer',
    questionId,
    answerIndex,
    isCorrect,
    timestamp: new Date()
  });

  // Update patient state based on vitals
  if (!session.isDead) {
    session.patientState = getPatientState(session.vitals);
  }

  // Calculate updated score
  session.score = scoringSystem.calculateScore(session);

  res.json({
    isCorrect,
    explanation: question.explanation,
    vitals: session.vitals,
    patientState: session.patientState,
    isDead: session.isDead,
    score: session.score
  });
});

app.get('/api/session/:id', (req, res) => {
  const { id } = req.params;
  
  const session = sessions.get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    id: session.id,
    caseId: session.caseId,
    vitals: session.vitals,
    patientState: session.patientState,
    score: session.score,
    timeElapsed: session.timeElapsed,
    isDead: session.isDead,
    chatLog: session.chatLog,
    events: session.events
  });
});

// End session and generate report
app.post('/api/session/:id/end', (req, res) => {
  const { id } = req.params;
  
  const session = sessions.get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Mark session as completed and set end time
  session.isCompleted = true;
  session.endTime = new Date();

  // Generate final report
  const report = scoringSystem.generateReport(session);

  // Add to completed sessions for leaderboards (would save to DB in production)
  // For this demo, we'll just update the session with completion status
  session.isCompleted = true;

  res.json(report);
});

app.post('/api/contest/start', (req, res) => {
  const { caseId } = req.body;
  const selectedCase = Object.values(cases).find(c => c.case_id === caseId);

  if (!selectedCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  // Use fixed seed for contest mode to ensure consistent experience
  const seed = 12345; // Fixed seed for consistent contest experience
  const sessionId = `contest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session = {
    id: sessionId,
    caseId,
    case: selectedCase,
    mode: 'contest',
    vitals: { ...selectedCase.vitals }, // Use initial vitals from the case
    chatLog: [],
    score: 0,
    timeElapsed: 0,
    isDead: false,
    isCompleted: false,
    events: [],
    startTime: new Date(),
    endTime: null,
    wrongAnswers: 0,
    consecutiveWrong: 0,
    maxConsecutiveWrong: selectedCase.progression?.max_consecutive_wrong || 3,
    patientState: 'stable',
    seed: seed, // Fixed seed for contest mode to ensure consistent experience
    // Add a randomization state based on the seed to make certain elements predictable
    randomizationState: seed 
  };

  sessions.set(sessionId, session);
  
  res.json({
    sessionId,
    case: selectedCase,
    vitals: session.vitals,
    patientState: session.patientState
  });
});

app.get('/api/leaderboard', (req, res) => {
  const { mode = 'solo' } = req.query;
  
  // Filter sessions by mode and completion status
  const completedSessions = Array.from(sessions.values())
    .filter(session => session.mode === mode && session.isCompleted)
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 10); // Top 10

  const leaderboard = completedSessions.map(session => ({
    playerId: session.id,
    score: session.score,
    name: `Player ${session.id.slice(0, 8)}`, // For demo purposes
    time: session.timeElapsed,
    caseId: session.caseId,
    timestamp: session.startTime
  }));

  res.json(leaderboard);
});

app.get('/api/cases', (req, res) => {
  res.json(Object.values(cases));
});

// Multiplayer routes
app.post('/api/multiplayer/create', (req, res) => {
  const { caseId, maxPlayers = 4, hostId, hostName } = req.body;
  const selectedCase = Object.values(cases).find(c => c.case_id === caseId);

  if (!selectedCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const room = {
    id: roomId,
    caseId,
    case: selectedCase,
    players: [],
    maxPlayers,
    status: 'waiting', // waiting, active, completed
    vitals: { ...selectedCase.vitals },
    chatLog: [],
    startTime: null,
    created: new Date(),
    hostId,
    sharedState: {
      vitals: { ...selectedCase.vitals },
      chatLog: [],
      events: [],
      score: 0,
      isDead: false,
      patientState: 'stable',
      timeElapsed: 0
    }
  };

  multiplayerRooms.set(roomId, room);
  
  res.json({
    roomId,
    case: selectedCase,
    status: room.status
  });
});

app.post('/api/multiplayer/join/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { playerId, playerName } = req.body;
  
  const room = multiplayerRooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.players.length >= room.maxPlayers) {
    return res.status(400).json({ error: 'Room is full' });
  }

  if (room.status !== 'waiting') {
    return res.status(400).json({ error: 'Room is no longer accepting players' });
  }

  // Add player to room
  const player = {
    id: playerId,
    name: playerName,
    isHost: room.players.length === 0, // First player is host
    joinedAt: new Date(),
    role: playerRoles[room.players.length] || 'team_member' // Assign roles to team members
  };

  room.players.push(player);

  // Start game if room is full or host decides to start with available players
  if (room.players.length === room.maxPlayers) {
    room.status = 'active';
    room.startTime = new Date();
    
    // Broadcast to all players in room
    io.to(roomId).emit('gameStarted', {
      roomId,
      players: room.players,
      case: room.case,
      sharedState: room.sharedState
    });
  }

  // Join the socket room
  req.ioSocket = req.ioSocket || {};
  req.ioSocket.roomId = roomId;
  
  res.json({
    success: true,
    room: {
      id: room.id,
      players: room.players,
      status: room.status,
      case: room.case,
      sharedState: room.sharedState
    }
  });
});

// Define player roles for multiplayer
const playerRoles = [
  'team_lead',      // Leader coordinates team actions
  'primary_doctor',  // Primary diagnostician
  'secondary_doctor', // Supports with additional assessments
  'nurse'          // Manages vitals and medications
];

// Multiplayer-specific endpoints
app.post('/api/multiplayer/:roomId/action', async (req, res) => {
  const { roomId } = req.params;
  const { playerId, action, question } = req.body;
  
  const room = multiplayerRooms.get(roomId);
  if (!room || room.status !== 'active') {
    return res.status(404).json({ error: 'Active room not found' });
  }

  // Check if patient is already dead
  if (room.sharedState.isDead) {
    return res.json({
      message: "The patient has unfortunately passed away. The simulation has ended.",
      vitals: room.sharedState.vitals,
      patientState: 'dead',
      isDead: true
    });
  }

  // Add the player's action to the shared chat log
  room.sharedState.chatLog.push({
    playerId,
    playerName: room.players.find(p => p.id === playerId)?.name || `Player ${playerId}`,
    content: question || action,
    timestamp: new Date(),
    role: 'user'
  });

  // Check if there's a predefined answer in conversation_triggers
  if (room.case.conversation_triggers && room.case.conversation_triggers[question]) {
    const message = room.case.conversation_triggers[question];
    
    // Add to shared chat log
    room.sharedState.chatLog.push({
      playerId: 'ai',
      playerName: 'Patient',
      content: message,
      timestamp: new Date(),
      role: 'ai'
    });
    
    // Broadcast to all players in room
    io.to(roomId).emit('updateState', { 
      chatLog: room.sharedState.chatLog,
      vitals: room.sharedState.vitals,
      patientState: room.sharedState.patientState
    });
    
    res.json({
      message,
      vitals: room.sharedState.vitals,
      patientState: room.sharedState.patientState
    });
  } else {
    // Use AI to generate response
    try {
      // Create a temporary session object for the AI engine
      const tempSession = {
        case: room.case,
        vitals: room.sharedState.vitals,
        chatLog: room.sharedState.chatLog.filter(msg => msg.role !== 'ai')
      };
      
      const aiResponse = await patientEngine.generateResponse(tempSession, question);
      
      // Add to shared chat log
      room.sharedState.chatLog.push({
        playerId: 'ai',
        playerName: 'Patient',
        content: aiResponse,
        timestamp: new Date(),
        role: 'ai'
      });
      
      // Broadcast to all players in room
      io.to(roomId).emit('updateState', { 
        chatLog: room.sharedState.chatLog,
        vitals: room.sharedState.vitals,
        patientState: room.sharedState.patientState
      });
      
      res.json({
        message: aiResponse,
        vitals: room.sharedState.vitals,
        patientState: room.sharedState.patientState
      });
    } catch (error) {
      console.error('Multiplayer AI generation error:', error);
      
      // Fallback to generic response
      const fallbackMessage = `The patient responds: "I'm not sure about that. I'm just experiencing ${room.case.chief_complaint}."`;
      
      // Add to shared chat log
      room.sharedState.chatLog.push({
        playerId: 'ai',
        playerName: 'Patient',
        content: fallbackMessage,
        timestamp: new Date(),
        role: 'ai'
      });
      
      // Broadcast to all players in room
      io.to(roomId).emit('updateState', { 
        chatLog: room.sharedState.chatLog,
        vitals: room.sharedState.vitals,
        patientState: room.sharedState.patientState
      });
      
      res.json({
        message: fallbackMessage,
        vitals: room.sharedState.vitals,
        patientState: room.sharedState.patientState
      });
    }
  }
});

app.post('/api/multiplayer/:roomId/answer', (req, res) => {
  const { roomId } = req.params;
  const { playerId, questionId, answerIndex } = req.body;
  
  const room = multiplayerRooms.get(roomId);
  if (!room || room.status !== 'active') {
    return res.status(404).json({ error: 'Active room not found' });
  }

  // Check if patient is already dead
  if (room.sharedState.isDead) {
    return res.json({
      message: "The patient has unfortunately passed away. The simulation has ended.",
      isDead: true,
      vitals: room.sharedState.vitals,
      patientState: 'dead'
    });
  }

  // Find the question
  const question = room.case.mcq_options.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const isCorrect = answerIndex === question.correctAnswer;

  // Update shared state
  if (isCorrect) {
    room.sharedState.consecutiveWrong = 0;
    
    // Apply correct answer vitals update
    if (room.case.progression && room.case.progression.on_correct_diagnosis) {
      room.sharedState.vitals = applyDelta(room.sharedState.vitals, room.case.progression.on_correct_diagnosis);
    }
  } else {
    room.sharedState.wrongAnswers = (room.sharedState.wrongAnswers || 0) + 1;
    room.sharedState.consecutiveWrong = (room.sharedState.consecutiveWrong || 0) + 1;
    
    // Apply wrong answer vitals update
    if (room.case.progression && room.case.progression.on_wrong_mcq) {
      room.sharedState.vitals = applyDelta(room.sharedState.vitals, room.case.progression.on_wrong_mcq);
    }
    
    // Check if patient dies after consecutive wrong answers
    if (room.sharedState.consecutiveWrong >= room.case.progression?.max_consecutive_wrong || 3) {
      room.sharedState.isDead = true;
      room.sharedState.patientState = 'dead';
    }
  }

  // Add to shared events log
  room.sharedState.events.push({
    type: 'mcq_answer',
    playerId,
    questionId,
    answerIndex,
    isCorrect,
    timestamp: new Date()
  });

  // Update patient state based on vitals
  if (!room.sharedState.isDead) {
    room.sharedState.patientState = getPatientState(room.sharedState.vitals);
  }

  // Calculate updated score
  room.sharedState.score = scoringSystem.calculateScore({
    ...room,
    score: room.sharedState.score,
    events: room.sharedState.events,
    vitals: room.sharedState.vitals,
    isDead: room.sharedState.isDead
  });

  // Broadcast to all players in room
  io.to(roomId).emit('updateState', {
    events: room.sharedState.events,
    vitals: room.sharedState.vitals,
    patientState: room.sharedState.patientState,
    isDead: room.sharedState.isDead,
    score: room.sharedState.score
  });

  res.json({
    isCorrect,
    explanation: question.explanation,
    vitals: room.sharedState.vitals,
    patientState: room.sharedState.patientState,
    isDead: room.sharedState.isDead,
    score: room.sharedState.score
  });
});

app.get('/api/multiplayer/:roomId/state', (req, res) => {
  const { roomId } = req.params;
  
  const room = multiplayerRooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    id: room.id,
    players: room.players,
    status: room.status,
    sharedState: room.sharedState,
    case: room.case
  });
});

// Make io available globally for routes that need it
app.io = io;

// Socket.io handlers for multiplayer
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);

    // Send current room state to the new user
    const room = multiplayerRooms.get(roomId);
    if (room) {
      socket.emit('roomState', {
        roomId,
        players: room.players,
        status: room.status,
        sharedState: room.sharedState
      });
    }
  });

  socket.on('playerAction', (data) => {
    const { roomId, playerId, action } = data;
    
    // Broadcast action to all players in room except sender
    socket.to(roomId).emit('playerAction', {
      playerId,
      action,
      timestamp: new Date()
    });
  });

  socket.on('chatMessage', (data) => {
    const { roomId, playerId, message } = data;
    
    // Broadcast chat message to all players in room
    io.to(roomId).emit('chatMessage', {
      playerId,
      message,
      playerName: multiplayerRooms.get(roomId)?.players.find(p => p.id === playerId)?.name || 'Anonymous',
      timestamp: new Date()
    });
  });

  socket.on('updateState', (data) => {
    const { roomId, stateUpdate } = data;
    
    // Broadcast state update to all players in room
    io.to(roomId).emit('updateState', stateUpdate);
  });

  socket.on('gameEvent', (data) => {
    const { roomId, event } = data;
    
    // Broadcast game event to all players in room
    io.to(roomId).emit('gameEvent', {
      ...event,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from any rooms they were in (if needed)
    // This would require tracking which rooms a socket was in
  });
});



function getPatientState(vitals) {
  // Simple logic to determine patient state based on vitals
  const { hr, sbp, spo2, temp_c, rr } = vitals;
  
  if (sbp <= 90 || spo2 <= 90 || hr > 140 || hr < 50 || temp_c > 39 || temp_c < 34) {
    return 'critical';
  } else if (sbp <= 100 || spo2 <= 94 || hr > 120 || hr < 60 || (temp_c > 38 && temp_c <= 39)) {
    return 'deteriorating';
  } else {
    return 'stable';
  }
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});