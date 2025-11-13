// server/routes/admin.js
const express = require('express');
const router = express.Router();

// Global state will be set by the main server file
let globalState = null;

// Initialize the router with the global state
router.init = (state) => {
  globalState = state;
};

// Get all sessions (for admin review)
router.get('/sessions', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Admin routes not properly initialized' });
  }
  
  const { filter, sortBy = 'startTime', order = 'desc', page = 1, limit = 20 } = req.query;
  
  const sessions = globalState.getSessions();
  
  // Convert sessions map to array for processing
  let sessionArray = Array.from(sessions.values()).map(session => ({
    id: session.id,
    caseId: session.caseId,
    caseTitle: session.case?.chief_complaint || session.caseId,
    mode: session.mode,
    score: session.score,
    timeElapsed: session.endTime ? 
      Math.floor((session.endTime - session.startTime) / 1000) : 
      Math.floor((new Date() - session.startTime) / 1000),
    patientOutcome: session.isDead ? 'Deceased' : 'Survived',
    isCompleted: session.isCompleted,
    startTime: session.startTime,
    endTime: session.endTime,
    studentCount: session.mode === 'multiplayer' ? session.players?.length || 0 : 1,
    wrongAnswers: session.wrongAnswers
  }));

  // Apply filters
  if (filter) {
    sessionArray = sessionArray.filter(session => {
      return Object.values(session).some(value => 
        String(value).toLowerCase().includes(filter.toLowerCase())
      );
    });
  }

  // Sort sessions
  sessionArray.sort((a, b) => {
    const comparison = a[sortBy] < b[sortBy] ? -1 : a[sortBy] > b[sortBy] ? 1 : 0;
    return order === 'desc' ? -comparison : comparison;
  });

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedSessions = sessionArray.slice(startIndex, endIndex);

  res.json({
    sessions: paginatedSessions,
    total: sessionArray.length,
    page: parseInt(page),
    totalPages: Math.ceil(sessionArray.length / limit),
    hasNextPage: endIndex < sessionArray.length,
    hasPrevPage: startIndex > 0
  });
});

// Get specific session details (for admin review)
router.get('/session/:id', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Admin routes not properly initialized' });
  }
  
  const { id } = req.params;
  
  const session = globalState.getSession(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Create detailed session view for admin
  const detailedSession = {
    id: session.id,
    caseId: session.caseId,
    caseDetails: session.case,
    mode: session.mode,
    score: session.score,
    isCompleted: session.isCompleted,
    isDead: session.isDead,
    timeElapsed: session.endTime ? 
      Math.floor((session.endTime - session.startTime) / 1000) : 
      Math.floor((new Date() - session.startTime) / 1000),
    startTime: session.startTime,
    endTime: session.endTime,
    wrongAnswers: session.wrongAnswers,
    consecutiveWrong: session.consecutiveWrong,
    maxConsecutiveWrong: session.maxConsecutiveWrong,
    patientState: session.patientState,
    events: session.events,
    chatLog: session.chatLog,
    vitals: session.vitals
  };

  res.json(detailedSession);
});

// Flag session for review
router.post('/session/:id/flag', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Admin routes not properly initialized' });
  }
  
  const { id } = req.params;
  const { reason, reviewerNotes } = req.body;
  
  const session = globalState.getSession(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Add flag to session
  if (!session.flags) session.flags = [];
  session.flags.push({
    reason,
    reviewerNotes,
    timestamp: new Date(),
    flaggedBy: req.user?.id || 'admin'  // In a real app, you'd have authentication
  });

  res.json({ success: true, message: 'Session flagged successfully' });
});

// Get all cases
router.get('/cases', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Admin routes not properly initialized' });
  }
  
  const cases = globalState.getCases();
  res.json(Object.values(cases));
});

// Add/update a case
router.post('/case', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Admin routes not properly initialized' });
  }
  
  const { caseData } = req.body;
  const cases = globalState.getCases();
  
  // Validate case schema
  const requiredFields = ['case_id', 'difficulty', 'patient', 'chief_complaint', 'vitals', 'medical_history', 'allergies', 'medications', 'conversation_triggers', 'correct_diagnosis', 'mcq_options', 'progression'];
  
  for (const field of requiredFields) {
    if (!(field in caseData)) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // Validate MCQ options
  if (!Array.isArray(caseData.mcq_options) || caseData.mcq_options.length === 0) {
    return res.status(400).json({ error: 'Case must include at least one MCQ question' });
  }

  // Validate each MCQ
  for (const mcq of caseData.mcq_options) {
    if (typeof mcq.id !== 'number' || !Array.isArray(mcq.options) || mcq.options.length === 0 || 
        typeof mcq.correctAnswer !== 'number' || typeof mcq.explanation !== 'string') {
      return res.status(400).json({ error: 'Invalid MCQ format' });
    }
  }

  // Add to cases
  cases[caseData.case_id] = caseData;
  
  // In a real application, you would save to database
  // For this demo, we're using in-memory storage
  
  res.json({ success: true, message: 'Case saved successfully', caseId: caseData.case_id });
});

// Update an existing case
router.put('/case/:caseId', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Admin routes not properly initialized' });
  }
  
  const { caseId } = req.params;
  const updatedCaseData = req.body;
  const cases = globalState.getCases();
  
  if (!cases[caseId]) {
    return res.status(404).json({ error: 'Case not found' });
  }

  // Validate case schema (reuse validation logic)
  const requiredFields = ['case_id', 'difficulty', 'patient', 'chief_complaint', 'vitals', 'medical_history', 'allergies', 'medications', 'conversation_triggers', 'correct_diagnosis', 'mcq_options', 'progression'];
  
  for (const field of requiredFields) {
    if (!(field in updatedCaseData)) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // Update the case
  cases[caseId] = updatedCaseData;
  
  res.json({ success: true, message: 'Case updated successfully', caseId });
});

// Delete a case
router.delete('/case/:caseId', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Admin routes not properly initialized' });
  }
  
  const { caseId } = req.params;
  const cases = globalState.getCases();
  
  if (!cases[caseId]) {
    return res.status(404).json({ error: 'Case not found' });
  }

  delete cases[caseId];
  
  res.json({ success: true, message: 'Case deleted successfully' });
});

// Get flagged sessions
router.get('/flagged-sessions', (req, res) => {
  if (!globalState) {
    return res.status(500).json({ error: 'Admin routes not properly initialized' });
  }
  
  const sessions = globalState.getSessions();
  const flaggedSessions = Array.from(sessions.values())
    .filter(session => session.flags && session.flags.length > 0)
    .map(session => ({
      id: session.id,
      caseId: session.caseId,
      caseTitle: session.case?.chief_complaint || session.caseId,
      flags: session.flags,
      score: session.score,
      startTime: session.startTime,
      patientOutcome: session.isDead ? 'Deceased' : 'Survived'
    }));

  res.json(flaggedSessions);
});

module.exports = router;