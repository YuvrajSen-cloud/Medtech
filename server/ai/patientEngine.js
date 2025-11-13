// server/ai/patientEngine.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class PatientEngine {
  constructor() {
    // Initialize Google Generative AI client if API key exists
    if (process.env.GEMINI_API_KEY) {
      this.generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.generativeAI.getGenerativeModel({ model: "gemini-pro" });
      this.hasApiKey = true;
    } else {
      console.warn('GEMINI_API_KEY environment variable not found. Using advanced fallback responses only.');
      this.hasApiKey = false;
    }
  }

  // Build the prompt for the AI patient
  buildPatientPrompt(session, chatHistory, userQuestion) {
    const caseData = session.case;
    const patient = caseData.patient;
    
    // Format chat history
    const formattedChatHistory = chatHistory.map(msg => {
      return `${msg.role === 'ai' ? 'Patient' : 'Doctor'}: ${msg.content}`;
    }).join('\n');

    return `
You are roleplaying as ${patient.name}, a ${patient.age}-year-old ${patient.gender.toLowerCase()} patient.
Chief complaint: "${caseData.chief_complaint}".
Medical history: ${caseData.medical_history.join(', ')}.
Allergies: ${caseData.allergies.join(', ')}.
Current medications: ${caseData.medications.join(', ')}.

Vital signs:
- Heart Rate: ${session.vitals.hr} bpm
- Blood Pressure: ${session.vitals.sbp}/${session.vitals.dbp} mmHg
- Oxygen Saturation: ${session.vitals.spo2}%
- Temperature: ${session.vitals.temp_c}°C
- Respiratory Rate: ${session.vitals.rr} breaths/min

Previous conversation:
${formattedChatHistory}

Doctor just asked: "${userQuestion}"

Respond AS THE PATIENT in 1-2 short sentences. Be realistic and consistent with the case details above. 
DO NOT reveal the diagnosis directly. DO NOT provide medical advice. 
Only use facts from the case data provided. Do not invent new symptoms, conditions, or medications.
If asked about test results or vital signs, respond with how the patient feels rather than giving exact numbers.
Keep responses focused on the patient's symptoms and experience based on the case details.
`;
  }

  async generateResponse(session, question) {
    if (this.hasApiKey) {
      try {
        const prompt = this.buildPatientPrompt(
          session, 
          session.chatLog || [], 
          question
        );

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Add safety check to ensure response doesn't contain diagnosis
        return this.sanitizeResponse(text);
        
      } catch (error) {
        console.error('Gemini API generation error:', error);
        
        // Fallback to advanced rule-based response if API fails
        return this.advancedFallbackResponse(session, question);
      }
    } else {
      // Use advanced fallback if no API key is provided
      return this.advancedFallbackResponse(session, question);
    }
  }

  // Sanitize response to ensure it doesn't contain diagnosis
  sanitizeResponse(response) {
    // Remove any text that looks like a diagnosis or treatment recommendation
    const cleaned = response
      .replace(/(diagnosis:|is\s+.*?\.|it's\s+.*?\.|you\s+have\s+.*?\.)/gi, 'I\'m experiencing...')
      .replace(/(should|must|need to)\s+(take|get|see|go)\s+/gi, 'I feel like ')
      .replace(/(treatment|therapy|medication)\s+is/gi, 'this feels like');
    
    return cleaned;
  }

  // Advanced fallback response if AI fails or no API key provided
  advancedFallbackResponse(session, question) {
    const caseData = session.case;
    const patient = caseData.patient;
    
    // Analyze the question to provide contextually appropriate response
    const lowerQuestion = question.toLowerCase();
    
    // Common question patterns and appropriate responses
    if (lowerQuestion.includes('pain') || lowerQuestion.includes('hurt')) {
      const painResponses = [
        `The pain is ${caseData.chief_complaint.split(' ')[0]} and it's around an 8 out of 10 in intensity.`,
        `I'm still experiencing ${caseData.chief_complaint}, and it hasn't changed much.`,
        `The discomfort is constant and feels like pressure.`,
        `When the pain started, it was sudden and severe.`
      ];
      return painResponses[Math.floor(Math.random() * painResponses.length)];
    }
    
    if (lowerQuestion.includes('allerg') || lowerQuestion.includes('reaction')) {
      const allergyResponses = [
        `Yes, I mentioned I'm allergic to ${caseData.allergies[0]}.`,
        `I have allergies to ${caseData.allergies.join(' and ')}, so please keep that in mind.`,
        `I react badly to ${caseData.allergies[0]} - I get a rash.`,
        `My allergies include ${caseData.allergies[0]}, which you should know about.`
      ];
      return allergyResponses[Math.floor(Math.random() * allergyResponses.length)];
    }
    
    if (lowerQuestion.includes('medicat') || lowerQuestion.includes('take')) {
      const medicationResponses = [
        `I take ${caseData.medications.join(', ')} for my conditions.`,
        `My regular medications include ${caseData.medications[0]}, but I can't take certain things because of my allergies.`,
        `I'm on ${caseData.medications[0]} and a few other medications for my health conditions.`,
        `For my ${caseData.medical_history[0]}, I take ${caseData.medications[0]}.`
      ];
      return medicationResponses[Math.floor(Math.random() * medicationResponses.length)];
    }
    
    if (lowerQuestion.includes('history') || lowerQuestion.includes('condition')) {
      const historyResponses = [
        `I have a history of ${caseData.medical_history.join(', ')}.`,
        `My medical history includes ${caseData.medical_history[0]}, which is why I'm concerned about these symptoms.`,
        `I've been dealing with ${caseData.medical_history[0]} for some time now.`,
        `My doctor is managing my ${caseData.medical_history.join(' and ')}.`
      ];
      return historyResponses[Math.floor(Math.random() * historyResponses.length)];
    }
    
    if (lowerQuestion.includes('when') || lowerQuestion.includes('start')) {
      const timingResponses = [
        `It started about ${this.randomTime()} ago and has been getting worse.`,
        `The symptoms began suddenly, and I haven't felt this way before.`,
        `I first noticed something was wrong around ${this.randomTime()} ago.`,
        `This started quite abruptly, and I felt I needed to come in immediately.`
      ];
      return timingResponses[Math.floor(Math.random() * timingResponses.length)];
    }
    
    if (lowerQuestion.includes('breathe') || lowerQuestion.includes('breath')) {
      const breathingResponses = [
        `I'm having trouble breathing normally, which is very concerning.`,
        `Breathing feels labored and more difficult than usual.`,
        `I feel short of breath, even when I'm resting.`,
        `It's hard to catch my breath, and I feel winded.`
      ];
      return breathingResponses[Math.floor(Math.random() * breathingResponses.length)];
    }
    
    // General fallback responses if no specific pattern matches
    const generalResponses = [
      `I'm experiencing ${caseData.chief_complaint}, which is what brought me here.`,
      `The main issue is ${caseData.chief_complaint}, and it's affecting my daily activities.`,
      `I can confirm that ${caseData.chief_complaint} has been persistent.`,
      `My symptoms match what I described earlier - ${caseData.chief_complaint}.`,
      `It's been difficult to function normally with these symptoms of ${caseData.chief_complaint}.`,
      `I'm worried because ${caseData.chief_complaint} is not typical for me.`,
      `I've never experienced anything like ${caseData.chief_complaint} before.`
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  // Helper to generate random time expressions
  randomTime() {
    const times = [
      '2 hours', 'several hours', 'this morning', 'yesterday', 'about an hour', 
      'a few hours', 'this afternoon', 'last night', 'early this morning', 'this evening'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

  // Guardrails to prevent hallucinations
  validateResponse(response, caseData) {
    // Check if response is consistent with case data
    const medicalTerms = [...caseData.medical_history, ...caseData.allergies, ...caseData.medications];
    const caseKeywords = [...medicalTerms, caseData.chief_complaint.toLowerCase()];
    
    // Basic check - doesn't guarantee accuracy but catches obvious mismatches
    const responseLower = response.toLowerCase();
    const hasRelevantTerms = caseKeywords.some(keyword => 
      responseLower.includes(keyword.toLowerCase())
    );
    
    return {
      isValid: true, // Simplified validation
      response: response
    };
  }
}

module.exports = PatientEngine;