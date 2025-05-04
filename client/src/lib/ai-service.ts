import { apiRequest } from "./queryClient";

// AI Chat Assistant
export async function sendChatMessage(message: string, conversationHistory: any[] = []) {
  const response = await fetch('http://localhost:5000/ask-doctor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: message,
      conversation_history: conversationHistory
    })
  });
  return response.json();
}

// Quiz Generator
export async function generateQuiz(subject: string, topic: string, difficulty: string, numQuestions: number) {
  const response = await fetch('http://localhost:5000/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      query: `I am preparing for NEET PG and want questions on ${topic} in ${subject} at ${difficulty} difficulty level` 
    })
  });

  const data = await response.json();
  return {
    analysis: data.analysis,
    questions: data.questions.map((q: any, index: number) => ({
      question: q,
      options: q.options || {},
      correctAnswer: q.correct_answer || "",
      explanation: q.explanation || ""
    }))
  };
}

// Submit Quiz Answers
export async function evaluateQuizAnswers(conversationHistory: any[], answers: any) {
  const response = await fetch('http://localhost:5000/evaluate-answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_history: conversationHistory,
      answers
    })
  });
  return response.json();
}


export async function generateCase(specialty: string, difficulty: string) {
  const response = await fetch('/api/case/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ specialty, difficulty }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate case');
  }

  return response.json();
}

// Diagnosis Tool
export async function getDiagnosis(symptoms: string) {
  const response = await apiRequest("POST", "/api/diagnosis", { symptoms });
  return await response.json();
}

// Submit Quiz Attempt
export async function submitQuizAttempt(
  subject: string, 
  topic: string, 
  difficulty: string, 
  score: number, 
  totalQuestions: number, 
  timeTaken: number
) {
  const response = await apiRequest("POST", "/api/quiz/attempt", {
    subject,
    topic,
    difficulty,
    score,
    totalQuestions,
    timeTaken
  });
  return await response.json();
}

// Memory Booster
export async function generateMnemonic(topic: string) {
  const response = await apiRequest("POST", "/api/mnemonic", { topic });
  return await response.json();
}

// Case Generator
export async function generateCaseStudy(speciality: string, difficulty: string) {
  const response = await apiRequest("POST", "/api/case", { speciality, difficulty });
  return await response.json();
}

// Drug Information
export async function getDrugInformation(name: string) {
  const response = await apiRequest("POST", "/api/drug", { name });
  return await response.json();
}

// Study Planner
export async function createStudyPlan(goalExam: string, timeLeft: number, subjects: string[]) {
  const response = await apiRequest("POST", "/api/study-plan", { 
    goalExam, timeLeft, subjects 
  });
  return await response.json();
}

// Notes Maker
export async function generateNotes(topic: string, subject: string) {
  const response = await apiRequest("POST", "/api/notes", { topic, subject });
  return await response.json();
}

// Record Study Session
export async function recordStudySession(subject: string, duration: number) {
  const response = await apiRequest("POST", "/api/study-session", { 
    subject, duration 
  });
  return await response.json();
}