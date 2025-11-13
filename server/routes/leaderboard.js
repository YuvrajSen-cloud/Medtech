// server/routes/leaderboard.js
const express = require('express');
const router = express.Router();

// Global state will be set by the main server file
let globalState = null;

// Initialize the router with the global state
router.init = (state) => {
  globalState = state;
};

// Get leaderboard (with filtering options)
router.get('/', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Leaderboard routes not properly initialized' });
  }
  
  const sessions = globalState.getSessions();
  const { mode = 'solo', difficulty, limit = 10, timeRange = 'all' } = req.query;
  
  // Get all completed sessions
  const completedSessions = Array.from(sessions.values())
    .filter(session => session.isCompleted && session.mode === mode)
    .map(session => {
      const timeElapsed = session.endTime ? 
        Math.floor((session.endTime - session.startTime) / 1000) : 
        Math.floor((new Date() - session.startTime) / 1000);
      
      return {
        playerId: session.id,
        playerInitials: session.playerName || `Player${session.id.slice(-4)}`, // In real app, would be actual player name
        score: session.score,
        time: timeElapsed,
        caseId: session.caseId,
        difficulty: session.case?.difficulty || 'unknown',
        timestamp: session.endTime || session.startTime,
        patientOutcome: session.isDead ? 'deceased' : 'survived'
      };
    });

  // Apply difficulty filter if specified
  let filteredSessions = completedSessions;
  if (difficulty) {
    filteredSessions = filteredSessions.filter(session => session.difficulty === difficulty);
  }

  // Apply time range filter if specified
  if (timeRange !== 'all') {
    const now = new Date();
    let cutoffDate;
    
    switch (timeRange) {
      case 'day':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      default:
        cutoffDate = new Date(0); // All time
    }
    
    filteredSessions = filteredSessions.filter(session => 
      new Date(session.timestamp) > cutoffDate
    );
  }

  // Sort by score (descending) and then by time (ascending for tiebreakers)
  const sortedSessions = filteredSessions.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.time - b.time; // Faster completion time breaks ties
  });

  // Limit results
  const leaderboard = sortedSessions.slice(0, parseInt(limit));

  // Add rankings
  const rankedLeaderboard = leaderboard.map((session, index) => ({
    ...session,
    rank: index + 1
  }));

  res.json(rankedLeaderboard);
});

// Get personal best scores
router.get('/personal/:playerId', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Leaderboard routes not properly initialized' });
  }
  
  const sessions = globalState.getSessions();
  const { playerId } = req.params;
  
  const playerSessions = Array.from(sessions.values())
    .filter(session => session.id === playerId && session.isCompleted)
    .map(session => {
      const timeElapsed = session.endTime ? 
        Math.floor((session.endTime - session.startTime) / 1000) : 
        Math.floor((new Date() - session.startTime) / 1000);
      
      return {
        sessionId: session.id,
        caseId: session.caseId,
        caseTitle: session.case?.chief_complaint || session.caseId,
        score: session.score,
        time: timeElapsed,
        difficulty: session.case?.difficulty || 'unknown',
        timestamp: session.endTime || session.startTime,
        patientOutcome: session.isDead ? 'deceased' : 'survived'
      };
    })
    .sort((a, b) => b.score - a.score); // Sort by highest score first

  res.json(playerSessions);
});

// Get case-specific leaderboard
router.get('/case/:caseId', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Leaderboard routes not properly initialized' });
  }
  
  const sessions = globalState.getSessions();
  const { caseId } = req.params;
  const { limit = 10 } = req.query;
  
  const caseSessions = Array.from(sessions.values())
    .filter(session => session.caseId === caseId && session.isCompleted)
    .map(session => {
      const timeElapsed = session.endTime ? 
        Math.floor((session.endTime - session.startTime) / 1000) : 
        Math.floor((new Date() - session.startTime) / 1000);
      
      return {
        playerId: session.id,
        playerInitials: session.playerName || `Player${session.id.slice(-4)}`,
        score: session.score,
        time: timeElapsed,
        timestamp: session.endTime || session.startTime,
        patientOutcome: session.isDead ? 'deceased' : 'survived'
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.time - b.time; // Faster completion time breaks ties
    })
    .slice(0, parseInt(limit))
    .map((session, index) => ({ ...session, rank: index + 1 }));

  res.json(caseSessions);
});

module.exports = router;