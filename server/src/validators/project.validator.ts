import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  clientId: z.string().uuid('Invalid client ID format'),
  ownerId: z.string().uuid('Invalid owner ID format').optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  clientId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
});

export const projectFilterQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(9),
  search: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilterQuery = z.infer<typeof projectFilterQuerySchema>;
