import { 
  users, type User, type InsertUser,
  quizAttempts, type QuizAttempt, type InsertQuizAttempt,
  studySessions, type StudySession, type InsertStudySession,
  notes, type Note, type InsertNote,
  caseStudies, type CaseStudy, type InsertCaseStudy,
  medicalNews, type MedicalNews, type InsertMedicalNews,
  studyPlans, type StudyPlan, type InsertStudyPlan,
  announcements, type Announcement, type InsertAnnouncement,
  coupons, type Coupon, type InsertCoupon,
  userSettings, type UserSettings, type InsertUserSettings
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle, type Drizzle } from "drizzle-orm/postgres-js";
import { Pool } from "pg";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokenUsage(userId: number, tokenUsage: number): Promise<User | undefined>;
  updateUser(userId: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Quiz operations
  createQuizAttempt(quizAttempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]>;
  getRecentQuizAttempts(userId: number, limit: number): Promise<QuizAttempt[]>;

  // Study session operations
  createStudySession(studySession: InsertStudySession): Promise<StudySession>;
  getStudySessionsByUser(userId: number): Promise<StudySession[]>;
  getStudyTimeByUserThisWeek(userId: number): Promise<number>; // returns minutes

  // Notes operations
  createNote(note: InsertNote): Promise<Note>;
  getNotesByUser(userId: number): Promise<Note[]>;
  getRecentNotes(userId: number, limit: number): Promise<Note[]>;

  // Case studies operations
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  getCaseStudiesByUser(userId: number): Promise<CaseStudy[]>;

  // Medical news operations
  createMedicalNews(news: InsertMedicalNews): Promise<MedicalNews>;
  getMedicalNews(limit: number, offset: number): Promise<MedicalNews[]>;
  getMedicalNewsByCategory(category: string, limit: number): Promise<MedicalNews[]>;

  // Study plan operations
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  getStudyPlanByUser(userId: number): Promise<StudyPlan | undefined>;

  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getActiveAnnouncements(): Promise<Announcement[]>;

  // Coupon operations
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;

  // Session store
  sessionStore: session.SessionStore;

  //Settings operations
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createDefaultSettings(userId: number): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings | undefined>;
  updateUserNotifications(userId: number, notifications: Partial<UserSettings['notifications']>): Promise<UserSettings | undefined>;
  deleteUserAccount(userId: number): Promise<void>;
  getUserData(userId: number): Promise<{userData: User | null, settings: UserSettings | undefined}>;

}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizAttempts: Map<number, QuizAttempt>;
  private studySessions: Map<number, StudySession>;
  private notes: Map<number, Note>;
  private caseStudies: Map<number, CaseStudy>;
  private medicalNews: Map<number, MedicalNews>;
  private studyPlans: Map<number, StudyPlan>;
  private announcements: Map<number, Announcement>;
  private coupons: Map<number, Coupon>;
  private userSettings:Map<number, UserSettings>;

  private userCurrentId: number = 1;
  private quizAttemptCurrentId: number = 1;
  private studySessionCurrentId: number = 1;
  private noteCurrentId: number = 1;
  private caseStudyCurrentId: number = 1;
  private medicalNewsCurrentId: number = 1;
  private studyPlanCurrentId: number = 1;
  private announcementCurrentId: number = 1;
  private couponCurrentId: number = 1;
  private userSettingsCurrentId: number = 1;

  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.quizAttempts = new Map();
    this.studySessions = new Map();
    this.notes = new Map();
    this.caseStudies = new Map();
    this.medicalNews = new Map();
    this.studyPlans = new Map();
    this.announcements = new Map();
    this.coupons = new Map();
    this.userSettings = new Map();

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      subscriptionStatus: "free_trial", 
      tokenUsage: 0, 
      tokenLimit: 20000 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserTokenUsage(userId: number, tokenUsage: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      tokenUsage
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...userData
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Quiz methods
  async createQuizAttempt(insertQuizAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.quizAttemptCurrentId++;
    const completedAt = new Date();
    const quizAttempt: QuizAttempt = { ...insertQuizAttempt, id, completedAt };
    this.quizAttempts.set(id, quizAttempt);
    return quizAttempt;
  }

  async getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values())
      .filter(attempt => attempt.userId === userId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async getRecentQuizAttempts(userId: number, limit: number): Promise<QuizAttempt[]> {
    return (await this.getQuizAttemptsByUser(userId)).slice(0, limit);
  }

  // Study session methods
  async createStudySession(insertStudySession: InsertStudySession): Promise<StudySession> {
    const id = this.studySessionCurrentId++;
    const date = new Date();
    const studySession: StudySession = { ...insertStudySession, id, date };
    this.studySessions.set(id, studySession);
    return studySession;
  }

  async getStudySessionsByUser(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getStudyTimeByUserThisWeek(userId: number): Promise<number> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return Array.from(this.studySessions.values())
      .filter(session => session.userId === userId && session.date >= weekStart)
      .reduce((total, session) => total + session.duration, 0);
  }

  // Notes methods
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const note: Note = { ...insertNote, id, createdAt, updatedAt };
    this.notes.set(id, note);
    return note;
  }

  async getNotesByUser(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getRecentNotes(userId: number, limit: number): Promise<Note[]> {
    return (await this.getNotesByUser(userId)).slice(0, limit);
  }

  // Case studies methods
  async createCaseStudy(insertCaseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const id = this.caseStudyCurrentId++;
    const createdAt = new Date();
    const caseStudy: CaseStudy = { ...insertCaseStudy, id, createdAt };
    this.caseStudies.set(id, caseStudy);
    return caseStudy;
  }

  async getCaseStudiesByUser(userId: number): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values())
      .filter(caseStudy => caseStudy.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Medical news methods
  async createMedicalNews(insertMedicalNews: InsertMedicalNews): Promise<MedicalNews> {
    const id = this.medicalNewsCurrentId++;
    const publishedAt = new Date();
    const medicalNews: MedicalNews = { ...insertMedicalNews, id, publishedAt };
    this.medicalNews.set(id, medicalNews);
    return medicalNews;
  }

  async getMedicalNews(limit: number, offset: number): Promise<MedicalNews[]> {
    return Array.from(this.medicalNews.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
  }

  async getMedicalNewsByCategory(category: string, limit: number): Promise<MedicalNews[]> {
    return Array.from(this.medicalNews.values())
      .filter(news => news.category === category)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  // Study plan methods
  async createStudyPlan(insertStudyPlan: InsertStudyPlan): Promise<StudyPlan> {
    const id = this.studyPlanCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const studyPlan: StudyPlan = { ...insertStudyPlan, id, createdAt, updatedAt };
    this.studyPlans.set(id, studyPlan);
    return studyPlan;
  }

  async getStudyPlanByUser(userId: number): Promise<StudyPlan | undefined> {
    return Array.from(this.studyPlans.values())
      .find(plan => plan.userId === userId);
  }

  // Announcement methods
  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.announcementCurrentId++;
    const startDate = new Date();
    const announcement: Announcement = { ...insertAnnouncement, id, startDate };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    const now = new Date();
    return Array.from(this.announcements.values())
      .filter(announcement => 
        announcement.isActive && 
        announcement.startDate <= now && 
        (!announcement.endDate || announcement.endDate >= now)
      )
      .sort((a, b) => b.priority - a.priority);
  }

  // Coupon methods
  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = this.couponCurrentId++;
    const coupon: Coupon = { ...insertCoupon, id };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values())
      .find(coupon => coupon.code === code && coupon.isActive);
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return this.userSettings.get(userId);
  }

  async createDefaultSettings(userId: number): Promise<UserSettings> {
    const id = this.userSettingsCurrentId++;
    const defaultSettings: UserSettings = {
      id,
      userId,
      theme: 'light',
      language: 'english',
      textSize: 'medium',
      notifications: {
        pushEnabled: true,
        newCases: true,
        newsUpdates: true,
        studyReminders: true,
        subscriptionAlerts: true
      },
      dataSharing: true
    };
    this.userSettings.set(userId, defaultSettings);
    return defaultSettings;
  }

  async updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const currentSettings = await this.getUserSettings(userId);
    if (!currentSettings) return undefined;
    const updatedSettings: UserSettings = { ...currentSettings, ...settings };
    this.userSettings.set(userId, updatedSettings);
    return updatedSettings;
  }

  async updateUserNotifications(userId: number, notifications: Partial<UserSettings['notifications']>): Promise<UserSettings | undefined> {
    const currentSettings = await this.getUserSettings(userId);
    if (!currentSettings) return undefined;
    const updatedSettings: UserSettings = { ...currentSettings, notifications: { ...currentSettings.notifications, ...notifications } };
    this.userSettings.set(userId, updatedSettings);
    return updatedSettings;
  }

  async deleteUserAccount(userId: number): Promise<void> {
    this.users.delete(userId);
    this.userSettings.delete(userId);
    //Remove other related data as needed
  }

  async getUserData(userId: number): Promise<{userData: User | null, settings: UserSettings | undefined}> {
    const userData = this.users.get(userId) || null;
    const settings = this.userSettings.get(userId);
    return { userData, settings };
  }
}

export const storage = new MemStorage();

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db: Drizzle = drizzle({ client: pool, schema });

export async function getUserSettings(userId: number) {
  const settings = await db.query.userSettings.findFirst({
    where: (settings, { eq }) => eq(settings.userId, userId)
  });
  return settings || createDefaultSettings(userId);
}

export async function createDefaultSettings(userId: number) {
  return await db.insert(userSettings).values({
    userId,
    theme: 'light',
    language: 'english',
    textSize: 'medium',
    notifications: {
      pushEnabled: true,
      newCases: true,
      newsUpdates: true,
      studyReminders: true,
      subscriptionAlerts: true
    },
    dataSharing: true
  }).returning();
}

export async function updateUserSettings(userId: number, settings: any) {
  return await db.update(userSettings)
    .set(settings)
    .where(eq(userSettings.userId, userId))
    .returning();
}

export async function updateUserNotifications(userId: number, notifications: any) {
  return await db.update(userSettings)
    .set({ notifications })
    .where(eq(userSettings.userId, userId))
    .returning();
}

export async function deleteUserAccount(userId: number) {
  await db.transaction(async (tx) => {
    await tx.delete(userSettings).where(eq(userSettings.userId, userId));
    await tx.delete(users).where(eq(users.id, userId));
  });
}

export async function getUserData(userId: number) {
  const [userData, settings] = await Promise.all([
    db.query.users.findFirst({ where: (user, { eq }) => eq(user.id, userId) }),
    getUserSettings(userId)
  ]);
  return { userData, settings };
}