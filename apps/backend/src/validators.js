import { z } from "zod";

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
  mapX: z.coerce.number().min(0).max(100),
  mapY: z.coerce.number().min(0).max(100),
  localFood: z.string().max(300).optional().or(z.literal("")),
  safetyNote: z.string().max(300).optional().or(z.literal("")),
  story: z.string().min(20).max(2000),
  title: z.string().min(3).max(120),
  travelTip: z.string().max(300).optional().or(z.literal("")),
  videoUrl: z.string().max(500).optional().or(z.literal("")),
});

export const commentSchema = z.object({
  body: z.string().min(2).max(500),
});
