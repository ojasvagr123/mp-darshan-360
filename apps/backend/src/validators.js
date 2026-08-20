import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: z.string().min(6).max(80),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const placeSchema = z.object({
  accessibility: z.string().max(300).optional().or(z.literal("")),
  audioGuide: z.string().max(2500).optional().or(z.literal("")),
  bestTime: z.string().max(120).optional().or(z.literal("")),
  category: z.string().min(2).max(50),
  district: z.string().min(2).max(80),
  durationMinutes: z.coerce.number().int().min(5).max(240).optional(),
  history: z.string().min(20).max(2500),
  latitude: z.coerce.number(),
  localFood: z.string().max(300).optional().or(z.literal("")),
  longitude: z.coerce.number(),
  safetyNote: z.string().max(300).optional().or(z.literal("")),
  story: z.string().min(20).max(2000),
  title: z.string().min(3).max(120),
  travelTip: z.string().max(300).optional().or(z.literal("")),
  videoUrl: z.string().max(500).optional().or(z.literal("")),
});

export const commentSchema = z.object({
  body: z.string().min(2).max(500),
});
