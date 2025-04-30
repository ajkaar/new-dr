import OpenAI from "openai";
import { Request, Response } from "express";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY || "";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Premium tokens count is 20,000
const FREE_TOKENS_LIMIT = 20000;

// Token count approximation (rough estimate)
function estimateTokenCount(text: string): number {
  // Approximation: 1 token ~= 4 characters
  return Math.ceil(text.length / 4);
}

// Check if user has enough tokens
async function hasEnoughTokens(userId: number, estimatedTokens: number): Promise<boolean> {
  const user = await storage.getUser(userId);
  
  if (!user) {
    return false;
  }
  
  // If premium subscription, always allow
  if (user.subscription === 'premium') {
    return true;
  }
  
  // For free users, check token limit
  return (user.tokensUsed + estimatedTokens) <= FREE_TOKENS_LIMIT;
}

// Update user token usage
async function updateTokenUsage(userId: number, tokensUsed: number): Promise<void> {
  await storage.updateUserTokens(userId, tokensUsed);
}

// Track the activity
async function trackUserActivity(userId: number, activityType: string, description: string, metadata: any = {}): Promise<void> {
  await storage.createUserActivity({
    userId,
    activityType,
    description,
    metadata
  });
}

// AI Chatbot
export async function handleChatRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    const estimatedInputTokens = estimateTokenCount(message);
    
    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(req.user.id, estimatedInputTokens);
    
    if (!hasTokens) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade to premium plan.",
        tokenLimit: FREE_TOKENS_LIMIT,
        tokensUsed: req.user.tokensUsed
      });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical assistant for DRNXT Learning, answering questions for medical students preparing for NEET PG in India. Provide accurate, concise information with references to standard medical textbooks when appropriate."
        },
        { role: "user", content: message }
      ]
    });
    
    const aiResponse = response.choices[0].message.content;
    const totalTokensUsed = response.usage?.total_tokens || estimatedInputTokens + estimateTokenCount(aiResponse || "");
    
    // Track token usage
    await updateTokenUsage(req.user.id, totalTokensUsed);
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "chat", 
      "Used AI Chatbot", 
      { 
        message: message.substring(0, 100), 
        tokensUsed: totalTokensUsed 
      }
    );
    
    return res.json({
      response: aiResponse,
      tokensUsed: totalTokensUsed,
      remainingTokens: FREE_TOKENS_LIMIT - (req.user.tokensUsed + totalTokensUsed)
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ message: "Failed to get response from AI" });
  }
}

// Diagnosis Tool
export async function handleDiagnosisRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: "Symptoms array is required" });
    }
    
    const symptomsText = symptoms.join(", ");
    const prompt = `Based on these symptoms: ${symptomsText}, provide a differential diagnosis with brief explanations for each possibility. Reference Harrison's Principles of Internal Medicine or other standard textbooks where appropriate.`;
    
    const estimatedInputTokens = estimateTokenCount(prompt);
    
    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(req.user.id, estimatedInputTokens);
    
    if (!hasTokens) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade to premium plan.",
        tokenLimit: FREE_TOKENS_LIMIT,
        tokensUsed: req.user.tokensUsed
      });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a diagnostic assistant for medical students. Provide differential diagnoses based on symptoms, with brief explanations and references to standard medical textbooks. Format your response with clear headers and bullet points."
        },
        { role: "user", content: prompt }
      ]
    });
    
    const aiResponse = response.choices[0].message.content;
    const totalTokensUsed = response.usage?.total_tokens || estimatedInputTokens + estimateTokenCount(aiResponse || "");
    
    // Track token usage
    await updateTokenUsage(req.user.id, totalTokensUsed);
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "diagnosis", 
      "Used Diagnosis Tool", 
      { 
        symptoms: symptomsText, 
        tokensUsed: totalTokensUsed 
      }
    );
    
    return res.json({
      diagnosis: aiResponse,
      tokensUsed: totalTokensUsed,
      remainingTokens: FREE_TOKENS_LIMIT - (req.user.tokensUsed + totalTokensUsed)
    });
  } catch (error) {
    console.error("Diagnosis API error:", error);
    return res.status(500).json({ message: "Failed to get diagnosis from AI" });
  }
}

// Quiz Generator
export async function handleQuizGenerationRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { subject, topic, difficulty, count = 5 } = req.body;
    
    if (!subject || !topic || !difficulty) {
      return res.status(400).json({ message: "Subject, topic, and difficulty are required" });
    }
    
    // Limit count to reasonable range
    const questionsCount = Math.min(Math.max(1, count), 20);
    
    const prompt = `Generate ${questionsCount} multiple-choice questions (MCQs) about ${topic} in ${subject} at ${difficulty} difficulty level. Each question should have four options (A, B, C, D) with one correct answer. Include an explanation for the correct answer and reference a standard medical textbook. Format as JSON with these fields: "questions" (array of question objects with: "question", "options" (array), "correctAnswer", "explanation", "reference").`;
    
    const estimatedInputTokens = estimateTokenCount(prompt);
    
    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(req.user.id, estimatedInputTokens);
    
    if (!hasTokens) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade to premium plan.",
        tokenLimit: FREE_TOKENS_LIMIT,
        tokensUsed: req.user.tokensUsed
      });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical education quiz generator. Create high-quality multiple-choice questions for medical students based on standard textbooks."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const aiResponse = response.choices[0].message.content;
    const totalTokensUsed = response.usage?.total_tokens || estimatedInputTokens + estimateTokenCount(aiResponse || "");
    
    // Parse the response
    const quizData = JSON.parse(aiResponse || "{}");
    
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid quiz data format");
    }
    
    // Create the quiz in database
    const quiz = await storage.createQuiz({
      userId: req.user.id,
      subject,
      topic,
      difficulty,
      questionsCount: quizData.questions.length
    });
    
    // Store each question
    for (const questionData of quizData.questions) {
      await storage.createQuestion({
        quizId: quiz.id,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        reference: questionData.reference
      });
    }
    
    // Track token usage
    await updateTokenUsage(req.user.id, totalTokensUsed);
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "quiz", 
      `Generated ${difficulty} quiz on ${topic}`, 
      { 
        subject, 
        topic, 
        difficulty, 
        questionsCount, 
        tokensUsed: totalTokensUsed 
      }
    );
    
    return res.json({
      quiz: {
        id: quiz.id,
        subject,
        topic,
        difficulty,
        questionsCount: quizData.questions.length
      },
      questions: quizData.questions,
      tokensUsed: totalTokensUsed,
      remainingTokens: FREE_TOKENS_LIMIT - (req.user.tokensUsed + totalTokensUsed)
    });
  } catch (error) {
    console.error("Quiz Generator API error:", error);
    return res.status(500).json({ message: "Failed to generate quiz" });
  }
}

// Memory Booster
export async function handleMemoryBoosterRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }
    
    const prompt = `Create memory boosters for the medical topic: "${topic}". Include mnemonics, analogies, and simplified explanations that make this topic easy to understand and remember. Format as JSON with: "mnemonics" (array), "analogies" (array), "simplifiedExplanation" (string), and "visualCues" (array of descriptions).`;
    
    const estimatedInputTokens = estimateTokenCount(prompt);
    
    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(req.user.id, estimatedInputTokens);
    
    if (!hasTokens) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade to premium plan.",
        tokenLimit: FREE_TOKENS_LIMIT,
        tokensUsed: req.user.tokensUsed
      });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a memory expert specializing in medical education. Create effective mnemonics, analogies, and memory aids for medical students."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const aiResponse = response.choices[0].message.content;
    const totalTokensUsed = response.usage?.total_tokens || estimatedInputTokens + estimateTokenCount(aiResponse || "");
    
    // Track token usage
    await updateTokenUsage(req.user.id, totalTokensUsed);
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "memory_booster", 
      `Used Memory Booster for "${topic}"`, 
      { 
        topic, 
        tokensUsed: totalTokensUsed 
      }
    );
    
    // Parse the response
    const memoryData = JSON.parse(aiResponse || "{}");
    
    return res.json({
      ...memoryData,
      tokensUsed: totalTokensUsed,
      remainingTokens: FREE_TOKENS_LIMIT - (req.user.tokensUsed + totalTokensUsed)
    });
  } catch (error) {
    console.error("Memory Booster API error:", error);
    return res.status(500).json({ message: "Failed to generate memory aids" });
  }
}

// Case Generator
export async function handleCaseGeneratorRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { specialty } = req.body;
    
    const specialtyPrompt = specialty ? ` related to ${specialty}` : "";
    
    const prompt = `Generate a realistic clinical case study${specialtyPrompt} that would be relevant for Indian medical students. Include patient history, examination findings, relevant investigations, and questions to think about. Format as JSON with: "title", "patientProfile", "history", "examination", "investigations", "differentialDiagnosis", "questions" (array).`;
    
    const estimatedInputTokens = estimateTokenCount(prompt);
    
    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(req.user.id, estimatedInputTokens);
    
    if (!hasTokens) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade to premium plan.",
        tokenLimit: FREE_TOKENS_LIMIT,
        tokensUsed: req.user.tokensUsed
      });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical educator creating realistic clinical case studies for MBBS and PG medical students in India. Create detailed, realistic cases that test clinical reasoning."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const aiResponse = response.choices[0].message.content;
    const totalTokensUsed = response.usage?.total_tokens || estimatedInputTokens + estimateTokenCount(aiResponse || "");
    
    // Parse the response
    const caseData = JSON.parse(aiResponse || "{}");
    
    // Create case in database
    const caseRecord = await storage.createCase({
      userId: req.user.id,
      title: caseData.title,
      description: JSON.stringify(caseData)
    });
    
    // Track token usage
    await updateTokenUsage(req.user.id, totalTokensUsed);
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "case_generator", 
      `Generated case: "${caseData.title}"`, 
      { 
        specialty: specialty || "General", 
        tokensUsed: totalTokensUsed 
      }
    );
    
    return res.json({
      case: {
        id: caseRecord.id,
        ...caseData
      },
      tokensUsed: totalTokensUsed,
      remainingTokens: FREE_TOKENS_LIMIT - (req.user.tokensUsed + totalTokensUsed)
    });
  } catch (error) {
    console.error("Case Generator API error:", error);
    return res.status(500).json({ message: "Failed to generate case study" });
  }
}

// Drug Assistant
export async function handleDrugInfoRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { drugName } = req.body;
    
    if (!drugName) {
      return res.status(400).json({ message: "Drug name is required" });
    }
    
    const prompt = `Provide comprehensive information about the drug "${drugName}". Include drug class, mechanism of action, indications, contraindications, side effects, dosage, and important notes for medical students. Format as JSON with appropriate fields.`;
    
    const estimatedInputTokens = estimateTokenCount(prompt);
    
    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(req.user.id, estimatedInputTokens);
    
    if (!hasTokens) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade to premium plan.",
        tokenLimit: FREE_TOKENS_LIMIT,
        tokensUsed: req.user.tokensUsed
      });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a pharmacology expert providing accurate drug information for medical students. Focus on clinically relevant details and learning points."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const aiResponse = response.choices[0].message.content;
    const totalTokensUsed = response.usage?.total_tokens || estimatedInputTokens + estimateTokenCount(aiResponse || "");
    
    // Track token usage
    await updateTokenUsage(req.user.id, totalTokensUsed);
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "drug_info", 
      `Looked up information on "${drugName}"`, 
      { 
        drugName, 
        tokensUsed: totalTokensUsed 
      }
    );
    
    // Parse the response
    const drugData = JSON.parse(aiResponse || "{}");
    
    return res.json({
      ...drugData,
      tokensUsed: totalTokensUsed,
      remainingTokens: FREE_TOKENS_LIMIT - (req.user.tokensUsed + totalTokensUsed)
    });
  } catch (error) {
    console.error("Drug Info API error:", error);
    return res.status(500).json({ message: "Failed to get drug information" });
  }
}

// Study Planner
export async function handleStudyPlanRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { examName, targetDate, subjects } = req.body;
    
    if (!examName || !targetDate || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Exam name, target date, and subjects array are required" });
    }
    
    const prompt = `Create a detailed study plan for a medical student preparing for ${examName} with exam date on ${targetDate}. The student needs to cover these subjects: ${subjects.join(", ")}. Provide a daily and weekly schedule, prioritizing topics based on importance and weightage. Format as JSON with: "overview", "weeklySchedule" (array of weeks), "dailySchedule" (array of days), "resources" (recommended resources).`;
    
    const estimatedInputTokens = estimateTokenCount(prompt);
    
    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(req.user.id, estimatedInputTokens);
    
    if (!hasTokens) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade to premium plan.",
        tokenLimit: FREE_TOKENS_LIMIT,
        tokensUsed: req.user.tokensUsed
      });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in medical education and exam preparation. Create detailed, realistic study plans that help medical students prepare efficiently for exams."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const aiResponse = response.choices[0].message.content;
    const totalTokensUsed = response.usage?.total_tokens || estimatedInputTokens + estimateTokenCount(aiResponse || "");
    
    // Parse the response
    const planData = JSON.parse(aiResponse || "{}");
    
    // Create study plan in database
    const studyPlan = await storage.createStudyPlan({
      userId: req.user.id,
      examName,
      targetDate: new Date(targetDate),
      subjects: subjects,
      planDetails: planData
    });
    
    // Track token usage
    await updateTokenUsage(req.user.id, totalTokensUsed);
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "study_plan", 
      `Created study plan for ${examName}`, 
      { 
        examName,
        targetDate,
        subjects,
        tokensUsed: totalTokensUsed 
      }
    );
    
    return res.json({
      plan: {
        id: studyPlan.id,
        examName,
        targetDate,
        ...planData
      },
      tokensUsed: totalTokensUsed,
      remainingTokens: FREE_TOKENS_LIMIT - (req.user.tokensUsed + totalTokensUsed)
    });
  } catch (error) {
    console.error("Study Plan API error:", error);
    return res.status(500).json({ message: "Failed to generate study plan" });
  }
}

// Notes Maker
export async function handleNotesMakerRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { topic, subject } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }
    
    const prompt = `Create comprehensive medical study notes on "${topic}"${subject ? ` in ${subject}` : ""}. Include key points, definitions, pathophysiology (if applicable), clinical features, diagnosis, treatment, and important exam points. Add mnemonics where helpful. Format for easy reading with headers, bullets, and organized sections.`;
    
    const estimatedInputTokens = estimateTokenCount(prompt);
    
    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(req.user.id, estimatedInputTokens);
    
    if (!hasTokens) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade to premium plan.",
        tokenLimit: FREE_TOKENS_LIMIT,
        tokensUsed: req.user.tokensUsed
      });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical educator creating concise but comprehensive notes for medical students. Focus on clarity, organization, and highlighting key exam points."
        },
        { role: "user", content: prompt }
      ]
    });
    
    const aiResponse = response.choices[0].message.content;
    const totalTokensUsed = response.usage?.total_tokens || estimatedInputTokens + estimateTokenCount(aiResponse || "");
    
    // Create note in database
    const noteTitle = `Notes on ${topic}${subject ? ` (${subject})` : ""}`;
    const note = await storage.createNote({
      userId: req.user.id,
      title: noteTitle,
      content: aiResponse || "",
      topic: topic
    });
    
    // Track token usage
    await updateTokenUsage(req.user.id, totalTokensUsed);
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "notes", 
      `Created notes on "${topic}"`, 
      { 
        topic,
        subject: subject || "General",
        tokensUsed: totalTokensUsed 
      }
    );
    
    return res.json({
      note: {
        id: note.id,
        title: noteTitle,
        content: aiResponse,
        topic
      },
      tokensUsed: totalTokensUsed,
      remainingTokens: FREE_TOKENS_LIMIT - (req.user.tokensUsed + totalTokensUsed)
    });
  } catch (error) {
    console.error("Notes Maker API error:", error);
    return res.status(500).json({ message: "Failed to generate notes" });
  }
}

// Voice-to-Text API
export async function handleVoiceToTextRequest(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ message: "Audio data is required" });
    }
    
    // For voice recognition, we would normally use OpenAI's Whisper API
    // Since we're working with a text-based API for this implementation,
    // we'll mock the response with a simple acknowledgment
    
    return res.json({
      text: "Voice-to-text functionality would use OpenAI's Whisper API in a full implementation.",
      message: "Voice input processed successfully"
    });
  } catch (error) {
    console.error("Voice-to-Text API error:", error);
    return res.status(500).json({ message: "Failed to process voice input" });
  }
}

// Subscription API
export async function updateSubscription(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  try {
    const { subscriptionType } = req.body;
    
    if (!subscriptionType || !['free', 'premium'].includes(subscriptionType)) {
      return res.status(400).json({ message: "Valid subscription type is required" });
    }
    
    // Update user subscription
    await storage.updateUserSubscription(req.user.id, subscriptionType);
    
    // Get updated user data
    const updatedUser = await storage.getUser(req.user.id);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Track activity
    await trackUserActivity(
      req.user.id, 
      "subscription", 
      `Updated subscription to ${subscriptionType}`, 
      { subscriptionType }
    );
    
    // Return updated user without password
    const { password, ...userWithoutPassword } = updatedUser;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error("Subscription API error:", error);
    return res.status(500).json({ message: "Failed to update subscription" });
  }
}
