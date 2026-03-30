import { relations } from "drizzle-orm/relations";
import {
  users,
  customers,
  suppliers,
  books,
  bundles,
  bundleItems,
  promoCodes,
  orders,
  orderItems,
  borrowings,
  payments,
  pointsHistory,
} from "./schema";

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  borrowings: many(borrowings),
  payments: many(payments),
  pointsHistory: many(pointsHistory),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [books.supplierId],
    references: [suppliers.id],
  }),
  orderItems: many(orderItems),
  borrowings: many(borrowings),
  bundleItems: many(bundleItems),
}));

export const bundlesRelations = relations(bundles, ({ many }) => ({
  bundleItems: many(bundleItems),
}));

export const bundleItemsRelations = relations(bundleItems, ({ one }) => ({
  bundle: one(bundles, {
    fields: [bundleItems.bundleId],
    references: [bundles.id],
  }),
  book: one(books, {
    fields: [bundleItems.bookId],
    references: [books.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  orderItems: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  book: one(books, {
    fields: [orderItems.bookId],
    references: [books.id],
  }),
}));

export const borrowingsRelations = relations(borrowings, ({ one }) => ({
  customer: one(customers, {
    fields: [borrowings.customerId],
    references: [customers.id],
  }),
  book: one(books, {
    fields: [borrowings.bookId],
    references: [books.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
}));

export const pointsHistoryRelations = relations(pointsHistory, ({ one }) => ({
  customer: one(customers, {
    fields: [pointsHistory.customerId],
    references: [customers.id],
  }),
}));
