// server/data/cases.js
// Load and export all medical cases

const fs = require('fs');
const path = require('path');

// Try to load from JSON file first
let cases = {};

try {
  const data = fs.readFileSync(path.join(__dirname, 'cases.json'), 'utf8');
  cases = JSON.parse(data);
} catch (error) {
  console.error('Error loading cases from JSON:', error.message);
  
  // Fallback to default cases
  cases = {
    "mi-001": {
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
        "Do you have shortness of breath?": "Yes, I'm struggling to breathe.",
        "How would you rate the pain?": "It's an 8 out of 10, the worst I've ever felt.",
        "Does anything make it better or worse?": "Resting doesn't help, and it's getting worse."
      },
      "correct_diagnosis": "Acute Myocardial Infarction (MI)",
      "mcq_options": [
        {
          "id": 1,
          "question": "Based on the patient's presentation (chest pain radiating to left arm, elevated HR and BP), what is the MOST likely diagnosis?",
          "options": [
            "Gastroesophageal reflux disease (GERD)",
            "Acute myocardial infarction (MI)",
            "Panic attack",
            "Musculoskeletal pain"
          ],
          "correctAnswer": 1,
          "explanation": "The patient presents with classic symptoms of acute MI: chest pain radiating to the left arm, elevated heart rate, elevated blood pressure, and significant risk factors (hypertension, diabetes, former smoker). This requires immediate intervention."
        },
        {
          "id": 2,
          "question": "What is the FIRST immediate intervention you should order?",
          "options": [
            "Order chest X-ray",
            "Give sublingual nitroglycerin and call for ECG",
            "Send patient home with antacids",
            "Order stress test for next week"
          ],
          "correctAnswer": 1,
          "explanation": "In suspected MI, immediate actions include: administering aspirin (if not already given), sublingual nitroglycerin, obtaining a 12-lead ECG within 10 minutes, and continuous cardiac monitoring. Time is muscle in MI management."
        },
        {
          "id": 3,
          "question": "Given the patient's allergy to Penicillin, which cardiac catheterization preparation is CONTRAINDICATED?",
          "options": [
            "Pre-procedure hydration",
            "Using penicillin-based prophylactic antibiotics",
            "Iodinated contrast media (with proper premedication)",
            "Beta-blocker administration"
          ],
          "correctAnswer": 1,
          "explanation": "Penicillin-based antibiotics should be avoided in patients with documented penicillin allergy. Alternative prophylactic antibiotics (if needed) should be chosen. The other options are standard preparations for cardiac catheterization."
        }
      ],
      "progression": {
        "max_consecutive_wrong": 3,
        "on_wrong_mcq": { "hr": "+8", "spo2": "-2", "rr": "+3" },
        "on_correct_diagnosis": { "hr": "-10", "spo2": "+3" }
      }
    },
    "pe-002": {
      "case_id": "pe-002",
      "difficulty": "critical",
      "patient": { "name": "Sarah Johnson", "age": 42, "gender": "Female" },
      "chief_complaint": "Sudden shortness of breath and chest pain",
      "vitals": { "hr": 118, "sbp": 100, "dbp": 65, "spo2": 88, "temp_c": 37.8, "rr": 28 },
      "medical_history": ["Recent surgery", "Long plane flight", "Smoking"],
      "allergies": ["None known"],
      "medications": ["Birth control pills"],
      "conversation_triggers": {
        "When did it start?": "About 30 minutes ago after I got off the plane.",
        "Describe the pain": "Sharp, stabbing pain in my chest when I breathe in.",
        "Any allergies?": "No known allergies.",
        "Do you have shortness of breath?": "Yes, I can't catch my breath at all.",
        "Have you traveled recently?": "Yes, I just got off a 12-hour flight from Europe.",
        "Any recent surgery?": "I had knee surgery 2 weeks ago and haven't been moving around much."
      },
      "correct_diagnosis": "Pulmonary Embolism (PE)",
      "mcq_options": [
        {
          "id": 1,
          "question": "What is the most likely diagnosis given the patient's risk factors?",
          "options": [
            "Asthma exacerbation",
            "Pneumonia",
            "Pulmonary Embolism",
            "Pneumothorax"
          ],
          "correctAnswer": 2,
          "explanation": "Patient has classic risk factors for PE (recent surgery, long flight, immobility) with symptoms of acute dyspnea and pleuritic chest pain. The low oxygen saturation is also consistent with PE."
        },
        {
          "id": 2,
          "question": "What is the most appropriate initial intervention?",
          "options": [
            "Bronchodilator therapy",
            "Start anticoagulation and order CT Pulmonary Angiography",
            "Chest physiotherapy",
            "Chest tube insertion"
          ],
          "correctAnswer": 1,
          "explanation": "CT Pulmonary Angiography is the diagnostic test of choice for suspected PE. Anticoagulation should be initiated immediately unless contraindicated while awaiting results."
        }
      ],
      "progression": {
        "max_consecutive_wrong": 3,
        "on_wrong_mcq": { "hr": "+10", "spo2": "-3", "sbp": "-10" },
        "on_correct_diagnosis": { "hr": "-15", "spo2": "+5" }
      }
    },
    "sepsis-003": {
      "case_id": "sepsis-003",
      "difficulty": "severe",
      "patient": { "name": "Robert Chen", "age": 72, "gender": "Male" },
      "chief_complaint": "Fever and low blood pressure",
      "vitals": { "hr": 125, "sbp": 85, "dbp": 55, "spo2": 96, "temp_c": 39.2, "rr": 26 },
      "medical_history": ["Diabetes", "Chronic kidney disease", "Recent UTI"],
      "allergies": ["Sulfa drugs"],
      "medications": ["Metformin", "Lisinopril"],
      "conversation_triggers": {
        "When did it start?": "Started yesterday with chills and fever.",
        "Describe your symptoms": "I feel terrible, very weak, and can't keep anything down.",
        "Any allergies?": "I react badly to sulfa drugs - get a rash.",
        "Do you have any pain?": "I had burning when I urinated a few days ago, but that went away after taking something.",
        "How long have you felt unwell?": "It's been getting worse since yesterday. I just don't feel like myself.",
        "Any recent infections?": "I had a UTI about a week ago, but I didn't finish all the antibiotics."
      },
      "correct_diagnosis": "Septic Shock",
      "mcq_options": [
        {
          "id": 1,
          "question": "Based on the patient's presentation, what is the most serious condition?",
          "options": [
            "Simple UTI",
            "Sepsis with septic shock",
            "Dehydration",
            "Diabetic ketoacidosis"
          ],
          "correctAnswer": 1,
          "explanation": "Patient presents with SIRS criteria (fever, tachycardia, tachypnea) and hypotension, consistent with septic shock from a likely urinary source. The recent UTI that wasn't fully treated is the likely source."
        },
        {
          "id": 2,
          "question": "What is the most critical initial intervention?",
          "options": [
            "Start antibiotics and IV fluids",
            "Order an abdominal CT scan",
            "Begin dialysis",
            "Prescribe oral pain medication"
          ],
          "correctAnswer": 0,
          "explanation": "Early goal-directed therapy with IV fluids and appropriate antibiotics is crucial in septic shock to prevent organ failure and death. Every hour of delay in antibiotics increases mortality."
        }
      ],
      "progression": {
        "max_consecutive_wrong": 3,
        "on_wrong_mcq": { "sbp": "-8", "hr": "+12", "temp_c": "+0.5" },
        "on_correct_diagnosis": { "sbp": "+10", "hr": "-8" }
      }
    },
    "migraine-004": {
      "case_id": "migraine-004",
      "difficulty": "easy",
      "patient": { "name": "Emma Wilson", "age": 35, "gender": "Female" },
      "chief_complaint": "Throbbing unilateral headache",
      "vitals": { "hr": 78, "sbp": 125, "dbp": 82, "spo2": 99, "temp_c": 37.0, "rr": 16 },
      "medical_history": ["Previous migraines", "Family history of migraines"],
      "allergies": ["Aspirin (exacerbates headaches)"],
      "medications": ["None currently"],
      "conversation_triggers": {
        "When did it start?": "Started this morning about 2 hours ago.",
        "Describe the pain": "It's a throbbing pain on the left side of my head, really severe.",
        "Any allergies?": "Aspirin makes my headaches worse for some reason.",
        "Do you have any other symptoms?": "Yes, I'm very sensitive to light and sound, and I vomited once.",
        "Have you had these before?": "Yes, I get these episodically, usually during high stress periods.",
        "Does anything help?": "Dark, quiet room helps, and my usual migraine medication."
      },
      "correct_diagnosis": "Migraine without aura",
      "mcq_options": [
        {
          "id": 1,
          "question": "What is the most likely diagnosis based on the classical features?",
          "options": [
            "Cluster headache",
            "Tension headache",
            "Migraine without aura",
            "Sinus headache"
          ],
          "correctAnswer": 2,
          "explanation": "Patient presents with classic migrainous features: unilateral throbbing pain, photophobia, phonophobia, and nausea. The episodic nature and family history also support this diagnosis."
        }
      ],
      "progression": {
        "max_consecutive_wrong": 5,
        "on_wrong_mcq": { "hr": "+5", "sbp": "+5" },
        "on_correct_diagnosis": { "hr": "-3", "sbp": "-3" }
      }
    },
    "uti-005": {
      "case_id": "uti-005",
      "difficulty": "easy",
      "patient": { "name": "Lisa Rodriguez", "age": 28, "gender": "Female" },
      "chief_complaint": "Burning sensation when urinating",
      "vitals": { "hr": 76, "sbp": 118, "dbp": 74, "spo2": 98, "temp_c": 37.1, "rr": 16 },
      "medical_history": ["Previous UTI", "Diabetes"],
      "allergies": ["Penicillin"],
      "medications": ["Metformin"],
      "conversation_triggers": {
        "When did it start?": "Started yesterday afternoon.",
        "Describe the pain": "Burning and stinging every time I urinate.",
        "Any allergies?": "I'm allergic to penicillin - get a rash.",
        "Do you have any other symptoms?": "I need to urinate frequently but only get a little out each time.",
        "How often are you urinating?": "Every 30 minutes or so, but I can't empty my bladder.",
        "Any fever?": "No fever, but I feel a little achy."
      },
      "correct_diagnosis": "Uncomplicated UTI",
      "mcq_options": [
        {
          "id": 1,
          "question": "What is the most likely diagnosis based on symptoms?",
          "options": [
            "Kidney stones",
            "Vaginitis",
            "Uncomplicated UTI",
            "Yeast infection"
          ],
          "correctAnswer": 2,
          "explanation": "Patient presents with classic symptoms of cystitis: dysuria, frequency, and urgency without fever or systemic symptoms, suggesting a lower UTI rather than pyelonephritis."
        },
        {
          "id": 2,
          "question": "What would be the most appropriate initial treatment?",
          "options": [
            "IV antibiotics",
            "Ciprofloxacin or Bactrim (if not allergic)",
            "Antifungal medication",
            "NSAIDs only"
          ],
          "correctAnswer": 1,
          "explanation": "Uncomplicated UTIs in women are typically treated with short-course oral antibiotics like nitrofurantoin, trimethoprim-sulfamethoxazole (if not allergic), or fosfomycin."
        }
      ],
      "progression": {
        "max_consecutive_wrong": 5,
        "on_wrong_mcq": { "sbp": "+3" },
        "on_correct_diagnosis": { "sbp": "-2", "hr": "-2" }
      }
    }
  };
}

module.exports = cases;