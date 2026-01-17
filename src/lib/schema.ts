
import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const maneuvers = pgTable("manoeuvres", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const maneuverParticipations = pgTable("manoeuvre_participations", {
  id: serial("id").primaryKey(),
  maneuverId: integer("manoeuver_id").notNull(),
  agentId: integer("agent_id").notNull(),
  isPresent: boolean("is_present").notNull().default(false),
  arrivalTime: text("arrival_time"), // format "HH:mm"
  departureTime: text("departure_time"), // format "HH:mm"
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  matricule: text("matricule").notNull().unique(), // e.g., #SP2401
  rank: text("rank").notNull(), // e.g., Caporal, Sergent, Lieutenant, Sapeur
  phone: text("phone"),
  photoUrl: text("photo_url"),
  yearlyTrainingGoal: integer("yearly_training_goal").notNull().default(35),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trainings = pgTable("trainings", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(), // e.g., FOR-001
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("autre"), // secourisme, opérations diverses, incendie, autre
  documents: text("documents").array(), // List of document URLs or names
  date: date("date"),
  durationHours: integer("duration_hours"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const participations = pgTable("participations", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  trainingId: integer("training_id").notNull(),
  status: text("status").notNull().default("present"), // present, absent, excused
  validationStatus: text("validation_status").notNull().default("validated"), // validated (green), pending (orange), failed (red)
  customHours: integer("custom_hours"), // Overrides training duration
  completionDate: date("completion_date"), // Overrides training date
  supervisor: text("supervisor"), // Who validated/supervised
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const agentsRelations = relations(agents, ({ many }) => ({
  participations: many(participations),
}));

export const trainingsRelations = relations(trainings, ({ many }) => ({
  participations: many(participations),
}));

export const participationsRelations = relations(participations, ({ one }) => ({
  agent: one(agents, {
    fields: [participations.agentId],
    references: [agents.id],
  }),
  training: one(trainings, {
    fields: [participations.trainingId],
    references: [trainings.id],
  }),
}));

export const maneuversRelations = relations(maneuvers, ({ many }) => ({
  participations: many(maneuverParticipations),
}));

export const maneuverParticipationsRelations = relations(maneuverParticipations, ({ one }) => ({
  maneuver: one(maneuvers, {
    fields: [maneuverParticipations.maneuverId],
    references: [maneuvers.id],
  }),
  agent: one(agents, {
    fields: [maneuverParticipations.agentId],
    references: [agents.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, createdAt: true });
export const insertTrainingSchema = createInsertSchema(trainings).omit({ id: true, createdAt: true });
export const insertParticipationSchema = createInsertSchema(participations).omit({ id: true, createdAt: true });
export const insertManeuverSchema = createInsertSchema(maneuvers).omit({ id: true, createdAt: true });
export const insertManeuverParticipationSchema = createInsertSchema(maneuverParticipations).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Training = typeof trainings.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;

export type Participation = typeof participations.$inferSelect;
export type InsertParticipation = z.infer<typeof insertParticipationSchema>;

export type Maneuver = typeof maneuvers.$inferSelect;
export type InsertManeuver = z.infer<typeof insertManeuverSchema>;

export type ManeuverParticipation = typeof maneuverParticipations.$inferSelect;
export type InsertManeuverParticipation = z.infer<typeof insertManeuverParticipationSchema>;

// API Responses
export type AgentWithStats = Agent & {
  totalHours: number;
  trainingCount: number;
  progressPercentage: number;
};

export type AgentResponse = Agent;
export type TrainingResponse = Training;
