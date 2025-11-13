// server/state.js - Global state manager
class GlobalState {
  constructor() {
    this.sessions = new Map();
    this.multiplayerRooms = new Map();
    this.cases = require('./data/cases');
  }

  // Getter methods to access the state
  getSessions() {
    return this.sessions;
  }

  getMultiplayerRooms() {
    return this.multiplayerRooms;
  }

  getCases() {
    return this.cases;
  }

  // Helper methods to access individual items
  getSession(id) {
    return this.sessions.get(id);
  }

  getRoom(id) {
    return this.multiplayerRooms.get(id);
  }

  getCase(id) {
    return this.cases[id];
  }

  // Setter methods
  setSession(id, session) {
    this.sessions.set(id, session);
  }

  setRoom(id, room) {
    this.multiplayerRooms.set(id, room);
  }

  setCase(id, caseData) {
    this.cases[id] = caseData;
  }

  // Delete methods
  deleteSession(id) {
    return this.sessions.delete(id);
  }

  deleteRoom(id) {
    return this.multiplayerRooms.delete(id);
  }

  deleteCase(id) {
    delete this.cases[id];
  }
}

module.exports = new GlobalState();