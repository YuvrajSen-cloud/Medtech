// server/utils/scoring.js
class ScoringSystem {
  // Calculate base score from MCQ answers
  calculateScore(session) {
    // Base score is the sum of points from MCQs
    // Correct answers give points, wrong answers might reduce points
    let totalScore = 0;
    
    // Add points for correct answers
    const correctAnswers = session.events.filter(e => e.type === 'mcq_answer' && e.isCorrect).length;
    const wrongAnswers = session.events.filter(e => e.type === 'mcq_answer' && !e.isCorrect).length;
    
    totalScore = (correctAnswers * 10) - (wrongAnswers * 5); // 10 points for correct, -5 for wrong
    
    // Time bonus: More points for completing faster
    const timeElapsed = session.endTime ? 
      Math.floor((session.endTime - session.startTime) / 1000) : // in seconds
      Math.floor((new Date() - session.startTime) / 1000); // in seconds
    
    // Max time bonus for completing in under 5 minutes (300 seconds)
    const maxTimeBonus = 200;
    const timeBonus = Math.max(0, maxTimeBonus - Math.floor(timeElapsed / 60) * 10); // 10 points per minute slower
    
    // Outcome bonus for not dying
    const outcomeBonus = session.isDead ? 0 : 100;
    
    // Accuracy bonus
    const totalAnswers = correctAnswers + wrongAnswers;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const accuracyBonus = accuracy >= 80 ? 50 : 0;
    
    totalScore += timeBonus + outcomeBonus + accuracyBonus;
    
    return Math.max(0, totalScore); // Ensure score doesn't go below 0
  }

  // Generate session report
  generateReport(session) {
    const timeElapsed = session.endTime ? 
      Math.floor((session.endTime - session.startTime) / 1000) : // in seconds
      Math.floor((new Date() - session.startTime) / 1000); // in seconds
    
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    
    const correctAnswers = session.events.filter(e => e.type === 'mcq_answer' && e.isCorrect).length;
    const wrongAnswers = session.events.filter(e => e.type === 'mcq_answer' && !e.isCorrect).length;
    const totalAnswers = correctAnswers + wrongAnswers;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    
    const finalScore = this.calculateScore(session);
    
    // Identify missed opportunities (MCQs that were answered incorrectly)
    const missedOpportunities = session.events
      .filter(e => e.type === 'mcq_answer' && !e.isCorrect)
      .map(e => {
        // Find the question in the case to get details
        const question = session.case.mcq_options.find(q => q.id === e.questionId);
        return {
          question: question ? question.question : 'Unknown question',
          yourAnswer: e.answerIndex,
          correctAnswer: question ? question.correctAnswer : -1,
          explanation: question ? question.explanation : 'No explanation available'
        };
      });
    
    // Generate feedback
    const performanceFeedback = this.generatePerformanceFeedback(session, accuracy, timeElapsed);
    
    return {
      sessionId: session.id,
      caseId: session.caseId,
      caseTitle: session.case?.title || session.caseId,
      score: finalScore,
      timeTaken: `${minutes}m ${seconds}s`,
      timeInSeconds: timeElapsed,
      accuracy: Math.round(accuracy * 100) / 100,
      correctAnswers,
      wrongAnswers,
      totalAnswers,
      patientOutcome: session.isDead ? 'Patient deceased' : 'Patient survived',
      isCompleted: session.isCompleted || false,
      missedOpportunities,
      performanceFeedback,
      sessionSummary: this.generateSessionSummary(session, accuracy, timeElapsed)
    };
  }

  // Generate performance feedback
  generatePerformanceFeedback(session, accuracy, timeElapsed) {
    const feedback = [];
    
    // Accuracy feedback
    if (accuracy >= 90) {
      feedback.push("Excellent diagnostic accuracy! Your decision-making was precise.");
    } else if (accuracy >= 70) {
      feedback.push("Good diagnostic accuracy. You identified most critical issues correctly.");
    } else if (accuracy >= 50) {
      feedback.push("Moderate diagnostic accuracy. Focus on pattern recognition for improvement.");
    } else {
      feedback.push("Diagnostic accuracy needs improvement. Review the explanations for missed questions.");
    }
    
    // Time feedback
    if (timeElapsed < 300) { // Under 5 minutes
      feedback.push("Excellent time management! You made efficient decisions under pressure.");
    } else if (timeElapsed < 600) { // Under 10 minutes
      feedback.push("Good time management. Try to streamline your diagnostic process.");
    } else {
      feedback.push("Consider improving your time management during patient assessment.");
    }
    
    // Outcome feedback
    if (session.isDead) {
      feedback.push("Patient outcome was not optimal. Consider earlier interventions for critical conditions.");
    } else {
      feedback.push("Positive patient outcome achieved! You managed the case effectively.");
    }
    
    return feedback;
  }

  // Generate session summary
  generateSessionSummary(session, accuracy, timeElapsed) {
    const summary = [];
    
    // Add case-specific insights
    if (session.case && session.case.correct_diagnosis) {
      const wasCorrectDiagnosis = session.events.some(e => 
        e.type === 'mcq_answer' && 
        e.questionId === 'diagnosis' && 
        e.isCorrect
      );
      
      if (wasCorrectDiagnosis) {
        summary.push(`Successfully identified ${session.case.correct_diagnosis} as the primary diagnosis.`);
      } else {
        summary.push(`Missed the primary diagnosis of ${session.case.correct_diagnosis}. Review typical presentations.`);
      }
    }
    
    // Add time-based insights
    if (timeElapsed < 300) {
      summary.push("Rapid diagnostic process demonstrated efficient clinical reasoning.");
    } else if (timeElapsed > 600) {
      summary.push("Extended time suggests complex case or need for more efficient diagnostic approach.");
    }
    
    // Add learning recommendations
    if (accuracy < 70) {
      summary.push("Focus on strengthening knowledge in this medical specialty area.");
    }
    
    if (!session.isDead) {
      summary.push("Successfully prevented critical deterioration and maintained patient stability.");
    }
    
    return summary;
  }
}

module.exports = ScoringSystem;