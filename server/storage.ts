import {
  users, User, InsertUser, studyProgress, StudyProgress, InsertStudyProgress,
  quizAttempts, QuizAttempt, InsertQuizAttempt, medicalNews, MedicalNews, InsertMedicalNews,
  studyPlans, StudyPlan, InsertStudyPlan, chatHistory, ChatHistory, InsertChatHistory,
  chatMessages, ChatMessage, InsertChatMessage, notes, Note, InsertNote,
  coupons, Coupon, InsertCoupon
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Study Progress
  getStudyProgressByUser(userId: number): Promise<StudyProgress[]>;
  getStudyProgressBySubject(userId: number, subject: string): Promise<StudyProgress[]>;
  createStudyProgress(progress: InsertStudyProgress): Promise<StudyProgress>;
  updateStudyProgress(id: number, progress: Partial<StudyProgress>): Promise<StudyProgress | undefined>;
  
  // Quiz Attempts
  getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]>;
  getQuizAttemptsBySubject(userId: number, subject: string): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  
  // Medical News
  getAllMedicalNews(): Promise<MedicalNews[]>;
  getMedicalNewsById(id: number): Promise<MedicalNews | undefined>;
  createMedicalNews(news: InsertMedicalNews): Promise<MedicalNews>;
  updateMedicalNews(id: number, news: Partial<MedicalNews>): Promise<MedicalNews | undefined>;
  deleteMedicalNews(id: number): Promise<boolean>;
  
  // Study Plans
  getStudyPlanByUser(userId: number): Promise<StudyPlan | undefined>;
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  updateStudyPlan(id: number, plan: Partial<StudyPlan>): Promise<StudyPlan | undefined>;
  
  // Chat History
  getChatHistoryByUser(userId: number): Promise<ChatHistory[]>;
  getChatHistoryById(id: number): Promise<ChatHistory | undefined>;
  createChatHistory(chat: InsertChatHistory): Promise<ChatHistory>;
  updateChatHistory(id: number, chat: Partial<ChatHistory>): Promise<ChatHistory | undefined>;
  
  // Chat Messages
  getChatMessagesByChatId(chatId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Notes
  getNotesByUser(userId: number): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Coupons
  getAllCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, coupon: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private studyProgressMap: Map<number, StudyProgress>;
  private quizAttemptsMap: Map<number, QuizAttempt>;
  private medicalNewsMap: Map<number, MedicalNews>;
  private studyPlansMap: Map<number, StudyPlan>;
  private chatHistoryMap: Map<number, ChatHistory>;
  private chatMessagesMap: Map<number, ChatMessage>;
  private notesMap: Map<number, Note>;
  private couponsMap: Map<number, Coupon>;
  
  private currentUserId: number;
  private currentStudyProgressId: number;
  private currentQuizAttemptId: number;
  private currentMedicalNewsId: number;
  private currentStudyPlanId: number;
  private currentChatHistoryId: number;
  private currentChatMessageId: number;
  private currentNoteId: number;
  private currentCouponId: number;
  
  public sessionStore: session.SessionStore;

  constructor() {
    this.usersMap = new Map();
    this.studyProgressMap = new Map();
    this.quizAttemptsMap = new Map();
    this.medicalNewsMap = new Map();
    this.studyPlansMap = new Map();
    this.chatHistoryMap = new Map();
    this.chatMessagesMap = new Map();
    this.notesMap = new Map();
    this.couponsMap = new Map();
    
    this.currentUserId = 1;
    this.currentStudyProgressId = 1;
    this.currentQuizAttemptId = 1;
    this.currentMedicalNewsId = 1;
    this.currentStudyPlanId = 1;
    this.currentChatHistoryId = 1;
    this.currentChatMessageId = 1;
    this.currentNoteId = 1;
    this.currentCouponId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add some initial medical news
    this.createMedicalNews({
      title: "NEET PG 2023: New Exam Pattern Announced",
      content: "The National Board of Examinations has announced changes to the NEET PG exam pattern starting from 2023...",
      category: "Exam Updates",
      isImportant: true,
      createdBy: 1
    });
    
    this.createMedicalNews({
      title: "New Research: Breakthrough in Alzheimer's Treatment",
      content: "A groundbreaking study published in NEJM reveals promising results for a new drug targeting amyloid plaques...",
      category: "Research",
      isImportant: false,
      createdBy: 1
    });
    
    this.createMedicalNews({
      title: "Medical Council Updates Clinical Practice Guidelines",
      content: "The Medical Council of India has released updated clinical practice guidelines for several common conditions...",
      category: "Guidelines",
      isImportant: false,
      createdBy: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const newUser: User = { 
      ...user, 
      id,
      createdAt: now
    };
    this.usersMap.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }
  
  // Study Progress methods
  async getStudyProgressByUser(userId: number): Promise<StudyProgress[]> {
    return Array.from(this.studyProgressMap.values()).filter(
      (progress) => progress.userId === userId
    );
  }
  
  async getStudyProgressBySubject(userId: number, subject: string): Promise<StudyProgress[]> {
    return Array.from(this.studyProgressMap.values()).filter(
      (progress) => progress.userId === userId && progress.subject === subject
    );
  }
  
  async createStudyProgress(progress: InsertStudyProgress): Promise<StudyProgress> {
    const id = this.currentStudyProgressId++;
    const now = new Date();
    const newProgress: StudyProgress = {
      ...progress,
      id,
      lastStudied: now
    };
    this.studyProgressMap.set(id, newProgress);
    return newProgress;
  }
  
  async updateStudyProgress(id: number, progressData: Partial<StudyProgress>): Promise<StudyProgress | undefined> {
    const progress = this.studyProgressMap.get(id);
    if (!progress) return undefined;
    
    const now = new Date();
    const updatedProgress = { 
      ...progress, 
      ...progressData,
      lastStudied: now
    };
    this.studyProgressMap.set(id, updatedProgress);
    return updatedProgress;
  }
  
  // Quiz Attempts methods
  async getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttemptsMap.values())
      .filter(attempt => attempt.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getQuizAttemptsBySubject(userId: number, subject: string): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttemptsMap.values())
      .filter(attempt => attempt.userId === userId && attempt.subject === subject)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.currentQuizAttemptId++;
    const now = new Date();
    const newAttempt: QuizAttempt = {
      ...attempt,
      id,
      createdAt: now
    };
    this.quizAttemptsMap.set(id, newAttempt);
    return newAttempt;
  }
  
  // Medical News methods
  async getAllMedicalNews(): Promise<MedicalNews[]> {
    return Array.from(this.medicalNewsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getMedicalNewsById(id: number): Promise<MedicalNews | undefined> {
    return this.medicalNewsMap.get(id);
  }
  
  async createMedicalNews(news: InsertMedicalNews): Promise<MedicalNews> {
    const id = this.currentMedicalNewsId++;
    const now = new Date();
    const newNews: MedicalNews = {
      ...news,
      id,
      createdAt: now
    };
    this.medicalNewsMap.set(id, newNews);
    return newNews;
  }
  
  async updateMedicalNews(id: number, newsData: Partial<MedicalNews>): Promise<MedicalNews | undefined> {
    const news = this.medicalNewsMap.get(id);
    if (!news) return undefined;
    
    const updatedNews = { ...news, ...newsData };
    this.medicalNewsMap.set(id, updatedNews);
    return updatedNews;
  }
  
  async deleteMedicalNews(id: number): Promise<boolean> {
    return this.medicalNewsMap.delete(id);
  }
  
  // Study Plans methods
  async getStudyPlanByUser(userId: number): Promise<StudyPlan | undefined> {
    return Array.from(this.studyPlansMap.values()).find(
      (plan) => plan.userId === userId
    );
  }
  
  async createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan> {
    const id = this.currentStudyPlanId++;
    const now = new Date();
    const newPlan: StudyPlan = {
      ...plan,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.studyPlansMap.set(id, newPlan);
    return newPlan;
  }
  
  async updateStudyPlan(id: number, planData: Partial<StudyPlan>): Promise<StudyPlan | undefined> {
    const plan = this.studyPlansMap.get(id);
    if (!plan) return undefined;
    
    const now = new Date();
    const updatedPlan = { 
      ...plan, 
      ...planData,
      updatedAt: now
    };
    this.studyPlansMap.set(id, updatedPlan);
    return updatedPlan;
  }
  
  // Chat History methods
  async getChatHistoryByUser(userId: number): Promise<ChatHistory[]> {
    return Array.from(this.chatHistoryMap.values())
      .filter(chat => chat.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getChatHistoryById(id: number): Promise<ChatHistory | undefined> {
    return this.chatHistoryMap.get(id);
  }
  
  async createChatHistory(chat: InsertChatHistory): Promise<ChatHistory> {
    const id = this.currentChatHistoryId++;
    const now = new Date();
    const newChat: ChatHistory = {
      ...chat,
      id,
      createdAt: now
    };
    this.chatHistoryMap.set(id, newChat);
    return newChat;
  }
  
  async updateChatHistory(id: number, chatData: Partial<ChatHistory>): Promise<ChatHistory | undefined> {
    const chat = this.chatHistoryMap.get(id);
    if (!chat) return undefined;
    
    const updatedChat = { ...chat, ...chatData };
    this.chatHistoryMap.set(id, updatedChat);
    return updatedChat;
  }
  
  // Chat Messages methods
  async getChatMessagesByChatId(chatId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessagesMap.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const now = new Date();
    const newMessage: ChatMessage = {
      ...message,
      id,
      createdAt: now
    };
    this.chatMessagesMap.set(id, newMessage);
    return newMessage;
  }
  
  // Notes methods
  async getNotesByUser(userId: number): Promise<Note[]> {
    return Array.from(this.notesMap.values())
      .filter(note => note.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notesMap.get(id);
  }
  
  async createNote(note: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const now = new Date();
    const newNote: Note = {
      ...note,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.notesMap.set(id, newNote);
    return newNote;
  }
  
  async updateNote(id: number, noteData: Partial<Note>): Promise<Note | undefined> {
    const note = this.notesMap.get(id);
    if (!note) return undefined;
    
    const now = new Date();
    const updatedNote = { 
      ...note, 
      ...noteData,
      updatedAt: now
    };
    this.notesMap.set(id, updatedNote);
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    return this.notesMap.delete(id);
  }
  
  // Coupons methods
  async getAllCoupons(): Promise<Coupon[]> {
    return Array.from(this.couponsMap.values());
  }
  
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.couponsMap.values()).find(
      (coupon) => coupon.code === code
    );
  }
  
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const id = this.currentCouponId++;
    const now = new Date();
    const newCoupon: Coupon = {
      ...coupon,
      id,
      createdAt: now
    };
    this.couponsMap.set(id, newCoupon);
    return newCoupon;
  }
  
  async updateCoupon(id: number, couponData: Partial<Coupon>): Promise<Coupon | undefined> {
    const coupon = this.couponsMap.get(id);
    if (!coupon) return undefined;
    
    const updatedCoupon = { ...coupon, ...couponData };
    this.couponsMap.set(id, updatedCoupon);
    return updatedCoupon;
  }
  
  async deleteCoupon(id: number): Promise<boolean> {
    return this.couponsMap.delete(id);
  }
}

export const storage = new MemStorage();
