
import { z } from 'zod';
import { insertAgentSchema, insertTrainingSchema, insertParticipationSchema, agents, trainings, participations } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  agents: {
    list: {
      method: 'GET' as const,
      path: '/api/agents',
      input: z.object({
        search: z.string().optional(),
        rank: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof agents.$inferSelect & { totalHours: number; trainingCount: number }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/agents/:id',
      responses: {
        200: z.custom<typeof agents.$inferSelect & { participations: (typeof participations.$inferSelect & { training: typeof trainings.$inferSelect })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/agents',
      input: insertAgentSchema,
      responses: {
        201: z.custom<typeof agents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  trainings: {
    list: {
      method: 'GET' as const,
      path: '/api/trainings',
      responses: {
        200: z.array(z.custom<typeof trainings.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trainings',
      input: insertTrainingSchema,
      responses: {
        201: z.custom<typeof trainings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  participations: {
    create: {
      method: 'POST' as const,
      path: '/api/participations',
      input: insertParticipationSchema,
      responses: {
        201: z.custom<typeof participations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  }
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
