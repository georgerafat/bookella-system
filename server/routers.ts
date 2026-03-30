import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import {
  books,
  customers,
  orders,
  borrowings,
  payments,
  orderItems,
  pointsHistory,
  promoCodes,
  bundles,
  bundleItems,
  suppliers,
} from "../drizzle/schema";
import { eq, sql, desc, and } from "drizzle-orm";

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
  }),

  books: router({
    list: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getBooks(input);
      }),
    create: adminProcedure
      .input(z.object({
        bookId: z.string().optional(),
        title: z.string(),
        author: z.string().optional(),
        category: z.string().optional(),
        series: z.string().optional(),
        printType: z.enum(["original", "high_copy"]).optional(),
        purchasePrice: z.string(),
        sellingPrice: z.string(),
        quantity: z.number(),
        supplierId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const d = await db.getDb();
        if (!d) throw new Error("Database not available");
        // @ts-ignore
        const result = await d.insert(books).values(input);
        return { success: true, id: result[0].insertId };
      }),
  }),

  suppliers: router({
    list: adminProcedure.query(async () => {
      const d = await db.getDb();
      if (!d) return [];
      return await d.select().from(suppliers);
    }),
    inventoryNeeds: adminProcedure.query(async () => {
      const d = await db.getDb();
      if (!d) return [];
      // Books with quantity <= 5
      return await d.select().from(books).where(sql`${books.quantity} <= 5`);
    }),
  }),

  customers: router({
    list: adminProcedure
      .input(z.object({
        query: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getCustomers(input);
      }),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const d = await db.getDb();
        if (!d) throw new Error("Database not available");
        const result = await d.select().from(customers).where(eq(customers.id, input.id)).limit(1);
        return result[0];
      }),
  }),

  orders: router({
    list: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        governorate: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getOrders(input);
      }),
    create: adminProcedure
      .input(z.object({
        customerId: z.number(),
        items: z.array(z.object({
          bookId: z.number(),
          quantity: z.number(),
          priceAtPurchase: z.string(),
        })),
        shippingCost: z.string(),
        shippingProfit: z.string(),
        promoCode: z.string().optional(),
        governorate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const d = await db.getDb();
        if (!d) throw new Error("Database not available");

        const orderId = `ORD-${Date.now()}`;
        let totalAmount = 0;
        input.items.forEach(item => {
          totalAmount += Number(item.priceAtPurchase) * item.quantity;
        });

        let discountAmount = 0;
        if (input.promoCode) {
          const promo = await d.select().from(promoCodes).where(eq(promoCodes.code, input.promoCode)).limit(1);
          if (promo.length > 0 && promo[0].isActive) {
            if (promo[0].discountType === "percentage") {
              discountAmount = (totalAmount * Number(promo[0].value)) / 100;
            } else {
              discountAmount = Number(promo[0].value);
            }
          }
        }

        const finalPrice = totalAmount + Number(input.shippingCost) - discountAmount;

        // @ts-ignore
        const [orderResult] = await d.insert(orders).values({
          orderId,
          customerId: input.customerId,
          totalAmount: totalAmount.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          shippingCost: input.shippingCost,
          shippingProfit: input.shippingProfit,
          finalPrice: finalPrice.toFixed(2),
          remainingAmount: finalPrice.toFixed(2),
          governorate: input.governorate,
        });

        const orderDbId = (orderResult as any).insertId;

        for (const item of input.items) {
          // @ts-ignore
          await d.insert(orderItems).values({
            orderId: orderDbId,
            bookId: item.bookId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          });

          // Update book quantity
          // @ts-ignore
          await d.update(books)
            .set({ quantity: sql`${books.quantity} - ${item.quantity}` })
            .where(eq(books.id, item.bookId));
        }

        // Calculate and add points (e.g., 1 point for every 10 EGP spent)
        const earnedPoints = Math.floor(finalPrice / 10);
        // @ts-ignore
        await d.update(customers)
          .set({
            points: sql`${customers.points} + ${earnedPoints}`,
            totalSpent: sql`${customers.totalSpent} + ${finalPrice.toFixed(2)}`,
            remainingDebt: sql`${customers.remainingDebt} + ${finalPrice.toFixed(2)}`,
          })
          .where(eq(customers.id, input.customerId));

        // @ts-ignore
        await d.insert(pointsHistory).values({
          customerId: input.customerId,
          pointsChanged: earnedPoints,
          reason: `نقاط عن طلب رقم ${orderId}`,
        });

        return { success: true, orderId, id: orderDbId };
      }),
    recordPayment: adminProcedure
      .input(z.object({
        orderId: z.number(),
        userId: z.number(),
        amount: z.number(),
        paymentMethod: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const d = await db.getDb();
        if (!d) throw new Error("Database not available");

        // Record the payment
        // @ts-ignore
        await d.insert(payments).values({
          orderId: input.orderId,
          customerId: input.userId,
          amount: input.amount.toFixed(2),
          paymentMethod: input.paymentMethod,
        });

        // Update the order remaining amount
        const order = await d.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
        if (order.length === 0) throw new Error("Order not found");

        const newRemaining = Number(order[0].remainingAmount) - input.amount;
        const newPaymentStatus = newRemaining <= 0 ? "paid" : "partial";

        // @ts-ignore
        await d.update(orders)
          .set({
            remainingAmount: Math.max(0, newRemaining).toFixed(2),
            paymentStatus: newPaymentStatus,
          })
          .where(eq(orders.id, input.orderId));

        // Update customer debt
        // @ts-ignore
        await d.update(customers)
          .set({
            totalPaid: sql`${customers.totalPaid} + ${input.amount.toFixed(2)}`,
            remainingDebt: sql`${customers.remainingDebt} - ${input.amount.toFixed(2)}`,
          })
          .where(eq(customers.id, input.userId));

        return { success: true, remainingAmount: Math.max(0, newRemaining) };
      }),
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        const d = await db.getDb();
        if (!d) throw new Error("Database not available");
        // @ts-ignore
        await d.update(orders).set({ orderStatus: input.status }).where(eq(orders.id, input.id));
        return { success: true };
      }),
  }),

  borrowing: router({
    list: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getBorrowings(input);
      }),
    create: adminProcedure
      .input(z.object({
        customerId: z.number(),
        bookId: z.number(),
        expectedReturnDate: z.date(),
      }))
      .mutation(async ({ input }) => {
        const d = await db.getDb();
        if (!d) throw new Error("Database not available");
        const borrowId = `BOR-${Date.now()}`;
        // @ts-ignore
        await d.insert(borrowings).values({
          borrowId,
          customerId: input.customerId,
          bookId: input.bookId,
          expectedReturnDate: input.expectedReturnDate,
        });
        return { success: true, borrowId };
      }),
  }),

  promoCodes: router({
    list: adminProcedure.query(async () => {
      const d = await db.getDb();
      if (!d) return [];
      return await d.select().from(promoCodes);
    }),
    create: adminProcedure
      .input(z.object({
        code: z.string(),
        discountType: z.enum(["percentage", "fixed"]),
        value: z.string(),
        minOrderValue: z.string().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const d = await db.getDb();
        if (!d) throw new Error("Database not available");
        // @ts-ignore
        await d.insert(promoCodes).values(input);
        return { success: true };
      }),
  }),

  dashboard: router({
    stats: adminProcedure.query(async () => {
      const d = await db.getDb();
      if (!d) throw new Error("Database not available");

      // @ts-ignore
      const [orderStats] = await d.select({
        totalRevenue: sql<string>`sum(${orders.finalPrice})`,
        totalOrders: sql<number>`count(*)`,
        totalShippingProfit: sql<string>`sum(${orders.shippingProfit})`,
      }).from(orders);

      // @ts-ignore
      const [bookStats] = await d.select({
        totalBooks: sql<number>`count(*)`,
        lowStock: sql<number>`sum(case when ${books.quantity} <= 5 then 1 else 0 end)`,
      }).from(books);

      // @ts-ignore
      const [customerStats] = await d.select({
        totalCustomers: sql<number>`count(*)`,
        totalDebt: sql<string>`sum(${customers.remainingDebt})`,
      }).from(customers);

      return {
        revenue: orderStats?.totalRevenue || "0.00",
        orders: orderStats?.totalOrders || 0,
        shippingProfit: orderStats?.totalShippingProfit || "0.00",
        books: bookStats?.totalBooks || 0,
        lowStock: bookStats?.lowStock || 0,
        customers: customerStats?.totalCustomers || 0,
        debt: customerStats?.totalDebt || "0.00",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
