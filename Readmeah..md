 AI Medical Diagnosis Simulator – Full Project Guide (8-Day MVP Plan)
Below is a step-by-step, day-by-day roadmap to build a fully functional MVP of your AI Medical Diagnosis Simulator — from zero to deployable prototype.

✅ Scope: Solo + Contest modes, 5 high-yield cases, chat-based diagnosis, dynamic vitals, MCQ scoring, and session reports.
⏱️ Timeline: 8 working days (1–2 devs + 1 clinician reviewer).
🎯 Outcome: A live, testable web app for medical students. 

📅 Day 1: Backend Core + Case Schema
✅ Goal
Start a session, ask questions, answer MCQs, and see vitals update — all via API.

Tasks
Project Setup
bash

mkdir medical-simulator && cd medical-simulator
mkdir backend frontend cases

Create 5 Static Cases in cases/:
chest-pain-mi.json (Critical)
severe-dyspnea-pe.json (Critical)
fever-hypotension-sepsis.json (Severe)
headache-migraine.json (Easy)
dysuria-uti.json (Easy)
🔗 Download all 5 case JSONs here (see Appendix A). 
Build Backend (Node.js + Express)
Endpoints:
POST /api/session/start → returns session + case
POST /api/session/:id/action → handles questions (uses conversation_triggers)
POST /api/session/:id/answer → handles MCQ, updates vitals, tracks wrong answers
In-memory session store (const sessions = {})
Deterministic vitals engine (applyDelta())
Test with curl or Postman
Start session → ask “When did it start?” → answer MCQ → see vitals/death outcome.
Deliverable
✅ Backend running on http://localhost:5000 with full session logic.

📅 Day 2: Frontend Core UI
✅ Goal
Build a working React UI that talks to your backend.

Tasks
Initialize Frontend
bash


cd frontend
npm create vite@latest . -- --template react
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
Create Components (src/components/):
CaseLoader.jsx – Start new session
ChatWindow.jsx – Doctor/patient chat + quick-question buttons
VitalsCard.jsx – Color-coded vitals (HR, BP, SpO₂, Temp, RR)
HistoryPanel.jsx – Medical history, allergies, meds
MCQPanel.jsx – 4-option MCQ with feedback
State Management (Zustand)
js


⌄
// src/store/useSessionStore.js
import { create } from 'zustand';
export const useSessionStore = create((set) => ({
  sessionId: null,
  vitals: {},
  chatLog: [],
  isDead: false,
  // actions...
}));
Connect to Backend
On “Start Case”, call POST /api/session/start
On question submit, call POST /api/session/:id/action
On MCQ select, call POST /api/session/:id/answer
Styling
Dark medical theme (gray-900 background, red/amber/green for vitals)
Responsive layout (sidebar: history, main: chat + vitals)
Deliverable
✅ Web app where user can:

Load a case
Ask questions and see replies
View vitals and history
Answer MCQ and see outcome
📅 Day 3: AI Patient Engine (LLM Integration)
✅ Goal
Replace static conversation_triggers with dynamic GPT-4 responses.

Tasks
Set Up OpenAI/Gemini API
Get API key
Install SDK: npm install openai (backend)
Create Patient Response Prompt
js


// backend/ai/patientPrompt.js
const buildPatientPrompt = (caseData, chatHistory, userQuestion) => `
You are ${caseData.patient.name}, age ${caseData.patient.age}.
Chief complaint: "${caseData.chief_complaint}".
Medical history: ${caseData.medical_history.join(', ')}.
Allergies: ${caseData.allergies.join(', ')}.

Previous conversation:
${chatHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Doctor just asked: "${userQuestion}"

Respond as the patient in 1–2 short sentences.
ONLY use facts from the case above. Do NOT invent new diseases, meds, or vitals.
If asked about test results or vitals, say: "I don't know the numbers, but I feel [symptom]."
`;
Update /action Endpoint
If question not in conversation_triggers, call GPT
Cache responses to avoid rate limits
Add Safety Guardrails
Block responses containing diagnosis/treatment
Fallback to static reply if GPT fails
Test Realism
Ask odd questions (“Do you like pizza?”) → should deflect
Ask symptom details → should align with case
Deliverable
✅ AI patient responds naturally, never hallucinates, stays in role.

📅 Day 4: Scoring, Reports & Leaderboard
✅ Goal
Track performance and show feedback.

Tasks
Enhance Session Model
js


// Add to session object
events: [],       // { type, payload, timestamp }
score: 0,
timeElapsed: 0,
diagnosisAccuracy: null
Scoring Algorithm
js


const base = 100;
const timeBonus = Math.max(0, 300 - seconds); // max 5 min
const outcomeBonus = isDead ? 0 : 200;
const score = base + timeBonus + outcomeBonus - penalties;
Session Report Page
Correct/missed steps
Ideal management timeline
“You should have ordered ECG earlier” (rule-based feedback)
Contest Mode
Add POST /api/contest/start → uses fixed case seed
Leaderboard: GET /api/leaderboard?mode=contest
Store Sessions (Temporary)
Save to sessions.json file or use SQLite
Deliverable
✅ After case ends, user sees:

Score
Breakdown of errors
Option to retry or view leaderboard
📅 Day 5: Admin Panel + Case Management
✅ Goal
Allow clinicians to review and add cases.

Tasks
Simple Admin UI (/admin)
List all sessions (filter by outcome)
View full chat + vitals timeline
“Flag for review” button
Case Upload
Form to input case JSON
Validate schema before saving to cases/
Clinician Review Checklist (displayed in admin)
☑️ Realistic presentation?
☑️ Plausible distractors?
☑️ Medically justified death?
Export Sessions (CSV for analysis)
Deliverable
✅ Non-technical clinician can upload cases and review sessions.

📅 Day 6: Real-Time Multiplayer (Socket.io)
✅ Goal
Enable 2–4 doctors to collaborate on one patient.

Tasks
Add Socket.io to Backend
js


// backend/server.js
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);
Multiplayer Session Flow
POST /api/multiplayer/create → returns room code
Players join via ?room=ABC123
All actions broadcast via WebSocket
Shared State
Use Redis or in-memory rooms[roomId]
Each action updates shared vitals/chat
Team Scoring
Final score = average individual + collaboration bonus
Deliverable
✅ 2 users can join same room, chat, and diagnose together.

📅 Day 7: Testing + Clinician Validation
✅ Goal
Ensure medical accuracy and usability.

Tasks
Unit Tests
Vitals engine (applyDelta)
Death logic (3 wrong → death)
API routes (mock session)
Integration Tests
Full session flow (Jest + Supertest)
Clinician Testing
Invite 2–3 med students/doctors
Give them 3 cases to try
Collect feedback: realism, clarity, bugs
Fix Critical Issues
AI hallucinations
Unfair MCQs
Vitals not updating
Deliverable
✅ Validated MVP with clinician sign-off.

📅 Day 8: Deployment + Documentation
✅ Goal
Ship to real users.

Tasks
Deploy Backend
Render / Railway / AWS EC2
Set PORT, OPENAI_API_KEY in env
Deploy Frontend
Vercel / Netlify (cd frontend && npm run build)
Add Disclaimers
“For educational use only. Not for real patient care.”
Write README
Local setup guide
Case schema spec
How to add new cases
Collect Analytics
Log: cases attempted, pass rate, avg time
Deliverable
✅ Live URL: https://medsimulator.yourdomain.com
✅ Public GitHub repo with full code + instructions

🧪 Appendix A: 5 Sample Cases (JSON)
Save these in cases/ 

1. chest-pain-mi.json (Critical)
json



⌄
⌄
{
  "case_id": "mi-001",
  "difficulty": "critical",
  "patient": { "name": "John Mitchell", "age": 58, "gender": "Male" },
  "chief_complaint": "Severe chest pain radiating to left arm",
  "vitals": { "hr": 102, "sbp": 145, "dbp": 95, "spo2": 94, "temp_c": 37.2, "rr": 22 },
  "medical_history": ["Hypertension", "Type 2 Diabetes", "High cholesterol"],
  "allergies": ["Penicillin", "Sulfa drugs"],
  "medications": ["Metformin 1000mg BID", "Lisinopril 10mg daily"],
  "conversation_triggers": {
    "When did it start?": "About 2 hours ago.",
    "Describe the pain": "Feels like heavy pressure, like an elephant sitting on my chest.",
    "Any allergies?": "Yes, penicillin and sulfa drugs.",
    "Do you have shortness of breath?": "Yes, I'm struggling to breathe."
  },
  "correct_diagnosis": "Acute Myocardial Infarction (MI)",
  "mcq_options": ["GERD", "Acute Myocardial Infarction (MI)", "Panic attack", "Musculoskeletal pain"],
  "progression": {
    "max_consecutive_wrong": 3,
    "on_wrong_mcq": { "hr": "+8", "spo2": "-2", "rr": "+3" },
    "on_correct_diagnosis": { "hr": "-10", "spo2": "+3" }
  }
}
2. severe-dyspnea-pe.json (Critical)
[Similar structure — chief complaint: “Sudden shortness of breath after flight”, history: recent surgery, correct: Pulmonary Embolism] 

3. fever-hypotension-sepsis.json (Severe)
[Fever, low BP, high RR, immunocompromised → correct: Septic Shock] 

4. headache-migraine.json (Easy)
[Throbbing unilateral headache, photophobia → Migraine] 

5. dysuria-uti.json (Easy)
[Dysuria, frequency, no fever → Uncomplicated UTI] 

💡 Let me know if you want the full JSON for all 5. 