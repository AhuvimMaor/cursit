import { z } from 'zod';

export const studentSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Student = z.infer<typeof studentSchema>;

export const missionSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  maxScore: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Mission = z.infer<typeof missionSchema>;

export const scoreSchema = z.object({
  id: z.number(),
  studentId: z.number(),
  missionId: z.number(),
  score: z.number(),
  comment: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Score = z.infer<typeof scoreSchema>;
