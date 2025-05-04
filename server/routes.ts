import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

const router = express.Router();
import { 
  getAiChatResponse, 
  generateDiagnosis, 
  generateQuiz,
  generateMnemonic,
  generateCaseStudy,
  getDrugInformation,
  generateStudyPlan,
  generateNotes
} from "./ai-service";

// Authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Notes API endpoints
router.post('/api/notes/generate', authenticate, async (req, res) => {
  try {
    const { topic, noteStyle, language } = req.body;
    if (!topic || !noteStyle || !language) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    const response = await generateNotes(topic, noteStyle, language);
    res.json({ text: response.text, relatedTopics: [] });
  } catch (error) {
    console.error("Notes generation error:", error);
    res.status(500).json({ message: "Failed to generate notes" });
  }
});

router.post('/api/notes/save', authenticate, async (req, res) => {
  try {
    const { topic, content, style, language } = req.body;
    const note = await storage.createNote({
      userId: req.user.id,
      topic,
      content,
      style,
      language
    });
    res.json({ note });
  } catch (error) {
    res.status(500).json({ message: "Failed to save note" });
  }
});

router.get('/api/notes/history', authenticate, async (req, res) => {
  try {
    const notes = await storage.getNotesByUserId(req.user.id);
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

router.delete('/api/notes/:id', authenticate, async (req, res) => {
  try {
    await storage.deleteNote(req.params.id, req.user.id);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete note" });
  }
});

// News routes
router.get('/api/news', authenticate, async (req, res) => {
  try {
    const { category, sort } = req.query;
    const news = await db.query.newsItems.findMany({
      where: category ? { category: category as string } : undefined,
      orderBy: sort === 'popular' ? { views: 'desc' } : { publishedAt: 'desc' }
    });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

router.post('/api/news/bookmark', authenticate, async (req, res) => {
  try {
    const { newsId } = req.body;
    await db.insert(bookmarkedNews).values({
      userId: req.user.id,
      newsId,
      createdAt: new Date()
    });
    res.json({ message: "News bookmarked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to bookmark news" });
  }
});

router.get('/api/news/bookmarked', authenticate, async (req, res) => {
  try {
    const bookmarks = await db.query.bookmarkedNews.findMany({
      where: { userId: req.user.id },
      include: { news: true }
    });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookmarked news" });
  }
});


export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);
  app.use(router);

  // AI Chatbot
  app.post("/api/chat", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const response = await getAiChatResponse(prompt);

      // Update user token usage
      const user = req.user as Express.User;
      const newTokenUsage = user.tokenUsage + response.usage.totalTokens;
      await storage.updateUserTokenUsage(user.id, newTokenUsage);

      res.json({
        message: response.text,
        tokenUsage: {
          current: newTokenUsage,
          limit: user.tokenLimit
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Diagnosis Tool
  app.post("/api/diagnosis", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { symptoms } = req.body;
      if (!symptoms) {
        return res.status(400).json({ message: "Symptoms are required" });
      }

      const response = await generateDiagnosis(symptoms);

      // Update user token usage
      const user = req.user as Express.User;
      const newTokenUsage = user.tokenUsage + response.usage.totalTokens;
      await storage.updateUserTokenUsage(user.id, newTokenUsage);

      res.json({
        diagnosis: response.text,
        tokenUsage: {
          current: newTokenUsage,
          limit: user.tokenLimit
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Quiz Generator
  app.post("/api/quiz", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { subject, topic, difficulty, numQuestions } = req.body;
      if (!subject || !topic || !difficulty || !numQuestions) {
        return res.status(400).json({ message: "All quiz parameters are required" });
      }

      const response = await generateQuiz(subject, topic, difficulty, numQuestions);

      // Update user token usage
      const user = req.user as Express.User;
      const newTokenUsage = user.tokenUsage + response.usage.totalTokens;
      await storage.updateUserTokenUsage(user.id, newTokenUsage);

      res.json({
        quiz: JSON.parse(response.text),
        tokenUsage: {
          current: newTokenUsage,
          limit: user.tokenLimit
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Save Quiz Attempt
  app.post("/api/quiz/attempt", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { subject, topic, difficulty, score, totalQuestions, timeTaken } = req.body;
      if (!subject || !topic || !difficulty || score === undefined || !totalQuestions || !timeTaken) {
        return res.status(400).json({ message: "All quiz attempt parameters are required" });
      }

      const user = req.user as Express.User;
      const quizAttempt = await storage.createQuizAttempt({
        userId: user.id,
        subject,
        topic,
        difficulty,
        score,
        totalQuestions,
        timeTaken
      });

      res.status(201).json(quizAttempt);
    } catch (error) {
      next(error);
    }
  });

  // Get Quiz History
  app.get("/api/quiz/history", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      const quizAttempts = await storage.getQuizAttemptsByUser(user.id);

      res.json(quizAttempts);
    } catch (error) {
      next(error);
    }
  });

  // Memory Booster (Mnemonics)
  app.post("/api/mnemonic", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const response = await generateMnemonic(topic);

      // Update user token usage
      const user = req.user as Express.User;
      const newTokenUsage = user.tokenUsage + response.usage.totalTokens;
      await storage.updateUserTokenUsage(user.id, newTokenUsage);

      res.json({
        mnemonic: response.text,
        tokenUsage: {
          current: newTokenUsage,
          limit: user.tokenLimit
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Case Generator
  app.post("/api/case/generate", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { specialty, difficulty } = req.body;
      if (!specialty || !difficulty) {
        return res.status(400).json({ message: "Specialty and difficulty are required" });
      }

      const response = await generateCaseStudy(specialty, difficulty);

      // Update user token usage
      const user = req.user as Express.User;
      const newTokenUsage = user.tokenUsage + response.usage.totalTokens;
      await storage.updateUserTokenUsage(user.id, newTokenUsage);

      // Parse and save the case study
      const caseContent = JSON.parse(response.text);
      const caseStudy = await storage.createCaseStudy({
        userId: user.id,
        title: caseContent.title || `${specialty} Case Study`,
        content: caseContent,
        specialty,
        difficulty
      });

      res.json({
        case: caseStudy,
        tokenUsage: {
          current: newTokenUsage,
          limit: user.tokenLimit
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get Case Studies
  app.get("/api/cases", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      const caseStudies = await storage.getCaseStudiesByUser(user.id);

      res.json(caseStudies);
    } catch (error) {
      next(error);
    }
  });

  // Drug Information
  app.post("/api/drug", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Drug name is required" });
      }

      const response = await getDrugInformation(name);

      // Update user token usage
      const user = req.user as Express.User;
      const newTokenUsage = user.tokenUsage + response.usage.totalTokens;
      await storage.updateUserTokenUsage(user.id, newTokenUsage);

      res.json({
        drugInfo: response.text,
        tokenUsage: {
          current: newTokenUsage,
          limit: user.tokenLimit
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Study Planner
  app.post("/api/study-plan", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { examName, totalDays, hoursPerDay, subjects, weakTopics, startDate } = req.body;
      if (!examName || !totalDays || !subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ message: "Exam name, total days, and subjects are required" });
      }

      const response = await generateStudyPlan(totalDays, hoursPerDay, subjects, weakTopics, startDate);

      // Update user token usage
      const user = req.user as Express.User;
      const newTokenUsage = user.tokenUsage + response.usage.totalTokens;
      await storage.updateUserTokenUsage(user.id, newTokenUsage);

      // Parse and save the study plan
      const planContent = JSON.parse(response.text);
      const studyPlan = await storage.createStudyPlan({
        userId: user.id,
        examName,
        totalDays,
        subjects,
        plan: planContent
      });

      res.json({
        studyPlan,
        tokenUsage: {
          current: newTokenUsage,
          limit: user.tokenLimit
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get Study Plan
  app.get("/api/study-plan", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      const studyPlan = await storage.getStudyPlanByUser(user.id);

      if (!studyPlan) {
        return res.status(404).json({ message: "No study plan found" });
      }

      res.json(studyPlan);
    } catch (error) {
      next(error);
    }
  });

  // Notes Maker
  app.post("/api/notes", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { topic, subject } = req.body;
      if (!topic || !subject) {
        return res.status(400).json({ message: "Topic and subject are required" });
      }

      const response = await generateNotes(topic);

      // Update user token usage
      const user = req.user as Express.User;
      const newTokenUsage = user.tokenUsage + response.usage.totalTokens;
      await storage.updateUserTokenUsage(user.id, newTokenUsage);

      // Save the notes
      const note = await storage.createNote({
        userId: user.id,
        title: `Notes on ${topic}`,
        content: response.text,
        subject,
        topic
      });

      res.json({
        note,
        tokenUsage: {
          current: newTokenUsage,
          limit: user.tokenLimit
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Get Notes
  app.get("/api/notes", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      const notes = await storage.getNotesByUser(user.id);

      res.json(notes);
    } catch (error) {
      next(error);
    }
  });

  // Medical News Feed
  app.get("/api/news", async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const news = await storage.getMedicalNews(limit, offset);

      res.json(news);
    } catch (error) {
      next(error);
    }
  });

  // Medical News by Category
  app.get("/api/news/category/:category", async (req, res, next) => {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const news = await storage.getMedicalNewsByCategory(category, limit);

      res.json(news);
    } catch (error) {
      next(error);
    }
  });

  // Active Announcements
  app.get("/api/announcements", async (req, res, next) => {
    try {
      const announcements = await storage.getActiveAnnouncements();

      res.json(announcements);
    } catch (error) {
      next(error);
    }
  });

  // Create Announcement (Admin only)
  app.post("/api/admin/announcements", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { title, content, type, isActive, priority, endDate } = req.body;
      if (!title || !content || !type) {
        return res.status(400).json({ message: "Title, content, and type are required" });
      }

      const announcement = await storage.createAnnouncement({
        title,
        content,
        type,
        isActive: isActive !== undefined ? isActive : true,
        priority: priority || 0,
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        addedBy: user.id
      });

      res.status(201).json(announcement);
    } catch (error) {
      next(error);
    }
  });

  // Create Medical News (Admin only)
  app.post("/api/admin/news", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { title, content, category, imageUrl, source } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ message: "Title, content, and category are required" });
      }

      const news = await storage.createMedicalNews({
        title,
        content,
        category,
        imageUrl,
        source,
        publishedAt: new Date(),
        addedBy: user.id
      });

      res.status(201).json(news);
    } catch (error) {
      next(error);
    }
  });

  // Create Coupon (Admin only)
  app.post("/api/admin/coupons", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { code, discountPercentage, maxUses, expiresAt } = req.body;
      if (!code || !discountPercentage || !maxUses) {
        return res.status(400).json({ message: "Code, discountPercentage, and maxUses are required" });
      }

      const coupon = await storage.createCoupon({
        code,
        discountPercentage,
        maxUses,
        currentUses: 0,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isActive: true
      });

      res.status(201).json(coupon);
    } catch (error) {
      next(error);
    }
  });

  // Check Coupon
  app.get("/api/coupons/:code", async (req, res, next) => {
    try {
      const { code } = req.params;

      const coupon = await storage.getCouponByCode(code);

      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found or inactive" });
      }

      res.json(coupon);
    } catch (error) {
      next(error);
    }
  });

  // Add Study Session
  app.post("/api/study-session", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { subject, duration } = req.body;
      if (!subject || duration === undefined) {
        return res.status(400).json({ message: "Subject and duration are required" });
      }

      const user = req.user as Express.User;
      const studySession = await storage.createStudySession({
        userId: user.id,
        subject,
        duration,
        date: new Date()
      });

      res.status(201).json(studySession);
    } catch (error) {
      next(error);
    }
  });

  // Get Study Sessions
  app.get("/api/study-sessions", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      const studySessions = await storage.getStudySessionsByUser(user.id);

      res.json(studySessions);
    } catch (error) {
      next(error);
    }
  });

  // Get Study Time This Week
  app.get("/api/study-time", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;
      const studyTimeMinutes = await storage.getStudyTimeByUserThisWeek(user.id);

      res.json({
        minutes: studyTimeMinutes,
        hours: Math.round(studyTimeMinutes / 60 * 10) / 10 // Round to 1 decimal place
      });
    } catch (error) {
      next(error);
    }
  });

  // Dashboard Data
  app.get("/api/dashboard", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as Express.User;

      // Get study time
      const studyTimeMinutes = await storage.getStudyTimeByUserThisWeek(user.id);
      const studyTimeHours = Math.round(studyTimeMinutes / 60 * 10) / 10;

      // Get recent quiz attempts
      const recentQuizAttempts = await storage.getRecentQuizAttempts(user.id, 5);

      // Calculate average quiz score
      let quizAverage = 0;
      if (recentQuizAttempts.length > 0) {
        const totalScore = recentQuizAttempts.reduce((sum, attempt) => {
          return sum + (attempt.score / attempt.totalQuestions * 100);
        }, 0);
        quizAverage = Math.round(totalScore / recentQuizAttempts.length);
      }

      // Get recent notes
      const recentNotes = await storage.getRecentNotes(user.id, 3);

      // Get announcements
      const announcements = await storage.getActiveAnnouncements();

      // Get news
      const news = await storage.getMedicalNews(3, 0);

      // Get study plan
      const studyPlan = await storage.getStudyPlanByUser(user.id);

      res.json({
        studyTime: {
          minutes: studyTimeMinutes,
          hours: studyTimeHours
        },
        quizPerformance: {
          average: quizAverage,
          attempts: recentQuizAttempts
        },
        recentActivities: [
          ...recentQuizAttempts.map(q => ({
            type: 'quiz',
            title: `Quiz: ${q.subject} - ${q.topic}`,
            score: q.score,
            totalQuestions: q.totalQuestions,
            date: q.completedAt
          })),
          ...recentNotes.map(n => ({
            type: 'note',
            title: n.title,
            subject: n.subject,
            date: n.createdAt
          }))
        ],
        tokenUsage: {
          current: user.tokenUsage,
          limit: user.tokenLimit,
          percentUsed: Math.round((user.tokenUsage / user.tokenLimit) * 100)
        },
        announcements,
        news,
        studyPlan
      });
    } catch (error) {
      next(error);
    }
  });

  // Admin Token Management
  app.post("/api/admin/users/:userId/tokens", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { tokenLimit } = req.body;
      const { userId } = req.params;

      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(parseInt(userId), {
        ...user,
        tokenLimit: parseInt(tokenLimit)
      });

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Admin Subscription Management
  app.post("/api/admin/users/:userId/subscription", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { subscriptionStatus } = req.body;
      const { userId } = req.params;

      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(parseInt(userId), {
        ...user,
        subscriptionStatus
      });

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Admin Get Users
  app.get("/api/admin/users", authenticate, async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}