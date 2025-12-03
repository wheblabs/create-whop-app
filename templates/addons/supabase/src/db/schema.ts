import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  jsonb,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core'

// ============================================================================
// DATABASE SCHEMA EXAMPLES
// ============================================================================
// These are example tables that demonstrate best practices for WhopShip apps.
// Customize these to fit your application's needs.
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export const productTypeEnum = pgEnum('product_type', ['digital', 'physical', 'service'])
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived'])
export const orderStatusEnum = pgEnum('order_status', ['pending', 'completed', 'refunded', 'cancelled'])

// ============================================================================
// PRODUCTS
// ============================================================================
// Example product table for a storefront/marketplace app

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Link to Whop experience
  experienceId: text('experience_id').notNull(),

  // Product details
  title: text('title').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),

  // Product type and status
  type: productTypeEnum('type').notNull().default('digital'),
  status: productStatusEnum('status').notNull().default('draft'),

  // Images - store as array of URLs (uploaded via presigned URL)
  // IMPORTANT: Do NOT store base64 data URLs here - they're too large
  // and will cause Lambda payload limit errors. Always upload to
  // Supabase Storage and store the public URL.
  images: jsonb('images').$type<string[]>().default([]),

  // Optional metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// FILES (for digital products)
// ============================================================================
// Stores metadata about files uploaded to Supabase Storage

export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Link to product (optional - files can exist independently)
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),

  // File metadata
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type'),

  // Supabase Storage path (NOT the full URL)
  // Use this with storage.getSignedUrl() for secure downloads
  storagePath: text('storage_path').notNull(),

  // Uploader info
  uploadedBy: text('uploaded_by').notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================================================
// ORDERS
// ============================================================================
// Example orders table for tracking purchases

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Link to product
  productId: uuid('product_id')
    .references(() => products.id)
    .notNull(),

  // Buyer info (from Whop)
  userId: text('user_id').notNull(),
  email: text('email'),

  // Order details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),

  // Payment reference (e.g., Stripe payment intent ID)
  paymentRef: text('payment_ref'),

  // Order metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// SIMPLE TASKS (original example)
// ============================================================================
// A simple tasks table for getting started

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================
// Export inferred types for use in your application

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type Product = InferSelectModel<typeof products>
export type NewProduct = InferInsertModel<typeof products>

export type File = InferSelectModel<typeof files>
export type NewFile = InferInsertModel<typeof files>

export type Order = InferSelectModel<typeof orders>
export type NewOrder = InferInsertModel<typeof orders>

export type Task = InferSelectModel<typeof tasks>
export type NewTask = InferInsertModel<typeof tasks>
