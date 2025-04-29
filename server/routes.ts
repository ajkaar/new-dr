import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  createChatCompletion,
  generateQuizQuestions,
  generateMnemonic,
  generateClinicalCase,
  getDrugInformation,
  generateStudyPlan,
  generateNotes,
  diagnosisAssistant
} from "./openai";
import { insertChatHistorySchema, insertChatMessageSchema, insertStudyPlanSchema, insertNoteSchema, insertStudyProgressSchema, insertQuizAttemptSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication and get auth middlewares
  const { adminOnly, authOnly } = setupAuth(app);

  // Error handler for zod validation errors
  const handleZodError = (error: any, res: any) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: fromZodError(error).message,
      });
    }
    throw error;
  };

  // Medical News endpoints
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getAllMedicalNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Error fetching news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const newsId = parseInt(req.params.id);
      const news = await storage.getMedicalNewsById(newsId);
      
      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }
      
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Error fetching news" });
    }
  });

  app.post("/api/news", adminOnly, async (req, res) => {
    try {
      const news = await storage.createMedicalNews({
        ...req.body,
        createdBy: req.user.id
      });
      res.status(201).json(news);
    } catch (error) {
      res.status(500).json({ message: "Error creating news" });
    }
  });

  app.put("/api/news/:id", adminOnly, async (req, res) => {
    try {
      const newsId = parseInt(req.params.id);
      const updatedNews = await storage.updateMedicalNews(newsId, req.body);
      
      if (!updatedNews) {
        return res.status(404).json({ message: "News not found" });
      }
      
      res.json(updatedNews);
    } catch (error) {
      res.status(500).json({ message: "Error updating news" });
    }
  });

  app.delete("/api/news/:id", adminOnly, async (req, res) => {
    try {
      const newsId = parseInt(req.params.id);
      const deleted = await storage.deleteMedicalNews(newsId);
      
      if (!deleted) {
        return res.status(404).json({ message: "News not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting news" });
    }
  });

  // Chat endpoints
  app.get("/api/chat", authOnly, async (req, res) => {
    try {
      const chats = await storage.getChatHistoryByUser(req.user.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chat history" });
    }
  });

  app.get("/api/chat/:id", authOnly, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChatHistoryById(chatId);
      
      if (!chat || chat.userId !== req.user.id) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      const messages = await storage.getChatMessagesByChatId(chatId);
      res.json({ ...chat, messages });
    } catch (error) {
      res.status(500).json({ message: "Error fetching chat" });
    }
  });

  app.post("/api/chat", authOnly, async (req, res) => {
    try {
      const chatData = insertChatHistorySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const chat = await storage.createChatHistory(chatData);
      res.status(201).json(chat);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Error creating chat" });
    }
  });

  app.post("/api/chat/:id/message", authOnly, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChatHistoryById(chatId);
      
      if (!chat || chat.userId !== req.user.id) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      // Check if the user has sufficient token balance
      if (req.user.tokenBalance <= 0 && !req.user.isSubscribed) {
        return res.status(403).json({ message: "Insufficient tokens. Please subscribe to continue." });
      }
      
      // Create user message
      const messageData = insertChatMessageSchema.parse({
        chatId,
        content: req.body.message,
        role: "user"
      });
      
      await storage.createChatMessage(messageData);
      
      // Get previous messages for context (limit to last 10)
      const previousMessages = await storage.getChatMessagesByChatId(chatId);
      const contextMessages = previousMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Get AI response
      const systemPrompt = "You are a helpful medical assistant for medical students, answering questions about medicine, clinical practice, and medical education. Base your answers on standard medical textbooks and current guidelines. Be concise, accurate, and educational.";
      const aiResponse = await createChatCompletion({
        messages: contextMessages,
        systemPrompt
      });
      
      // Create AI message
      const aiMessageData = insertChatMessageSchema.parse({
        chatId,
        content: aiResponse.text,
        role: "assistant"
      });
      
      const aiMessage = await storage.createChatMessage(aiMessageData);
      
      // Update tokens used and user's token balance
      await storage.updateChatHistory(chatId, {
        tokensUsed: chat.tokensUsed + aiResponse.tokensUsed
      });
      
      if (!req.user.isSubscribed) {
        await storage.updateUser(req.user.id, {
          tokenBalance: Math.max(0, req.user.tokenBalance - aiResponse.tokensUsed)
        });
      }
      
      res.json({
        message: aiMessage,
        tokensUsed: aiResponse.tokensUsed,
        remainingTokens: req.user.isSubscribed ? "Unlimited" : Math.max(0, req.user.tokenBalance - aiResponse.tokensUsed)
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Error processing message" });
    }
  });

  // Quiz generator endpoints
  app.post("/api/quiz/generate", authOnly, async (req, res) => {
    try {
      const { subject, topic, difficulty, count } = req.body;
      
      if (!subject || !topic || !difficulty || !count) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if the user has sufficient token balance
      if (req.user.tokenBalance <= 0 && !req.user.isSubscribed) {
        return res.status(403).json({ message: "Insufficient tokens. Please subscribe to continue." });
      }
      
      const result = await generateQuizQuestions(subject, topic, difficulty, count);
      
      // Update user's token balance if not subscribed
      if (!req.user.isSubscribed) {
        await storage.updateUser(req.user.id, {
          tokenBalance: Math.max(0, req.user.tokenBalance - result.tokensUsed)
        });
      }
      
      res.json({
        questions: result.questions,
        tokensUsed: result.tokensUsed,
        remainingTokens: req.user.isSubscribed ? "Unlimited" : Math.max(0, req.user.tokenBalance - result.tokensUsed)
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating quiz" });
    }
  });

  app.post("/api/quiz/submit", authOnly, async (req, res) => {
    try {
      const quizData = insertQuizAttemptSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const attempt = await storage.createQuizAttempt(quizData);
      
      // Update user's study progress
      const existingProgress = (await storage.getStudyProgressBySubject(req.user.id, attempt.subject))
        .find(p => p.topic === attempt.topic);
      
      const progressPercentage = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);
      
      if (existingProgress) {
        // Update existing progress - take the best score
        await storage.updateStudyProgress(existingProgress.id, {
          progress: Math.max(existingProgress.progress, progressPercentage)
        });
      } else {
        // Create new progress entry
        await storage.createStudyProgress({
          userId: req.user.id,
          subject: attempt.subject,
          topic: attempt.topic,
          progress: progressPercentage
        });
      }
      
      res.status(201).json(attempt);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Error submitting quiz" });
    }
  });

  app.get("/api/quiz/history", authOnly, async (req, res) => {
    try {
      const attempts = await storage.getQuizAttemptsByUser(req.user.id);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quiz history" });
    }
  });

  // Memory booster endpoint
  app.post("/api/memory-booster", authOnly, async (req, res) => {
    try {
      const { topic, complexity } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      // Check if the user has sufficient token balance
      if (req.user.tokenBalance <= 0 && !req.user.isSubscribed) {
        return res.status(403).json({ message: "Insufficient tokens. Please subscribe to continue." });
      }
      
      const result = await generateMnemonic(topic, complexity || "simple");
      
      // Update user's token balance if not subscribed
      if (!req.user.isSubscribed) {
        await storage.updateUser(req.user.id, {
          tokenBalance: Math.max(0, req.user.tokenBalance - result.tokensUsed)
        });
      }
      
      res.json({
        mnemonic: result.text,
        tokensUsed: result.tokensUsed,
        remainingTokens: req.user.isSubscribed ? "Unlimited" : Math.max(0, req.user.tokenBalance - result.tokensUsed)
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating memory aid" });
    }
  });

  // Case generator endpoint
  app.post("/api/case-generator", authOnly, async (req, res) => {
    try {
      const { specialty, complexity } = req.body;
      
      if (!specialty) {
        return res.status(400).json({ message: "Specialty is required" });
      }
      
      // Check if the user has sufficient token balance
      if (req.user.tokenBalance <= 0 && !req.user.isSubscribed) {
        return res.status(403).json({ message: "Insufficient tokens. Please subscribe to continue." });
      }
      
      const result = await generateClinicalCase(specialty, complexity || "moderate");
      
      // Update user's token balance if not subscribed
      if (!req.user.isSubscribed) {
        await storage.updateUser(req.user.id, {
          tokenBalance: Math.max(0, req.user.tokenBalance - result.tokensUsed)
        });
      }
      
      res.json({
        case: result.text,
        tokensUsed: result.tokensUsed,
        remainingTokens: req.user.isSubscribed ? "Unlimited" : Math.max(0, req.user.tokenBalance - result.tokensUsed)
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating clinical case" });
    }
  });

  // Drug assistant endpoint
  app.post("/api/drug-info", authOnly, async (req, res) => {
    try {
      const { drugName } = req.body;
      
      if (!drugName) {
        return res.status(400).json({ message: "Drug name is required" });
      }
      
      // Check if the user has sufficient token balance
      if (req.user.tokenBalance <= 0 && !req.user.isSubscribed) {
        return res.status(403).json({ message: "Insufficient tokens. Please subscribe to continue." });
      }
      
      const result = await getDrugInformation(drugName);
      
      // Update user's token balance if not subscribed
      if (!req.user.isSubscribed) {
        await storage.updateUser(req.user.id, {
          tokenBalance: Math.max(0, req.user.tokenBalance - result.tokensUsed)
        });
      }
      
      res.json({
        drugInfo: result.text,
        tokensUsed: result.tokensUsed,
        remainingTokens: req.user.isSubscribed ? "Unlimited" : Math.max(0, req.user.tokenBalance - result.tokensUsed)
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching drug information" });
    }
  });

  // Study planner endpoints
  app.post("/api/study-plan", authOnly, async (req, res) => {
    try {
      const planData = insertStudyPlanSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if the user has sufficient token balance
      if (req.user.tokenBalance <= 0 && !req.user.isSubscribed) {
        return res.status(403).json({ message: "Insufficient tokens. Please subscribe to continue." });
      }
      
      // Generate study plan with AI
      const result = await generateStudyPlan(
        planData.goalExam || "NEET PG", 
        planData.timeLeft || 90, 
        planData.subjects as string[]
      );
      
      // Update user's token balance if not subscribed
      if (!req.user.isSubscribed) {
        await storage.updateUser(req.user.id, {
          tokenBalance: Math.max(0, req.user.tokenBalance - result.tokensUsed)
        });
      }
      
      // Save the plan
      const existingPlan = await storage.getStudyPlanByUser(req.user.id);
      let plan;
      
      if (existingPlan) {
        plan = await storage.updateStudyPlan(existingPlan.id, {
          ...planData,
          planData: {
            ...planData.planData,
            aiGenerated: result.text
          }
        });
      } else {
        plan = await storage.createStudyPlan({
          ...planData,
          planData: {
            ...planData.planData,
            aiGenerated: result.text
          }
        });
      }
      
      res.status(201).json({
        plan,
        tokensUsed: result.tokensUsed,
        remainingTokens: req.user.isSubscribed ? "Unlimited" : Math.max(0, req.user.tokenBalance - result.tokensUsed)
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Error creating study plan" });
    }
  });

  app.get("/api/study-plan", authOnly, async (req, res) => {
    try {
      const plan = await storage.getStudyPlanByUser(req.user.id);
      
      if (!plan) {
        return res.status(404).json({ message: "Study plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error fetching study plan" });
    }
  });

  // Notes endpoints
  app.post("/api/notes/generate", authOnly, async (req, res) => {
    try {
      const { topic, detail } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      // Check if the user has sufficient token balance
      if (req.user.tokenBalance <= 0 && !req.user.isSubscribed) {
        return res.status(403).json({ message: "Insufficient tokens. Please subscribe to continue." });
      }
      
      const result = await generateNotes(topic, detail || "concise");
      
      // Update user's token balance if not subscribed
      if (!req.user.isSubscribed) {
        await storage.updateUser(req.user.id, {
          tokenBalance: Math.max(0, req.user.tokenBalance - result.tokensUsed)
        });
      }
      
      res.json({
        notes: result.text,
        tokensUsed: result.tokensUsed,
        remainingTokens: req.user.isSubscribed ? "Unlimited" : Math.max(0, req.user.tokenBalance - result.tokensUsed)
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating notes" });
    }
  });

  app.post("/api/notes", authOnly, async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Error creating note" });
    }
  });

  app.get("/api/notes", authOnly, async (req, res) => {
    try {
      const notes = await storage.getNotesByUser(req.user.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notes" });
    }
  });

  app.get("/api/notes/:id", authOnly, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note || note.userId !== req.user.id) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Error fetching note" });
    }
  });

  app.put("/api/notes/:id", authOnly, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note || note.userId !== req.user.id) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      const updatedNote = await storage.updateNote(noteId, req.body);
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ message: "Error updating note" });
    }
  });

  app.delete("/api/notes/:id", authOnly, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note || note.userId !== req.user.id) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      await storage.deleteNote(noteId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting note" });
    }
  });

  // Diagnosis assistant endpoint
  app.post("/api/diagnosis", authOnly, async (req, res) => {
    try {
      const { patientInfo, symptoms, clinicalFindings } = req.body;
      
      if (!symptoms) {
        return res.status(400).json({ message: "Symptoms are required" });
      }
      
      // Check if the user has sufficient token balance
      if (req.user.tokenBalance <= 0 && !req.user.isSubscribed) {
        return res.status(403).json({ message: "Insufficient tokens. Please subscribe to continue." });
      }
      
      const result = await diagnosisAssistant(patientInfo, symptoms, clinicalFindings || "");
      
      // Update user's token balance if not subscribed
      if (!req.user.isSubscribed) {
        await storage.updateUser(req.user.id, {
          tokenBalance: Math.max(0, req.user.tokenBalance - result.tokensUsed)
        });
      }
      
      res.json({
        diagnosis: result.text,
        tokensUsed: result.tokensUsed,
        remainingTokens: req.user.isSubscribed ? "Unlimited" : Math.max(0, req.user.tokenBalance - result.tokensUsed)
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating diagnosis" });
    }
  });

  // Subscription endpoint
  app.post("/api/subscribe", authOnly, async (req, res) => {
    try {
      // In a real app, this would involve payment processing
      // For now, we'll just update the user's subscription status
      
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 12); // 1 year subscription
      
      const updatedUser = await storage.updateUser(req.user.id, {
        isSubscribed: true,
        subscriptionExpiry: subscriptionEndDate
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error processing subscription" });
    }
  });

  // Study progress endpoints
  app.get("/api/progress", authOnly, async (req, res) => {
    try {
      const progress = await storage.getStudyProgressByUser(req.user.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Error fetching progress" });
    }
  });

  app.post("/api/progress", authOnly, async (req, res) => {
    try {
      const progressData = insertStudyProgressSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const progress = await storage.createStudyProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Error creating progress entry" });
    }
  });

  // Admin coupon management endpoints
  app.get("/api/coupons", adminOnly, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Error fetching coupons" });
    }
  });

  app.post("/api/coupons", adminOnly, async (req, res) => {
    try {
      const coupon = await storage.createCoupon({
        ...req.body,
        createdBy: req.user.id
      });
      res.status(201).json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Error creating coupon" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
