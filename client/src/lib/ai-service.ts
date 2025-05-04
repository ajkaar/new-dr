import { apiRequest } from "./queryClient";

// AI Chat Assistant
export async function sendChatMessage(message: string, conversationHistory: any[] = []) {
  const response = await fetch('/api/ask-doctor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      conversation_history: conversationHistory
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get response from AI');
  }

  const data = await response.json();
  return data;
}

// Quiz Generator
export async function generateQuiz(subject: string, topic: string, difficulty: string, numQuestions: number) {
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      subject,
      topic,
      difficulty,
      num_questions: numQuestions
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate quiz');
  }

  const data = await response.json();
  return data;
}

// Submit Quiz Answers
export async function evaluateQuizAnswers(conversationHistory: any[], answers: any) {
  const response = await fetch('/api/evaluate-answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_history: conversationHistory,
      answers
    })
  });

  if (!response.ok) {
    throw new Error('Failed to evaluate answers');
  }

  return response.json();
}

// Case Generator
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