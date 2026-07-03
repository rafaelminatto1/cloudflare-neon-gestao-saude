import { pgTable, text, timestamp, boolean, varchar, json } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const medicalRecords = pgTable('medical_records', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  dataExame: varchar('data_exame', { length: 50 }),
  categoria: varchar('categoria', { length: 100 }),
  nomeExame: varchar('nome_exame', { length: 255 }),
  resultado: text('resultado'),
  unidade: varchar('unidade', { length: 100 }),
  valorReferencia: text('valor_referencia'),
  interpretacao: varchar('interpretacao', { length: 100 }),
  medicoSolicitante: varchar('medico_solicitante', { length: 255 }),
  arquivoOrigem: text('arquivo_origem'),
  pdfStoragePath: text('pdf_storage_path'),
  observacoes: text('observacoes'),
  especialidadeMedica: varchar('especialidade_medica', { length: 255 }),
  grupoSistemico: varchar('grupo_sistemico', { length: 255 }),
  tags: text('tags'),
  impactoAutoimune: varchar('impacto_autoimune', { length: 50 }),
  isManualCategory: boolean('is_manual_category').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const medicalAppointments = pgTable('medical_appointments', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  time: varchar('time', { length: 50 }),
  doctor: varchar('doctor', { length: 255 }),
  specialty: varchar('specialty', { length: 255 }),
  location: text('location'),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull(),
  examCategory: varchar('exam_category', { length: 100 }),
  clinicAddress: text('clinic_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userPathologies = pgTable('user_pathologies', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  condition: varchar('condition', { length: 255 }).notNull(),
  dateDetected: varchar('date_detected', { length: 50 }).notNull(),
  status: varchar('status', { length: 100 }).notNull(),
  description: text('description'),
  isCongenital: boolean('is_congenital').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const continuousMedications = pgTable('continuous_medications', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 100 }).notNull(),
  frequency: varchar('frequency', { length: 100 }).notNull(),
  startDate: varchar('start_date', { length: 50 }).notNull(),
  endDate: varchar('end_date', { length: 50 }),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  sideEffects: text('side_effects'),
  dosageHistory: json('dosage_history'), // store as JSON string array
  createdAt: timestamp('created_at').defaultNow(),
});

export const examOrders = pgTable('exam_orders', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  doctorName: varchar('doctor_name', { length: 255 }),
  notes: text('notes'),
  pdfStoragePath: text('pdf_storage_path'),
  fileType: varchar('file_type', { length: 100 }),
  fileName: text('file_name'),
  isFulfilled: boolean('is_fulfilled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const customTimelineEvents = pgTable('custom_timeline_events', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const doctors = pgTable('doctors', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  crm: varchar('crm', { length: 50 }),
  uf: varchar('uf', { length: 10 }),
  specialty: varchar('specialty', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});
