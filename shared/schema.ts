import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  subscriptionStatus: text("subscription_status").notNull().default("free_trial"),
  tokenUsage: integer("token_usage").notNull().default(0),
  tokenLimit: integer("token_limit").notNull().default(20000),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeTaken: integer("time_taken").notNull(), // in seconds
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Study sessions
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  duration: integer("duration").notNull(), // in minutes
  date: timestamp("date").defaultNow().notNull(),
});

// Notes
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Case studies
export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: json("content").notNull(),
  speciality: text("speciality").notNull(),
  difficulty: text("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Medical news
export const medicalNews = pgTable("medical_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  source: text("source"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  addedBy: integer("added_by").notNull(),
});

// Study plans
export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalExam: text("goal_exam").notNull(),
  timeLeft: integer("time_left").notNull(), // in days
  subjects: json("subjects").notNull(),
  plan: json("plan").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Announcements/Ads
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "announcement" or "ad"
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  addedBy: integer("added_by").notNull(),
});

// Coupons
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercentage: integer("discount_percentage").notNull(),
  maxUses: integer("max_uses").notNull(),
  currentUses: integer("current_uses").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
});

// MedFeed
export const medFeed = pgTable("med_feed", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sourceUrl: text("source_url").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull(),
  isSponsored: boolean("is_sponsored").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  views: integer("views").notNull().default(0),
});

export const bookmarkedNews = pgTable("bookmarked_news", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  newsItemId: integer("news_item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).omit({
  id: true
});

export const insertMedicalNewsSchema = createInsertSchema(medicalNews).omit({
  id: true
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).omit({
  id: true
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true
});

export const insertMedFeedSchema = createInsertSchema(medFeed).omit({id: true});
export const insertBookmarkedNewsSchema = createInsertSchema(bookmarkedNews).omit({id:true});

// Select types
export type User = typeof users.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type MedicalNews = typeof medicalNews.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  category: 'Exam' | 'Guidelines' | 'Research' | 'General';
  imageUrl?: string;
  publishedAt: Date;
  isSponsored: boolean;
  createdAt: Date;
  views: number;
}

export type BookmarkedNews = {
  id: string;
  userId: string;
  newsId: string;
  createdAt: Date;
}

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
export type InsertMedicalNews = z.infer<typeof insertMedicalNewsSchema>;
export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type InsertMedFeed = z.infer<typeof insertMedFeedSchema>;
export type InsertBookmarkedNews = z.infer<typeof insertBookmarkedNewsSchema>;